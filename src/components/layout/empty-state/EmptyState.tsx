interface EmptyStateProps {
  title: string;
  description?: string;
}
export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", textAlign: "center" }}>
      <h3 style={{ fontWeight: 600, fontSize: 18, color: "var(--text-primary)" }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
          {description}
        </p>
      )}
    </div>
  );
}