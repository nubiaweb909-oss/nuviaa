import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminGetUsers, adminToggleUserAdmin } from "@/services/adminService";
import type { Profile } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetUsers().then((u) => { setUsers(u); setLoading(false); });
  }, []);

  const toggleAdmin = async (u: Profile) => {
    if (u.id === currentUser?.id) { toast.error("You cannot modify your own admin status"); return; }
    await adminToggleUserAdmin(u.id, !u.is_admin);
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, is_admin: !x.is_admin } : x));
    toast.success(u.is_admin ? "Admin access removed" : "Admin access granted");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-nuvia-ink font-bold">Users</h1>
          <p className="text-sm text-nuvia-brown mt-1">{users.length} registered users</p>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 card-nuvia rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="card-nuvia rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-nuvia-surface bg-nuvia-beige-light/50">
                <tr>
                  {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-nuvia-brown uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-nuvia-surface last:border-0 hover:bg-nuvia-beige-light/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-nuvia-forest/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-nuvia-espresso">{(u.full_name || u.email).charAt(0).toUpperCase()}</span>
                        </div>
                        <p className="text-sm font-medium text-nuvia-espresso">{u.full_name || u.username || "—"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-nuvia-brown">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge-nuvia border text-xs ${u.is_admin ? "bg-nuvia-forest text-nuvia-ivory border-nuvia-forest" : "bg-nuvia-surface text-nuvia-brown border-nuvia-surface-2"}`}>
                        {u.is_admin ? "Admin" : "Customer"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-nuvia-brown">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleAdmin(u)}
                        disabled={u.id === currentUser?.id}
                        className="p-1.5 rounded-lg hover:bg-nuvia-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={u.is_admin ? "Remove admin" : "Grant admin"}
                      >
                        {u.is_admin ? <ShieldOff className="w-4 h-4 text-red-500" /> : <ShieldCheck className="w-4 h-4 text-nuvia-brown" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
