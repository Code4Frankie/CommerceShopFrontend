import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import HeroArt from "../components/HeroArt.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Sketch, { sketchFor } from "../components/Sketches.jsx";

const TRUST = [
  { sketch: "palm", title: "Made in Nigeria", text: "Every product comes from a local maker or seller." },
  { sketch: "jar", title: "Secure checkout", text: "You pay on our payment partner's page. We never see your card details." },
  { sketch: "basket", title: "Track your orders", text: "See the status of each order in your account." },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
    api
      .products({ limit: 8, sort: "-createdAt" })
      .then((d) => setProducts(d.products))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>Good things, made in Nigeria.</h1>
            <p>Produce, fabrics, beauty and home goods from local sellers, delivered to your door.</p>
            <div className="row wrap">
              <Link to="/products" className="btn gold big">
                Start shopping
              </Link>
              {categories.length > 0 && (
                <a href="#categories" className="btn outline-light big">
                  Browse categories
                </a>
              )}
            </div>
          </div>
          <HeroArt />
        </div>
      </section>
      <div className="pattern-strip" aria-hidden="true" />

      {categories.length > 0 && (
        <section id="categories" className="block">
          <h2>Shop by category</h2>
          <div className="cat-grid">
            {categories.map((c) => (
              <Link key={c._id} to={`/products?category=${c._id}`} className="cat-tile">
                <Sketch name={sketchFor(c.name)} />
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="block">
        <div className="row between">
          <h2>New arrivals</h2>
          <Link to="/products" className="link">
            See all products
          </Link>
        </div>
        {loading && <p className="muted">Loading products...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="muted">No products yet. New arrivals will show up here.</p>
        )}
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="trust">
        {TRUST.map((t) => (
          <div key={t.title} className="trust-item">
            <Sketch name={t.sketch} />
            <div>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
