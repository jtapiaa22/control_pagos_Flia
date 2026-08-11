export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Control de Pagos
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            Vencimientos y pagos de la familia, en un solo lugar
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
