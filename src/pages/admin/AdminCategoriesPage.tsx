import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from "@/services/categoryService";
import type { Category } from "@/types";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  useEffect(() => {
    adminGetCategories().then((c) => { setCategories(c); setLoading(false); });
  }, []);

  const handleAdd = async () => {
    if (!form.name) return;
    const cat = await adminCreateCategory({ name: form.name, slug: form.slug || slugify(form.name), description: form.description, is_active: true });
    setCategories((prev) => [...prev, cat]);
    setForm({ name: "", slug: "", description: "" });
    setAdding(false);
    toast.success("Category added");
  };

  const handleUpdate = async (id: string) => {
    const updated = await adminUpdateCategory(id, { name: form.name, description: form.description });
    setCategories((prev) => prev.map((c) => c.id === id ? updated : c));
    setEditId(null);
    toast.success("Category updated");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await adminDeleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success("Category deleted");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-nuvia-ink font-bold">Categories</h1>
          <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {adding && (
          <div className="bg-nuvia-ivory border border-nuvia-brown rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-nuvia-espresso">New Category</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label-nuvia">Name</label><input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) }); }} className="input-nuvia" placeholder="SaaS & Technology" /></div>
              <div><label className="label-nuvia">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-nuvia" placeholder="saas-technology" /></div>
              <div className="col-span-2"><label className="label-nuvia">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-nuvia" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn-primary text-sm flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Add</button>
              <button onClick={() => setAdding(false)} className="btn-secondary text-sm"><X className="w-3.5 h-3.5 mr-1" /> Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 card-nuvia rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="card-nuvia rounded-2xl overflow-hidden">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-nuvia-surface last:border-0 hover:bg-nuvia-beige-light/50">
                {editId === cat.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-nuvia flex-1 py-1.5 text-sm" />
                    <button onClick={() => handleUpdate(cat.id)} className="p-1.5 rounded-lg bg-emerald-50 text-nuvia-forest"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg hover:bg-nuvia-surface"><X className="w-3.5 h-3.5 text-nuvia-brown" /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-medium text-nuvia-espresso text-sm">{cat.name}</p>
                      <p className="text-xs text-nuvia-brown font-mono">{cat.slug}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setEditId(cat.id); setForm({ name: cat.name, slug: cat.slug, description: cat.description || "" }); }} className="p-1.5 rounded-lg hover:bg-nuvia-surface">
                        <Edit className="w-3.5 h-3.5 text-nuvia-brown" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
