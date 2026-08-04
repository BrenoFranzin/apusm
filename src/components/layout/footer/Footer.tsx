export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border-default)", background: "var(--background-primary)", padding: "16px 24px", fontSize: 14, color: "var(--text-secondary)" }}>
      APUSM © {new Date().getFullYear()}
    </footer>
  );
}