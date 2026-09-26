import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AuthShell from "@/components/layout/AuthShell";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    toast.success("Password updated successfully");
    navigate("/auth/sign-in");
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
            <h1 className="font-display text-2xl text-nuvia-ink font-bold">Set new password</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-nuvia">New Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="input-nuvia pr-10" placeholder="At least 6 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-nuvia-brown">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label-nuvia">Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="input-nuvia" placeholder="Repeat your password" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : "Update Password"}
            </button>
          </form>
      </div>
    </AuthShell>
  );
}
