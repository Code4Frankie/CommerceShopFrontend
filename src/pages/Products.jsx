import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import Pagination from "../components/Pagination.jsx";

const SORTS = [
  ["-createdAt", "Newest"],
  ["price", "Price: low to high"],
  ["-price", "Price: high to low"],
  ["name", "Name: A to Z"],
  ["-ratingsAverage", "Top rated"],
];

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get("page")) || 1;
  const category = sp.get("category") || "";
  const search = sp.get("search") || "";
  const sort = sp.get("sort") || "-createdAt";

  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ products: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [term, setTerm] = useState(search);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .products({ page, limit: 12, category, search, sort })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, category, search, sort]);

  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!("page" in patch)) next.delete("page");
    setSp(next);
  };

  const activeName = categories.find((c) => c._id === category)?.name;

  return (
    <>
      <div className="row between wrap">
        <h1>{activeName || "All products"}</h1>
        <div className="row wrap">
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              update({ search: term.trim() });
            }}
          >
            <input className="search" placeholder="Search products" value={term} onChange={(e) => setTerm(e.target.value)} />
            <button className="btn small">Search</button>
          </form>
          <select value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
            {SORTS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chips">
        <button className={`chip ${!category ? "on" : ""}`} onClick={() => update({ category: "" })}>
          All
        </button>
        {categories.map((c) => (
          <button key={c._id} className={`chip ${category === c._id ? "on" : ""}`} onClick={() => update({ category: c._id })}>
            {c.name}
          </button>
        ))}
      </div>

      {search && (
        <p className="muted">
          Results for "{search}"{" "}
          <button
            className="link"
            onClick={() => {
              setTerm("");
              update({ search: "" });
            }}
          >
            Clear
          </button>
        </p>
      )}

      {loading && <p className="muted">Loading products...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && data.products.length === 0 && <p className="muted">No products match your filters.</p>}

      <div className="grid">
        {data.products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      <Pagination page={data.page} pages={data.pages} onChange={(n) => update({ page: String(n) })} />
    </>
  );
}
