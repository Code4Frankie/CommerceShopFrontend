export default function StatusTag({ status }) {
  return <span className={`tag ${status || "pending"}`}>{status || "pending"}</span>;
}
