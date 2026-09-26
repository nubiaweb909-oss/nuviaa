import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
      .eq("id", user!.id);
    const { error: authError } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (profileError || authError) {
      toast.error("Failed to update profile");
    } else {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("Profile updated");
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const current = (form.elements.namedItem("current") as HTMLInputElement).value;
    const newPass = (form.elements.namedItem("new") as HTMLInputElement).value;
    if (newPass.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user!.email, password: current });
    if (signInError) { toast.error("Current password is incorrect"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) toast.error(error.message);
    else { toast.success("Password updated successfully"); form.reset(); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-display text-2xl text-nuvia-espresso">Profile Settings</h1>
          <p className="text-sm text-nuvia-brown mt-1">Manage your account information</p>
        </div>

        {/* Profile Info */}
        <div className="card-nuvia rounded-2xl p-6">
          <h2 className="font-semibold text-nuvia-espresso mb-5">Personal Information</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label-nuvia">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-nuvia" placeholder="Your full name" />
            </div>
            <div>
              <label className="label-nuvia">Email Address</label>
              <input type="email" value={user?.email || ""} disabled className="input-nuvia opacity-60 cursor-not-allowed" />
              <p className="text-xs text-nuvia-brown mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label-nuvia">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-nuvia" placeholder="+234 800 000 0000" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card-nuvia rounded-2xl p-6">
          <h2 className="font-semibold text-nuvia-espresso mb-5">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label-nuvia">Current Password</label>
              <input name="current" type="password" required className="input-nuvia" placeholder="Your current password" />
            </div>
            <div>
              <label className="label-nuvia">New Password</label>
              <input name="new" type="password" required className="input-nuvia" placeholder="At least 6 characters" />
            </div>
            <button type="submit" className="btn-secondary">Update Password</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
