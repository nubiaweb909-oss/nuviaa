import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import AuthShell from "@/components/layout/AuthShell";
import { toast } from "sonner";

/**
 * Sign-Up Flow:
 *  Step 1 — "details": User enters full name, email, and password
 *  Step 2 — "otp":     A verification code is sent to the email; user enters it
 *  (done)              Account is verified and the user is logged in automatically
 *
 * On submit of step 1 we call signInWithOtp which creates the user AND sends the code.
 * After OTP verification the user is already signed in via Supabase session.
 * We then set the password + metadata via updateUser.
 */

type Step = "details" | "otp";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();

  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // ─── Step 1: Collect details, check for existing account, send OTP ────────
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    // Check if this email already has a profile (= existing account)
    // We use the sign-in method to probe; if it returns "Email not confirmed"
    // or "Invalid login credentials", we interpret accordingly.
    // A cleaner approach: attempt signInWithPassword briefly.
    // If it returns "Email not confirmed" → email exists but not verified yet.
    // If it returns "Invalid login credentials" → email exists with a different password.
    // Any success → email + password combination already exists → direct to sign-in.
    const { error: probeError } = await supabase.auth.signInWithPassword({
      email,
      password: "__nuvia_probe_unlikely_password__",
    });

    if (probeError) {
      const msg = probeError.message.toLowerCase();
      // "invalid login credentials" means email exists (wrong password used for probe)
      // "email not confirmed" means account exists but unverified
      if (
        msg.includes("invalid login credentials") ||
        msg.includes("email not confirmed") ||
        msg.includes("invalid credentials")
      ) {
        // Could be existing account with different password OR truly new user
        // Supabase returns "Invalid login credentials" for BOTH wrong password on existing
        // accounts AND non-existent accounts — we can't distinguish without server-side check.
        // Safe approach: proceed with OTP signup; Supabase will handle dedup gracefully.
        // If the email truly exists and is verified, signInWithOtp below will succeed but
        // updateUser will set a new password (re-verification flow).
        // However, to give a clear UX we check the user_profiles table directly:
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (profile) {
          toast.error(
            "This email is already registered. Please sign in instead.",
            { duration: 5000 }
          );
          setSubmitting(false);
          return;
        }
      }
    } else {
      // signInWithPassword succeeded → account already exists and password matches
      // Sign out the probe session immediately
      await supabase.auth.signOut();
      toast.error("This email is already registered. Please sign in instead.", {
        duration: 5000,
      });
      setSubmitting(false);
      return;
    }

    // Send OTP verification code
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: fullName,
          username: email.split("@")[0],
        },
      },
    });

    if (otpError) {
      // If Supabase says the user already exists via OTP path
      if (
        otpError.message.toLowerCase().includes("already registered") ||
        otpError.message.toLowerCase().includes("user already exists")
      ) {
        toast.error("This email is already registered. Please sign in instead.", {
          duration: 5000,
        });
      } else {
        toast.error(otpError.message);
      }
      setSubmitting(false);
      return;
    }

    toast.success(`Verification code sent to ${email}`);
    setStep("otp");
    setResendCooldown(60);
    setSubmitting(false);
  };

  // ─── Step 2: Verify OTP → set password + metadata → log in ───────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setSubmitting(true);

    // Verify the OTP — this creates + signs in the Supabase session
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (verifyError) {
      toast.error(verifyError.message || "Invalid or expired code. Please try again.");
      setSubmitting(false);
      return;
    }

    if (!verifyData.user) {
      toast.error("Verification failed. Please try again.");
      setSubmitting(false);
      return;
    }

    // Now set the password + user metadata (full_name, username) on the verified account
    const username = email.split("@")[0];
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      password,
      data: {
        full_name: fullName,
        username,
      },
    });

    if (updateError) {
      // Non-critical: account is verified; password setting failed
      // Log the user in anyway and show a soft warning
      console.error("[Nuvia] updateUser error:", updateError.message);
      toast.warning("Account created, but password setup failed. Please use 'Forgot password' to set a password.");
    }

    const authUser = updateData?.user ?? verifyData.user;
    login({
      id: authUser.id,
      email: authUser.email!,
      username,
      full_name: fullName,
      is_admin: false,
    });

    toast.success("Account created successfully! Welcome to Nuvia.");
    navigate("/dashboard", { replace: true });
  };

  // ─── Resend OTP ───────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("New verification code sent.");
      setResendCooldown(60);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const stepIndex = step === "details" ? 0 : 1;

  return (
    <AuthShell>
      <div className="glass-strong rounded-3xl p-7 sm:p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-5">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center">
                <span className="font-display text-nuvia-ivory text-sm font-bold">N</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-nuvia-champagne ring-2 ring-nuvia-ivory/80" />
              </div>
              <span className="font-display text-xl font-bold text-nuvia-ink">Nuvia</span>
            </Link>
            <h1 className="font-display text-2xl text-nuvia-ink font-bold">Create your account</h1>
            <p className="text-sm text-nuvia-brown mt-1">
              {step === "details" ? "Fill in your details to get started" : "Verify your email address"}
            </p>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center gap-2 mb-7">
            {(["details", "otp"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    stepIndex > i
                      ? "bg-nuvia-moss text-nuvia-ivory"
                      : stepIndex === i
                      ? "bg-nuvia-forest text-nuvia-ivory"
                      : "bg-nuvia-surface text-nuvia-brown"
                  }`}
                >
                  {stepIndex > i ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < 1 && (
                  <div
                    className={`flex-1 h-px transition-all ${
                      stepIndex > i ? "bg-nuvia-moss" : "bg-nuvia-surface"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Details ─────────────────────────────────────── */}
            {step === "details" && (
              <motion.form
                key="details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleDetailsSubmit}
                className="space-y-4"
              >
                {/* Full name */}
                <div>
                  <label className="label-nuvia">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    autoComplete="name"
                    className="input-nuvia"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label-nuvia">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="input-nuvia"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="label-nuvia">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="input-nuvia pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-nuvia-brown hover:text-nuvia-espresso transition-colors"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="label-nuvia">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      autoComplete="new-password"
                      className={`input-nuvia pr-10 ${
                        confirmPassword && confirmPassword !== password
                          ? "border-red-400 focus:ring-red-400/20"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-nuvia-brown hover:text-nuvia-espresso transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !email ||
                    !fullName ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword
                  }
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending code…</>
                  ) : (
                    "Continue — Send Verification Code"
                  )}
                </button>
              </motion.form>
            )}

            {/* ── Step 2: OTP Verification ─────────────────────────── */}
            {step === "otp" && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleOtpSubmit}
                className="space-y-4"
              >
                {/* Info box */}
                <div className="bg-nuvia-beige-light border border-nuvia-surface rounded-xl px-4 py-3">
                  <p className="text-sm text-nuvia-espresso font-medium mb-0.5">Check your inbox</p>
                  <p className="text-xs text-nuvia-brown">
                    We sent a {" "}
                    <span className="font-medium">4-digit verification code</span>
                    {" "}to{" "}
                    <span className="font-medium text-nuvia-espresso">{email}</span>.
                  </p>
                </div>

                {/* OTP input */}
                <div>
                  <label className="label-nuvia">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="0 0 0 0"
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    className="input-nuvia text-center text-2xl font-mono tracking-[0.5em] py-4"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || otp.length < 4}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                  ) : (
                    "Verify & Create Account"
                  )}
                </button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setStep("details"); setOtp(""); }}
                    className="text-xs text-nuvia-brown hover:text-nuvia-espresso transition-colors"
                  >
                    ← Change details
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="text-xs text-nuvia-brown hover:text-nuvia-espresso transition-colors disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-nuvia-brown mt-6">
            Already have an account?{" "}
            <Link to="/auth/sign-in" className="font-semibold text-nuvia-forest hover:underline">
              Sign in
            </Link>
          </p>
      </div>
    </AuthShell>
  );
}
