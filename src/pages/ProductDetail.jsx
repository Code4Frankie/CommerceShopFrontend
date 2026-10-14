import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    setP(null);
    setError("");
    api
      .product(id)
      .then(setP)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!p) return <p className="muted">Loading...</p>;

  return (
    <>
      <Link to="/" className="muted">
        &larr; Back to products
      </Link>
      <div className="detail">
        {p.image ? <img src={p.image} alt={p.name} /> : <div className="noimg big">No image</div>}
        <div>
          <h1>{p.name}</h1>
          {p.category && <p className="muted">{p.category}</p>}
          <p className="price big">{money(p.price)}</p>
          <p>{p.description}</p>
          {p.stock !== null && <p className="muted">{p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</p>}
          <div className="row">
            <input
              type="number"
              min="1"
              max={p.stock || undefined}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="qty"
            />
            <button
              className="btn"
              disabled={p.stock === 0}
              onClick={() => {
                add(p, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
            >
              {added ? "Added!" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
