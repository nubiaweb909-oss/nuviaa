import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminGetSettings, adminUpdateSettings } from "@/services/settingsService";
import type { SiteSetting } from "@/types";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetSettings().then((s) => {
      setSettings(s);
      const vals: Record<string, string> = {};
      s.forEach((x) => { vals[x.key] = x.value || ""; });
      setForm(vals);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await adminUpdateSettings(form);
    toast.success("Settings saved");
    setSaving(false);
  };

  const displayKeys = [
    { key: "site_name", label: "Site Name", type: "text" },
    { key: "site_tagline", label: "Tagline", type: "text" },
    { key: "whatsapp_url", label: "WhatsApp URL", type: "url" },
    { key: "telegram_url", label: "Telegram URL", type: "url" },
    { key: "support_email", label: "Support Email", type: "email" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-display text-2xl text-nuvia-ink font-bold">Site Settings</h1>
          <p className="text-sm text-nuvia-brown mt-1">Configure global marketplace settings</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General */}
          <div className="card-nuvia rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-nuvia-espresso">General</h2>
            {displayKeys.map((field) => (
              <div key={field.key}>
                <label className="label-nuvia">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key] || ""}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="input-nuvia"
                />
              </div>
            ))}
          </div>

          {/* Currency info (read-only notice) */}
          <div className="card-nuvia rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold text-nuvia-espresso">Currency</h2>
            <div className="flex items-center gap-3 bg-nuvia-beige-light rounded-xl px-4 py-3">
              <span className="text-xl text-nuvia-espresso font-bold">₦</span>
              <div>
                <p className="text-sm font-medium text-nuvia-espresso">Nigerian Naira (NGN)</p>
                <p className="text-xs text-nuvia-brown">
                  All product, rental and domain prices are set and displayed in Naira. Flutterwave charges the exact NGN amount — no conversion.
                </p>
              </div>
            </div>
          </div>

          {/* Flutterwave */}
          <div className="bg-nuvia-champagne/20 border border-nuvia-champagne/50 rounded-2xl p-5">
            <h3 className="font-semibold text-[#7A5A2E] mb-2">Flutterwave Payment Configuration</h3>
            <p className="text-xs text-[#7A5A2E] mb-3">
              Flutterwave credentials are stored securely as Edge Function secrets. To configure:
            </p>
            <ol className="text-xs text-[#7A5A2E] space-y-1 list-decimal list-inside">
              <li>Go to Cloud → Secrets in the right panel</li>
              <li>Ensure FLW_PUBLIC_KEY, FLW_SECRET_KEY, FLW_ENCRYPTION_KEY, FLW_WEBHOOK_SECRET are set</li>
              <li>Mark configured below once keys are added</li>
            </ol>
            <div className="mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form["flw_configured"] === "true"}
                  onChange={(e) => setForm({ ...form, flw_configured: e.target.checked ? "true" : "false" })}
                  className="w-4 h-4 accent-nuvia-forest"
                />
                <span className="text-sm text-[#7A5A2E]">Mark Flutterwave as configured</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save All Settings"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
