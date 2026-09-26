import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminGetOrders, adminUpdateOrder } from "@/services/orderService";
import type { Order } from "@/types";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    adminGetOrders().then((o) => { setOrders(o); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, field: keyof Order, value: string) => {
    await adminUpdateOrder(id, { [field]: value } as Partial<Order>);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, [field]: value } : o));
    toast.success("Order updated");
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.payment_status === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-nuvia-ink font-bold">Orders</h1>
          <p className="text-sm text-nuvia-brown mt-1">{orders.length} total orders</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "successful", "failed", "cancelled"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${filter === s ? "bg-nuvia-forest text-nuvia-ivory" : "bg-nuvia-ivory border border-nuvia-surface text-nuvia-brown hover:border-nuvia-brown"}`}>
              {s === "all" ? "All Orders" : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 card-nuvia rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="card-nuvia rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-nuvia-surface bg-nuvia-beige-light/50">
                  <tr>
                    {["Reference", "Customer", "Item", "Amount", "Payment", "Delivery", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-nuvia-brown uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b border-nuvia-surface last:border-0 hover:bg-nuvia-beige-light/50">
                      <td className="px-4 py-3 font-mono text-xs text-nuvia-espresso">{order.order_reference}</td>
                      <td className="px-4 py-3 text-xs text-nuvia-brown">{order.user_id?.slice(0, 8)}…</td>
                      <td className="px-4 py-3 text-xs text-nuvia-espresso max-w-[120px] truncate">
                        {order.product?.name || `${order.domain_name}${order.domain_extension?.extension || ""}`}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-nuvia-espresso">{formatPrice(order.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge-nuvia border text-xs ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.delivery_status}
                          onChange={(e) => updateStatus(order.id, "delivery_status", e.target.value)}
                          className="text-xs border border-nuvia-surface rounded-lg px-2 py-1 bg-nuvia-ivory text-nuvia-espresso"
                        >
                          {["pending", "processing", "delivered", "failed"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-nuvia-brown">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-sm text-nuvia-brown">No orders found</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
