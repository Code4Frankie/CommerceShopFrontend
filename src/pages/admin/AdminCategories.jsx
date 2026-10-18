import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useToast } from "../../context/ToastContext.jsx";

const empty = { name: "", description: "" };

export default function AdminCategories() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .categories()
      .then(setList)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setForm(empty);
    setEditingId("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { name: form.name.trim(), description: form.description.trim() };
      if (editingId) await api.updateCategory(editingId, body);
      else await api.createCategory(body);
      toast(editingId ? "Category updated" : "Category created", "success");
      reset();
      await load();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const edit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name || "", description: c.description || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api.deleteCategory(c._id);
      toast("Category deleted", "success");
      await load();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <>
      <form className="panel form wide inline-form" onSubmit={submit}>
        <h2>{editingId ? "Edit category" : "Add category"}</h2>
        <label>
          Name
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Description (optional)
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="row">
          <button className="btn" disabled={busy}>
            {busy ? "Saving..." : editingId ? "Save changes" : "Add category"}
          </button>
          {editingId && (
            <button type="button" className="btn ghost" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p className="muted">Loading...</p>}
      {!loading && list.length === 0 && <p className="muted">No categories yet. Add your first one above.</p>}

      {list.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td className="muted">{c.description || "-"}</td>
                  <td className="actions">
                    <button className="link" onClick={() => edit(c)}>
                      Edit
                    </button>
                    <button className="link danger" onClick={() => del(c)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
