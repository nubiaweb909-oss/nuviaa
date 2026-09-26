import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, EyeOff, Sparkles, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminGetRentalProducts, adminUpdateRentalProduct, adminDeleteRentalProduct } from "@/services/rentalService";
import type { RentalProduct } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminRentalProductsPage() {
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetRentalProducts().then((p) => { setProducts(p); setLoading(false); });
  }, []);

  const togglePublish = async (p: RentalProduct) => {
    await adminUpdateRentalProduct(p.id, { is_published: !p.is_published });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_published: !x.is_published } : x));
    toast.success(p.is_published ? "Rental product unpublished" : "Rental product published");
  };

  const toggleFeatured = async (p: RentalProduct) => {
    await adminUpdateRentalProduct(p.id, { is_featured: !p.is_featured });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_featured: !x.is_featured } : x));
  };

  const handleDelete = async (p: RentalProduct) => {
    if (!confirm(`Delete rental product "${p.name}"? This cannot be undone.`)) return;
    await adminDeleteRentalProduct(p.id);
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    toast.success("Rental product deleted");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl text-nuvia-espresso flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-nuvia-brown" /> Rental Products
            </h1>
            <p className="text-sm text-nuvia-brown mt-1">{products.length} rental products total</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/rental-subscriptions" className="btn-secondary text-sm flex items-center gap-2">
              Subscriptions
            </Link>
            <Link to="/admin/rental-products/new" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Rental Product
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 card-nuvia rounded-xl animate-pulse" />)}</div>
        ) : products.length === 0 ? (
          <div className="card-nuvia rounded-2xl p-12 text-center">
            <RefreshCw className="w-10 h-10 text-nuvia-surface-2 mx-auto mb-3" />
            <p className="text-nuvia-brown mb-4">No rental products yet</p>
            <Link to="/admin/rental-products/new" className="btn-primary">Create First Rental Product</Link>
          </div>
        ) : (
          <div className="card-nuvia rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-nuvia-surface bg-nuvia-beige-light/50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-nuvia-brown uppercase tracking-wider px-5 py-3">Product</th>
                    <th className="text-left text-xs font-semibold text-nuvia-brown uppercase tracking-wider px-3 py-3 hidden md:table-cell">Type</th>
                    <th className="text-left text-xs font-semibold text-nuvia-brown uppercase tracking-wider px-3 py-3">1mo / 3mo / 1yr</th>
                    <th className="text-left text-xs font-semibold text-nuvia-brown uppercase tracking-wider px-3 py-3 hidden sm:table-cell">Status</th>
                    <th className="text-right text-xs font-semibold text-nuvia-brown uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-nuvia-surface last:border-0 hover:bg-nuvia-beige-light/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.primary_image_url && <img src={p.primary_image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                          {!p.primary_image_url && <div className="w-10 h-10 rounded-lg bg-nuvia-beige-light flex items-center justify-center flex-shrink-0"><RefreshCw className="w-4 h-4 text-nuvia-brown" /></div>}
                          <div>
                            <p className="font-medium text-nuvia-espresso text-sm">{p.name}</p>
                            {p.is_featured && <span className="text-[10px] text-[#8A6428] flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 hidden md:table-cell">
                        <span className="badge-nuvia bg-nuvia-surface text-nuvia-brown text-xs capitalize">{p.product_type}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-xs text-nuvia-espresso font-medium">
                          {formatPrice(p.price_1month)} / {formatPrice(p.price_3months)} / {formatPrice(p.price_1year)}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 hidden sm:table-cell">
                        <span className={`badge-nuvia border text-xs ${p.is_published ? "bg-[#AFC79B]/20 text-nuvia-forest border-[#AFC79B]/50" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {p.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => togglePublish(p)} className="p-1.5 rounded-lg hover:bg-nuvia-surface transition-colors" title={p.is_published ? "Unpublish" : "Publish"}>
                            {p.is_published ? <EyeOff className="w-3.5 h-3.5 text-nuvia-brown" /> : <Eye className="w-3.5 h-3.5 text-nuvia-brown" />}
                          </button>
                          <button onClick={() => toggleFeatured(p)} className={`p-1.5 rounded-lg transition-colors ${p.is_featured ? "text-amber-500" : "hover:bg-nuvia-surface text-nuvia-brown"}`}>
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <Link to={`/admin/rental-products/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-nuvia-surface transition-colors">
                            <Edit className="w-3.5 h-3.5 text-nuvia-brown" />
                          </Link>
                          <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
