export function StatusBadge({ status }: { status: "confirmed" | "cancelled" }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status === "confirmed" ? "Bestätigt" : "Storniert"}
    </span>
  );
}
