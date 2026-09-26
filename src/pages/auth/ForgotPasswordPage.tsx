import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AuthShell from "@/components/layout/AuthShell";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
    setSubmitting(false);
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
            <h1 className="font-display text-2xl text-nuvia-ink font-bold">Reset your password</h1>
            <p className="text-xs text-nuvia-brown mt-2 max-w-xs mx-auto">
              Enter your email and we'll send you a secure link to reset your password.
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#AFC79B]/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-nuvia-moss" />
              </div>
              <p className="text-nuvia-brown mb-6">Check your email for a password reset link. It may take a minute to arrive.</p>
              <Link to="/auth/sign-in" className="btn-primary w-full justify-center">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-nuvia">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="input-nuvia" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send Reset Link"}
              </button>
              <Link to="/auth/sign-in" className="btn-ghost w-full text-sm justify-center block text-center">Back to Sign In</Link>
            </form>
          )}
      </div>
    </AuthShell>
  );
}
