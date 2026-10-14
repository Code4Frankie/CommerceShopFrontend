import { useEffect, useState } from "react";
import { api, money } from "../api.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .myOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1>My orders</h1>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && orders.length === 0 && <p className="muted">You have no orders yet.</p>}
      <div className="list">
        {orders.map((o) => (
          <div key={o._id || o.id} className="order">
            <div className="row between">
              <strong>Order #{String(o._id || o.id).slice(-6).toUpperCase()}</strong>
              <span className="tag">{o.status || "pending"}</span>
            </div>
            <div className="muted">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}</div>
            <div>{(o.items || []).length} item(s)</div>
            {(o.total ?? o.totalPrice) != null && <strong>{money(o.total ?? o.totalPrice)}</strong>}
          </div>
        ))}
      </div>
    </>
  );
}
