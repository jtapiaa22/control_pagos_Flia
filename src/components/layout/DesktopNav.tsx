"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Settings, Users } from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export function DesktopNav({
  isAdmin,
  nombre,
}: {
  isAdmin: boolean;
  nombre: string;
}) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/pagos", label: "Pagos", icon: Receipt },
    ...(isAdmin
      ? [{ href: "/admin/usuarios", label: "Familia", icon: Users }]
      : []),
    { href: "/configuracion", label: "Ajustes", icon: Settings },
  ];

  return (
    <header className="hidden border-b border-gray-200 bg-white md:block dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Control de Pagos
          </span>
          <nav className="flex gap-1">
            {items.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-neutral-400">
            {nombre}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
