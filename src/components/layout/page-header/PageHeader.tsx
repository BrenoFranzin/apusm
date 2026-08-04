interface PageHeaderProps {
  title: string;
  description?: string;
}
export function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--page-heading)" }}>
        {title}
      </h1>
      {description && (
        <p style={{ color: "var(--page-subheading)", marginTop: 4 }}>
          {description}
        </p>
      )}
    </div>
  );
}