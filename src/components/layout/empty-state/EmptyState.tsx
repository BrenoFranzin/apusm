interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">

      <h3 className="font-semibold text-lg">
        {title}
      </h3>

      {description && (
        <p className="text-gray-500 mt-2">
          {description}
        </p>
      )}

    </div>
  );
}