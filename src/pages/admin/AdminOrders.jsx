import { useCallback, useEffect, useState } from "react";
import { api, money, shortId } from "../../api.js";
import Pagination from "../../components/Pagination.jsx";
import StatusTag from "../../components/StatusTag.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const FILTERS = ["", "pending", "paid", "shipped", "delivered", "cancelled"];
const NEXT = ["shipped", "delivered", "cancelled"]; // statuses an admin may set

export default function AdminOrders() {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [pick, setPick] = useState({}); // orderId -> chosen status
  const [busyId, setBusyId] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api
      .allOrders({ page, limit: 10, status })
      .then(setData)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [page, status, toast]);

  useEffect(load, [load]);

  const apply = async (o) => {
    const next = pick[o._id];
    if (!next) return;
    setBusyId(o._id);
    try {
      await api.setOrderStatus(o._id, next);
      toast(`Order #${shortId(o._id)} marked ${next}`, "success");
      setPick((p) => ({ ...p, [o._id]: "" }));
      load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusyId("");
    }
  };

  return (
    <>
      <div className="row between wrap">
        <h2>Orders</h2>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          {FILTERS.map((s) => (
            <option key={s} value={s}>
              {s ? s[0].toUpperCase() + s.slice(1) : "All statuses"}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {!loading && data.items.length === 0 && <p className="muted">No orders found.</p>}

      <div className="list">
        {data.items.map((o) => (
          <div key={o._id} className="order">
            <div className="row between">
              <strong>Order #{shortId(o._id)}</strong>
              <StatusTag status={o.status} />
            </div>
            <div className="muted small-text">
              {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
              {o.user?.name ? ` | ${o.user.name}` : ""}
              {o.user?.email ? ` (${o.user.email})` : ""}
            </div>
            {o.shippingAddress && (
              <div className="small-text">
                {o.shippingAddress.fullName}, {o.shippingAddress.phone}, {o.shippingAddress.address}, {o.shippingAddress.city}
              </div>
            )}
            <ul className="items">
              {(o.items || []).map((i, idx) => (
                <li key={idx}>
                  {i.name} x {i.quantity}
                </li>
              ))}
            </ul>
            <div className="row between wrap">
              <strong>{money(o.total)}</strong>
              <div className="row">
                <select value={pick[o._id] || ""} onChange={(e) => setPick({ ...pick, [o._id]: e.target.value })} aria-label="New status">
                  <option value="">Change status...</option>
                  {NEXT.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button className="btn small" disabled={!pick[o._id] || busyId === o._id} onClick={() => apply(o)}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </>
  );
}
