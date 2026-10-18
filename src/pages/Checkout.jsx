import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, money } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

// Flow: POST /orders (shipping address, uses the server cart)
//    -> POST /payments/initialize (orderId) -> redirect to the gateway page
//    -> gateway sends the customer to /payment/callback -> GET /payments/verify/:reference
export default function Checkout() {
  const { user } = useAuth();
  const { items, total, loading, reload } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading && items.length === 0) return <p className="muted">Loading your cart...</p>;
  if (items.length === 0) return <Navigate to="/cart" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    let order;
    try {
      order = await api.createOrder({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
      });
      reload().catch(() => {});
    } catch (err) {
      setError(err.message);
      setBusy(false);
      return;
    }

    try {
      const pay = await api.initPayment(order._id || order.id);
      window.location.href = pay.authorizationUrl; // gateway checkout page
    } catch (err) {
      toast("Order created, but payment could not start. You can pay from My orders.", "error");
      navigate("/orders");
    }
  };

  return (
    <div className="two-col">
      <form className="panel form wide" onSubmit={submit}>
        <h1>Delivery details</h1>
        <label>
          Full name
          <input required value={form.fullName} onChange={set("fullName")} autoComplete="name" />
        </label>
        <label>
          Phone number
          <input required value={form.phone} onChange={set("phone")} autoComplete="tel" />
        </label>
        <label>
          Address
          <input required value={form.address} onChange={set("address")} autoComplete="street-address" />
        </label>
        <label>
          City
          <input required value={form.city} onChange={set("city")} autoComplete="address-level2" />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>
          {busy ? "Please wait..." : `Place order and pay ${money(total)}`}
        </button>
        <p className="muted small-text">You will be taken to our payment partner to complete payment securely.</p>
      </form>

      <aside className="panel summary">
        <h2>Order summary</h2>
        {items.map((i) => (
          <div key={i.id} className="row between">
            <span>
              {i.name} x {i.qty}
            </span>
            <span>{money(i.price * i.qty)}</span>
          </div>
        ))}
        <hr />
        <div className="row between">
          <strong>Total</strong>
          <strong>{money(total)}</strong>
        </div>
        <Link to="/cart" className="link">
          Edit cart
        </Link>
      </aside>
    </div>
  );
}
