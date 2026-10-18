import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Sketch, { sketchFor } from "../components/Sketches.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const toast = useToast();
  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setP(null);
    setError("");
    setActive(0);
    setQty(1);
    api
      .product(id)
      .then(setP)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <>
        <p className="error">{error}</p>
        <Link to="/products" className="btn">
          Back to products
        </Link>
      </>
    );
  if (!p) return <p className="muted">Loading...</p>;

  const out = p.stock <= 0;
  const onAdd = async () => {
    setBusy(true);
    try {
      await add(p, qty);
      toast(`${qty} x ${p.name} added to cart`, "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link to="/products" className="muted">
        &larr; Back to products
      </Link>
      <div className="detail">
        <div>
          {p.images.length ? (
            <img className="main-img" src={p.images[active]} alt={p.name} />
          ) : (
            <div className="noimg big">
              <Sketch name={sketchFor(`${p.categoryName} ${p.name}`)} />
            </div>
          )}
          {p.images.length > 1 && (
            <div className="thumbs">
              {p.images.map((src, i) => (
                <button key={src} className={i === active ? "on" : ""} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1>{p.name}</h1>
          {p.categoryName && <p className="muted">{p.categoryName}</p>}
          {p.ratingsCount > 0 && (
            <p className="muted">
              {p.ratingsAverage.toFixed(1)} / 5 ({p.ratingsCount} review{p.ratingsCount > 1 ? "s" : ""})
            </p>
          )}
          <p className="price big">{money(p.price)}</p>
          <p>{p.description}</p>
          <p className={out ? "error" : "muted"}>{out ? "Out of stock" : p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}</p>
          <div className="row">
            <div className="stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={out || qty <= 1} aria-label="Decrease">
                -
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} disabled={out || qty >= p.stock} aria-label="Increase">
                +
              </button>
            </div>
            <button className="btn" onClick={onAdd} disabled={out || busy}>
              {busy ? "Adding..." : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
