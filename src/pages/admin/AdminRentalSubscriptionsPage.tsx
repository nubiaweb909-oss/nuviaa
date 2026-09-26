import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, CheckCircle, Clock, Edit, Eye, EyeOff,
  Globe, MessageCircle, Plus, Trash2, XCircle, RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminGetSubscriptions, adminUpdateSubscription } from "@/services/rentalService";
import type { RentalSubscription } from "@/types";
import { formatDate, formatPrice, timeRemaining, getStatusColor } from "@/lib/utils";
import { PLAN_LABELS } from "@/services/rentalService";
import { toast } from "sonner";

function SubscriptionDetailModal({
  sub,
  onClose,
  onSave,
}: {
  sub: RentalSubscription;
  onClose: () => void;
  onSave: (updated: RentalSubscription) => void;
}) {
  const [form, setForm] = useState({
    status: sub.status,
    access_url: sub.access_url || "",
    access_notes: sub.access_notes || "",
    admin_notes: sub.admin_notes || "",
    start_date: sub.start_date ? sub.start_date.slice(0, 10) : "",
    end_date: sub.end_date ? sub.end_date.slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updated = await adminUpdateSubscription(sub.id, {
      status: form.status as RentalSubscription["status"],
      access_url: form.access_url || undefined,
      access_notes: form.access_notes || undefined,
      admin_notes: form.admin_notes || undefined,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
      end_date: form.end_date ? new Date(form.end_date + "T23:59:59").toISOString() : undefined,
    });
    toast.success("Subscription updated");
    onSave(updated);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-nuvia-ivory rounded-2xl w-full max-w-lg shadow-nuvia-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-nuvia-surface">
          <h3 className="font-display text-lg text-nuvia-espresso">Manage Subscription</h3>
          <button onClick={onClose} className="p-2 text-nuvia-brown hover:text-nuvia-espresso rounded-lg hover:bg-nuvia-surface/60 transition-all">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="font-medium text-nuvia-espresso">{sub.rental_product?.name}</p>
            <p className="text-xs text-nuvia-brown mt-0.5">{PLAN_LABELS[sub.plan]} · {formatPrice(sub.usd_price)}</p>
          </div>

          <div>
            <label className="label-nuvia">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RentalSubscription["status"] })}
              className="input-nuvia">
              {["pending", "active", "expired", "cancelled", "suspended"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-nuvia">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="input-nuvia" />
            </div>
            <div>
              <label className="label-nuvia">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="input-nuvia" />
            </div>
          </div>

          <div>
            <label className="label-nuvia">Customer Access URL</label>
            <input type="url" value={form.access_url} onChange={(e) => setForm({ ...form, access_url: e.target.value })}
              placeholder="https://their-rental-site.com" className="input-nuvia" />
          </div>

          <div>
            <label className="label-nuvia">Access Notes (shown to customer)</label>
            <textarea value={form.access_notes} onChange={(e) => setForm({ ...form, access_notes: e.target.value })}
              rows={3} placeholder="Login credentials, how to use, etc." className="input-nuvia resize-none" />
          </div>

          <div>
            <label className="label-nuvia">Admin Notes (internal only)</label>
            <textarea value={form.admin_notes} onChange={(e) => setForm({ ...form, admin_notes: e.target.value })}
              rows={2} placeholder="Internal notes…" className="input-nuvia resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-nuvia-surface flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRentalSubscriptionsPage() {
  const [subs, setSubs] = useState<RentalSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<RentalSubscription | null>(null);

  useEffect(() => {
    adminGetSubscriptions().then((s) => { setSubs(s); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? subs : subs.filter((s) => s.status === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-nuvia-ink font-bold">Rental Subscriptions</h1>
            <p className="text-sm text-nuvia-brown mt-1">{subs.length} total subscriptions</p>
          </div>
          <Link to="/admin/rental-products" className="btn-secondary text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Rental Products
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "active", "expired", "cancelled", "suspended"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${filter === s ? "bg-nuvia-forest text-nuvia-ivory" : "bg-nuvia-ivory border border-nuvia-surface text-nuvia-brown hover:border-nuvia-brown"}`}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 card-nuvia rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="card-nuvia rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="border-b border-nuvia-surface bg-nuvia-beige-light/50">
                  <tr>
                    {["Product", "Customer", "Plan", "Price", "Status", "Expiry", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-nuvia-brown uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => {
                    const { label, urgent } = sub.end_date ? timeRemaining(sub.end_date) : { label: "—", urgent: false };
                    return (
                      <tr key={sub.id} className="border-b border-nuvia-surface last:border-0 hover:bg-nuvia-beige-light/50">
                        <td className="px-4 py-3 text-sm font-medium text-nuvia-espresso max-w-[140px] truncate">
                          {sub.rental_product?.name || sub.rental_product_id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-xs text-nuvia-brown font-mono">{sub.user_id.slice(0, 8)}…</td>
                        <td className="px-4 py-3 text-xs text-nuvia-espresso">{PLAN_LABELS[sub.plan]}</td>
                        <td className="px-4 py-3 text-sm font-medium text-nuvia-espresso">{formatPrice(sub.usd_price)}</td>
                        <td className="px-4 py-3">
                          <span className={`badge-nuvia border text-xs capitalize ${getStatusColor(sub.status)}`}>{sub.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {sub.end_date ? (
                            <span className={`text-xs ${urgent && sub.status === "active" ? "text-red-600 font-medium" : "text-nuvia-brown"}`}>
                              {formatDate(sub.end_date)}
                              {sub.status === "active" && <span className="ml-1 text-[10px] opacity-70">({label})</span>}
                            </span>
                          ) : <span className="text-xs text-nuvia-brown">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setEditing(sub)}
                            className="p-1.5 rounded-lg hover:bg-nuvia-surface transition-colors"
                            title="Manage subscription"
                          >
                            <Edit className="w-3.5 h-3.5 text-nuvia-brown" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-sm text-nuvia-brown">No subscriptions found</div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <SubscriptionDetailModal
          sub={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            setSubs((prev) => prev.map((s) => s.id === updated.id ? updated : s));
            setEditing(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
