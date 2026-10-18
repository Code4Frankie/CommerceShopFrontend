import { Link, useNavigate } from "react-router-dom";
import { money } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Cart() {
  const { items, loading, setQty, remove, clear, total } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const run = (fn) => async () => {
    try {
      await fn();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const checkout = () => {
    if (!user) navigate("/login", { state: { from: "/checkout" } });
    else navigate("/checkout");
  };

  if (loading && items.length === 0) return <p className="muted">Loading your cart...</p>;

  if (items.length === 0)
    return (
      <>
        <h1>Your cart</h1>
        <p className="muted">Your cart is empty.</p>
        <Link to="/products" className="btn">
          Browse products
        </Link>
      </>
    );

  return (
    <>
      <div className="row between">
        <h1>Your cart</h1>
        <button className="link" onClick={run(clear)}>
          Empty cart
        </button>
      </div>
      <div className="list">
        {items.map((i) => (
          <div key={i.id} className="line">
            {i.image ? <img src={i.image} alt="" /> : <div className="noimg small" />}
            <div className="grow">
              <Link to={`/products/${i.id}`}>
                <strong>{i.name}</strong>
              </Link>
              <div className="muted">{money(i.price)}</div>
            </div>
            <div className="stepper">
              <button onClick={run(() => setQty(i.id, i.qty - 1))} aria-label="Decrease">
                -
              </button>
              <span>{i.qty}</span>
              <button onClick={run(() => setQty(i.id, i.qty + 1))} disabled={i.stock != null && i.qty >= i.stock} aria-label="Increase">
                +
              </button>
            </div>
            <div className="sub">{money(i.price * i.qty)}</div>
            <button className="link" onClick={run(() => remove(i.id))}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="row between total">
        <strong>Total</strong>
        <strong>{money(total)}</strong>
      </div>
      <button className="btn" onClick={checkout}>
        {user ? "Proceed to checkout" : "Log in to checkout"}
      </button>
    </>
  );
}
