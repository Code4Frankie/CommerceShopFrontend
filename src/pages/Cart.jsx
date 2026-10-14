import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, money } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { items, setQty, remove, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const checkout = async () => {
    if (!user) return navigate("/login", { state: { from: "/cart" } });
    setBusy(true);
    setError("");
    try {
      await api.createOrder(items);
      clear();
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="panel">
        <h1>Order placed</h1>
        <p>Thank you! You can follow it under your orders.</p>
        <Link to="/orders" className="btn">
          View my orders
        </Link>
      </div>
    );

  if (items.length === 0)
    return (
      <>
        <h1>Your cart</h1>
        <p className="muted">Your cart is empty.</p>
        <Link to="/" className="btn">
          Browse products
        </Link>
      </>
    );

  return (
    <>
      <h1>Your cart</h1>
      <div className="list">
        {items.map((i) => (
          <div key={i.id} className="line">
            {i.image ? <img src={i.image} alt="" /> : <div className="noimg small" />}
            <div className="grow">
              <strong>{i.name}</strong>
              <div className="muted">{money(i.price)}</div>
            </div>
            <input
              type="number"
              min="1"
              className="qty"
              value={i.qty}
              onChange={(e) => setQty(i.id, Number(e.target.value) || 1)}
            />
            <div className="sub">{money(i.price * i.qty)}</div>
            <button className="link" onClick={() => remove(i.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="row between total">
        <strong>Total</strong>
        <strong>{money(total)}</strong>
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn" onClick={checkout} disabled={busy}>
        {busy ? "Placing order..." : user ? "Place order" : "Log in to checkout"}
      </button>
    </>
  );
}
