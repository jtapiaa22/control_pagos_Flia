export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-h1 font-semibold tracking-heading text-text-primary">
            Control de Pagos
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Vencimientos y pagos de la familia, en un solo lugar
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
