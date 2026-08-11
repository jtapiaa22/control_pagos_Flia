"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, ReceiptText, Settings, Users } from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export function Sidebar({
  isAdmin,
  nombre,
}: {
  isAdmin: boolean;
  nombre: string;
}) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/pagos", label: "Pagos", icon: ReceiptText },
    ...(isAdmin
      ? [{ href: "/admin/usuarios", label: "Familia", icon: Users }]
      : []),
    { href: "/configuracion", label: "Ajustes", icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-border-subtle bg-surface-card px-5 py-6 md:flex">
      <div className="flex items-center justify-between">
        <span className="font-display text-[17px] font-semibold tracking-heading text-text-primary">
          Control de Pagos
        </span>
      </div>

      <Link
        href="/pagos/nuevo"
        className="mt-6 flex h-10 items-center justify-center gap-1.5 rounded-md bg-action-primary text-sm font-medium text-action-primary-text transition hover:bg-action-primary-hover active:bg-action-primary-pressed"
      >
        <Plus className="h-4 w-4" />
        Agregar pago
      </Link>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-10 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition ${
                active
                  ? "bg-surface-accent-soft text-text-accent"
                  : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-border-subtle pt-4">
        <span className="truncate text-sm text-text-secondary">{nombre}</span>
        <LogoutButton />
      </div>
    </aside>
  );
}
