interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {children}
    </div>
  );
}