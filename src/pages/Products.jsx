import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const { add } = useCart();

  useEffect(() => {
    api
      .products()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(
    () => products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(q.toLowerCase())),
    [products, q]
  );

  return (
    <>
      <div className="row between">
        <h1>Products</h1>
        <input className="search" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading && <p className="muted">Loading products...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && shown.length === 0 && <p className="muted">No products found.</p>}

      <div className="grid">
        {shown.map((p) => (
          <article key={p.id} className="card">
            <Link to={`/products/${p.id}`}>
              {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <div className="noimg">No image</div>}
            </Link>
            <div className="card-body">
              <Link to={`/products/${p.id}`} className="title">
                {p.name}
              </Link>
              <p className="price">{money(p.price)}</p>
              <button className="btn" onClick={() => add(p)} disabled={p.stock === 0}>
                {p.stock === 0 ? "Out of stock" : "Add to cart"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
