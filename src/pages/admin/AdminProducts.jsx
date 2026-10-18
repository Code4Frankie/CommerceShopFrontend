import { useCallback, useEffect, useMemo, useState } from "react";
import { api, money } from "../../api.js";
import Pagination from "../../components/Pagination.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const empty = { name: "", description: "", price: "", stock: "", category: "" };
const MAX_FILES = 5;
const MAX_MB = 5;

export default function AdminProducts() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ products: [], page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited, or null for new
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const load = useCallback(() => {
    setLoading(true);
    api
      .products({ page, limit: 10, sort: "-createdAt" })
      .then(setData)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [page, toast]);

  useEffect(load, [load]);
  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const catName = (id) => categories.find((c) => c._id === id)?.name || "-";

  const startNew = () => {
    setEditing(null);
    setForm(empty);
    setFiles([]);
    setOpen(true);
  };

  const startEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      category: p.category || "",
    });
    setFiles([]);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  const pickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    const ok = [];
    for (const f of picked) {
      if (!f.type.startsWith("image/")) {
        toast(`${f.name} is not an image`, "error");
        continue;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        toast(`${f.name} is larger than ${MAX_MB} MB`, "error");
        continue;
      }
      ok.push(f);
    }
    if (ok.length > MAX_FILES) toast(`Only the first ${MAX_FILES} images are used`, "info");
    setFiles(ok.slice(0, MAX_FILES));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category) return toast("Choose a category first", "error");
    setBusy(true);
    try {
      // multipart/form-data: text fields plus up to 5 files under the "images" field
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("stock", form.stock || "0");
      fd.append("category", form.category);
      files.forEach((f) => fd.append("images", f));

      if (editing) await api.updateProduct(editing.id, fd);
      else await api.createProduct(fd);

      toast(editing ? "Product updated" : "Product created", "success");
      close();
      if (!editing && page !== 1) setPage(1);
      else load();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This also removes its images.`)) return;
    try {
      await api.deleteProduct(p.id);
      toast("Product deleted", "success");
      load();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      {!open && (
        <div className="row between">
          <h2>Products</h2>
          <button className="btn" onClick={startNew}>
            + Add product
          </button>
        </div>
      )}

      {open && (
        <form className="panel form wide" onSubmit={submit}>
          <h2>{editing ? `Edit: ${editing.name}` : "Add product"}</h2>

          {categories.length === 0 && (
            <p className="error">Create a category first (Categories tab), then come back to add products.</p>
          )}

          <label>
            Name
            <input required value={form.name} onChange={set("name")} />
          </label>
          <label>
            Description
            <textarea required rows={4} value={form.description} onChange={set("description")} />
          </label>
          <div className="grid-2">
            <label>
              Price (NGN)
              <input type="number" required min="0" step="any" value={form.price} onChange={set("price")} />
            </label>
            <label>
              Stock
              <input type="number" min="0" step="1" value={form.stock} onChange={set("stock")} />
            </label>
          </div>
          <label>
            Category
            <select required value={form.category} onChange={set("category")}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Photos (up to {MAX_FILES}, {MAX_MB} MB each)
            <input type="file" accept="image/*" multiple onChange={pickFiles} />
          </label>

          {files.length > 0 ? (
            <div className="thumbs static">
              {previews.map((src, i) => (
                <img key={src} src={src} alt={`New upload ${i + 1}`} />
              ))}
            </div>
          ) : (
            editing &&
            editing.images.length > 0 && (
              <>
                <div className="thumbs static">
                  {editing.images.map((src) => (
                    <img key={src} src={src} alt="Current" />
                  ))}
                </div>
                <p className="muted small-text">Current photos. Choosing new photos replaces all of them.</p>
              </>
            )
          )}

          <div className="row">
            <button className="btn" disabled={busy || categories.length === 0}>
              {busy ? "Saving..." : editing ? "Save changes" : "Create product"}
            </button>
            <button type="button" className="btn ghost" onClick={close} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p className="muted">Loading...</p>}
      {!loading && data.products.length === 0 && <p className="muted">No products yet. Add your first one.</p>}

      {data.products.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p.id}>
                  <td>{p.image ? <img className="mini" src={p.image} alt="" /> : <div className="noimg small" />}</td>
                  <td>{p.name}</td>
                  <td className="muted">{p.categoryName || catName(p.category)}</td>
                  <td>{money(p.price)}</td>
                  <td className={p.stock <= 0 ? "error" : ""}>{p.stock}</td>
                  <td className="actions">
                    <button className="link" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button className="link danger" onClick={() => del(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </>
  );
}
