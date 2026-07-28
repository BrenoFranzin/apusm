interface SectionProps {
  children: React.ReactNode;
  title?: string;
}

export function Section({
  children,
  title,
}: SectionProps) {
  return (
    <section className="mb-6">

      {title && (
        <h2 className="text-lg font-semibold mb-4">
          {title}
        </h2>
      )}

      {children}

    </section>
  );
}