import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import AuthShell from "@/components/layout/AuthShell";
import { toast } from "sonner";

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const redirect = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (!loading && user) navigate(redirect, { replace: true });
  }, [user, loading, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    if (data.user) {
      const { data: profile } = await supabase.from("user_profiles").select("is_admin,full_name,username").eq("id", data.user.id).single();
      login({
        id: data.user.id,
        email: data.user.email!,
        username: profile?.username || data.user.email!.split("@")[0],
        full_name: profile?.full_name,
        is_admin: profile?.is_admin ?? false,
      });
      navigate(redirect, { replace: true });
    }
  };

  return (
    <AuthShell>
      <div className="glass-strong rounded-3xl p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-nuvia-forest-light to-nuvia-forest flex items-center justify-center">
              <span className="font-display text-nuvia-ivory text-sm font-bold">N</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-nuvia-champagne ring-2 ring-nuvia-ivory/80" />
            </div>
            <span className="font-display text-xl font-bold text-nuvia-ink">Nuvia</span>
          </Link>
          <h1 className="font-display text-2xl text-nuvia-ink font-bold">Welcome back</h1>
          <p className="text-sm text-nuvia-brown mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-nuvia">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input-nuvia"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-nuvia mb-0">Password</label>
              <Link to="/auth/forgot-password" className="text-xs text-nuvia-brown hover:text-nuvia-ink">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className="input-nuvia pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nuvia-brown hover:text-nuvia-ink"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-nuvia-brown mt-6">
          Don't have an account?{" "}
          <Link to="/auth/sign-up" className="font-semibold text-nuvia-forest hover:underline">Create account</Link>
        </p>

      </div>
    </AuthShell>
  );
}
