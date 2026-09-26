import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminGetDomainExtensions, adminCreateExtension, adminUpdateExtension, adminDeleteExtension } from "@/services/domainService";
import type { DomainExtension } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminDomainsPage() {
  const [extensions, setExtensions] = useState<DomainExtension[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ extension: "", price: "", description: "", is_active: true });

  useEffect(() => {
    adminGetDomainExtensions().then((e) => { setExtensions(e); setLoading(false); });
  }, []);

  const handleAdd = async () => {
    if (!form.extension || !form.price) return;
    const ext = await adminCreateExtension({ extension: form.extension, price: Number(form.price), currency: "NGN", description: form.description, is_active: form.is_active });
    setExtensions((prev) => [...prev, ext]);
    setForm({ extension: "", price: "", description: "", is_active: true });
    setAdding(false);
    toast.success("Extension added");
  };

  const handleUpdate = async (id: string) => {
    const updated = await adminUpdateExtension(id, { price: Number(form.price), description: form.description, is_active: form.is_active });
    setExtensions((prev) => prev.map((e) => e.id === id ? updated : e));
    setEditId(null);
    toast.success("Extension updated");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this extension?")) return;
    await adminDeleteExtension(id);
    setExtensions((prev) => prev.filter((e) => e.id !== id));
    toast.success("Extension deleted");
  };

  const startEdit = (ext: DomainExtension) => {
    setEditId(ext.id);
    setForm({ extension: ext.extension, price: String(ext.price), description: ext.description || "", is_active: ext.is_active });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-nuvia-ink font-bold">Domain Extensions</h1>
            <p className="text-sm text-nuvia-brown mt-1">Manage available domain extensions and pricing</p>
          </div>
          <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Extension
          </button>
        </div>

        {adding && (
          <div className="bg-nuvia-ivory border border-nuvia-brown rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-nuvia-espresso">New Extension</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><label className="label-nuvia">Extension</label><input value={form.extension} onChange={(e) => setForm({ ...form, extension: e.target.value })} className="input-nuvia" placeholder=".com" /></div>
              <div><label className="label-nuvia">Price (NGN)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-nuvia" placeholder="20000" /></div>
              <div className="col-span-2"><label className="label-nuvia">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-nuvia" placeholder="Short description" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn-primary text-sm flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Add</button>
              <button onClick={() => setAdding(false)} className="btn-secondary text-sm flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 card-nuvia rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="card-nuvia rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-nuvia-surface bg-nuvia-beige-light/50">
                <tr>
                  {["Extension", "Price", "Description", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-nuvia-brown uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {extensions.map((ext) => (
                  <tr key={ext.id} className="border-b border-nuvia-surface last:border-0 hover:bg-nuvia-beige-light/50">
                    <td className="px-5 py-3.5"><span className="font-display text-lg font-semibold text-nuvia-espresso">{ext.extension}</span></td>
                    <td className="px-5 py-3.5">
                      {editId === ext.id ? (
                        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-nuvia w-28 py-1.5 text-sm" />
                      ) : (
                        <span className="font-medium text-nuvia-espresso">{formatPrice(ext.price)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-nuvia-brown">{ext.description}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge-nuvia border text-xs ${ext.is_active ? "bg-[#AFC79B]/20 text-nuvia-forest border-[#AFC79B]/50" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {ext.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {editId === ext.id ? (
                          <>
                            <button onClick={() => handleUpdate(ext.id)} className="p-1.5 rounded-lg bg-emerald-50 text-nuvia-forest hover:bg-[#AFC79B]/30"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg hover:bg-nuvia-surface"><X className="w-3.5 h-3.5 text-nuvia-brown" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(ext)} className="p-1.5 rounded-lg hover:bg-nuvia-surface"><Edit className="w-3.5 h-3.5 text-nuvia-brown" /></button>
                            <button onClick={() => handleDelete(ext.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                          </>
                        )}
                      </div>
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
