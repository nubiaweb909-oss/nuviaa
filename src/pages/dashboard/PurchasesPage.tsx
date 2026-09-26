import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Globe, MessageCircle, Package, ExternalLink, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUserLibrary, getDeliveryByOrderId } from "@/services/orderService";
import { useAuth } from "@/hooks/useAuth";
import type { UserLibraryItem, Delivery } from "@/types";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import { WHATSAPP_URL } from "@/constants";

export default function PurchasesPage() {
  const { user } = useAuth();
  const [library, setLibrary] = useState<UserLibraryItem[]>([]);
  const [deliveries, setDeliveries] = useState<Record<string, Delivery>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserLibrary(user.id).then(async (items) => {
      setLibrary(items);
      const deliveryMap: Record<string, Delivery> = {};
      await Promise.all(
        items.map(async (item) => {
          const d = await getDeliveryByOrderId(item.order_id);
          if (d) deliveryMap[item.order_id] = d;
        })
      );
      setDeliveries(deliveryMap);
      setLoading(false);
    });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-nuvia-espresso">My Purchases</h1>
          <p className="text-sm text-nuvia-brown mt-1">All your purchased products and domain registrations</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 card-nuvia rounded-2xl animate-pulse" />)}
          </div>
        ) : library.length === 0 ? (
          <div className="card-nuvia rounded-2xl p-12 text-center">
            <Package className="w-10 h-10 text-nuvia-surface-2 mx-auto mb-3" />
            <p className="font-display text-xl text-nuvia-espresso mb-2">No purchases yet</p>
            <p className="text-sm text-nuvia-brown mb-5">Start browsing our premium digital products</p>
            <Link to="/marketplace" className="btn-primary">Browse Marketplace</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {library.map((item) => {
              const delivery = deliveries[item.order_id];
              const isProduct = item.purchase_type === "product";
              return (
                <div key={item.id} className="card-nuvia rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    {item.product?.primary_image_url && (
                      <img src={item.product.primary_image_url} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    )}
                    {!isProduct && (
                      <div className="w-16 h-16 rounded-xl bg-nuvia-beige-light flex items-center justify-center flex-shrink-0">
                        <Globe className="w-7 h-7 text-nuvia-espresso" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg text-nuvia-espresso">
                            {isProduct ? item.product?.name : `${item.domain_name}${item.domain_extension?.extension}`}
                          </p>
                          <p className="text-xs text-nuvia-brown capitalize">{item.purchase_type} · {formatDate(item.purchased_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-nuvia-espresso">{formatPrice(item.order?.amount || 0)}</p>
                          {item.order && (
                            <span className={`badge-nuvia border text-xs mt-1 ${getStatusColor(item.order.payment_status)}`}>
                              {item.order.payment_status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delivery */}
                      {item.order?.payment_status === "successful" && (
                        <div className="mt-3 pt-3 border-t border-nuvia-surface">
                          {delivery?.is_unlocked && delivery.file_url ? (
                            <a href={delivery.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm flex items-center gap-2 w-fit">
                              <Download className="w-3.5 h-3.5" /> Download Product
                            </a>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-2 items-start">
                              <div className="flex items-center gap-2 text-xs text-[#7A5A2E] bg-nuvia-champagne/20 border border-nuvia-champagne/50 rounded-lg px-3 py-2">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                Manual fulfillment — contact our team for delivery
                              </div>
                              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2 flex items-center gap-1.5">
                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Demo link */}
                      {isProduct && item.product?.demo_url && (
                        <a href={item.product.demo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-nuvia-brown hover:text-nuvia-espresso mt-2 transition-colors">
                          <ExternalLink className="w-3 h-3" /> View Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
