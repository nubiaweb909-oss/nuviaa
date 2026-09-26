import { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2, Star } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminGetReviews, adminUpdateReview, adminDeleteReview } from "@/services/reviewService";
import type { ProductReview } from "@/types";
import { formatDate } from "@/lib/utils";
import StarRating from "@/components/features/StarRating";
import { toast } from "sonner";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetReviews().then((r) => { setReviews(r); setLoading(false); });
  }, []);

  const toggleVisible = async (r: ProductReview) => {
    await adminUpdateReview(r.id, { is_visible: !r.is_visible });
    setReviews((prev) => prev.map((x) => x.id === r.id ? { ...x, is_visible: !x.is_visible } : x));
    toast.success(r.is_visible ? "Review hidden" : "Review shown");
  };

  const toggleFeatured = async (r: ProductReview) => {
    await adminUpdateReview(r.id, { is_featured: !r.is_featured });
    setReviews((prev) => prev.map((x) => x.id === r.id ? { ...x, is_featured: !x.is_featured } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await adminDeleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Review deleted");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-nuvia-ink font-bold">Reviews</h1>
          <p className="text-sm text-nuvia-brown mt-1">{reviews.length} total reviews</p>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 card-nuvia rounded-xl animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="card-nuvia rounded-2xl p-12 text-center">
            <p className="text-nuvia-brown">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className={`bg-nuvia-ivory border rounded-2xl p-5 ${r.is_visible ? "border-nuvia-surface" : "border-nuvia-surface-2 opacity-60"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StarRating rating={r.rating} size="sm" />
                      {r.title && <p className="font-medium text-nuvia-espresso text-sm">{r.title}</p>}
                      {r.is_featured && <span className="badge-nuvia bg-amber-50 text-[#7A5A2E] text-xs flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-amber-400" /> Featured</span>}
                    </div>
                    {r.comment && <p className="text-sm text-nuvia-brown leading-relaxed">{r.comment}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-nuvia-brown/60">{(r as unknown as { profile?: { full_name?: string; username?: string } }).profile?.full_name || "Customer"}</p>
                      <p className="text-xs text-nuvia-brown/40">{formatDate(r.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleFeatured(r)} className={`p-1.5 rounded-lg transition-colors ${r.is_featured ? "text-amber-500 bg-amber-50" : "hover:bg-nuvia-surface text-nuvia-brown"}`}>
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleVisible(r)} className="p-1.5 rounded-lg hover:bg-nuvia-surface transition-colors">
                      {r.is_visible ? <Eye className="w-3.5 h-3.5 text-nuvia-brown" /> : <EyeOff className="w-3.5 h-3.5 text-nuvia-brown" />}
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
