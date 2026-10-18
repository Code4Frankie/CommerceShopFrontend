import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money, shortId } from "../api.js";
import Pagination from "../components/Pagination.jsx";
import StatusTag from "../components/StatusTag.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Orders() {
  const toast = useToast();
  const [data, setData] = useState({ items: [], page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .myOrders({ page, limit: 10 })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(load, [load]);

  const pay = async (order) => {
    setBusyId(order._id);
    try {
      const p = await api.initPayment(order._id);
      window.location.href = p.authorizationUrl;
    } catch (e) {
      toast(e.message, "error");
      setBusyId("");
    }
  };

  const cancel = async (order) => {
    if (!window.confirm("Cancel this order?")) return;
    setBusyId(order._id);
    try {
      await api.cancelOrder(order._id);
      toast("Order cancelled", "success");
      load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusyId("");
    }
  };

  return (
    <>
      <h1>My orders</h1>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && data.items.length === 0 && (
        <>
          <p className="muted">You have no orders yet.</p>
          <Link to="/products" className="btn">
            Start shopping
          </Link>
        </>
      )}

      <div className="list">
        {data.items.map((o) => (
          <div key={o._id} className="order">
            <div className="row between">
              <strong>Order #{shortId(o._id)}</strong>
              <StatusTag status={o.status} />
            </div>
            <div className="muted small-text">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</div>
            <ul className="items">
              {(o.items || []).map((i, idx) => (
                <li key={idx}>
                  {i.name} x {i.quantity} <span className="muted">({money(i.price * i.quantity)})</span>
                </li>
              ))}
            </ul>
            <div className="row between">
              <strong>{money(o.total)}</strong>
              {o.status === "pending" && (
                <div className="row">
                  <button className="btn small" disabled={busyId === o._id} onClick={() => pay(o)}>
                    Pay now
                  </button>
                  <button className="btn ghost small" disabled={busyId === o._id} onClick={() => cancel(o)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </>
  );
}
