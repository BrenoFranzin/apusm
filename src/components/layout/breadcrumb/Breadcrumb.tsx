interface BreadcrumbProps {
  items: string[];
}
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav style={{ fontSize: 13, color: "var(--text-secondary)" }}>
      {items.join(" / ")}
    </nav>
  );
}