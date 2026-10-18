import { useState } from "react";
import { Link } from "react-router-dom";
import { money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Sketch, { sketchFor } from "./Sketches.jsx";

export default function ProductCard({ p }) {
  const { add } = useCart();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const out = p.stock <= 0;

  const onAdd = async () => {
    setBusy(true);
    try {
      await add(p, 1);
      toast(`${p.name} added to cart`, "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card">
      <Link to={`/products/${p.id}`} className="imgwrap" aria-label={p.name}>
        {p.image ? (
          <img src={p.image} alt={p.name} loading="lazy" />
        ) : (
          <div className="noimg">
            <Sketch name={sketchFor(`${p.categoryName} ${p.name}`)} />
          </div>
        )}
        {out && <span className="ribbon">Sold out</span>}
      </Link>
      <div className="card-body">
        {p.categoryName && <span className="muted small-text">{p.categoryName}</span>}
        <Link to={`/products/${p.id}`} className="title">
          {p.name}
        </Link>
        <div className="card-foot">
          <p className="price">{money(p.price)}</p>
          <button className="btn small" onClick={onAdd} disabled={out || busy} aria-label={`Add ${p.name} to cart`}>
            {out ? "Sold out" : busy ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
