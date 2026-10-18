export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="pagination">
      <button className="btn ghost small" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        &larr; Previous
      </button>
      <span className="muted">
        Page {page} of {pages}
      </span>
      <button className="btn ghost small" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next &rarr;
      </button>
    </div>
  );
}
