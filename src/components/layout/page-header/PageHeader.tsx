interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">
        {title}
      </h1>

      {description && (
        <p className="text-gray-500 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}