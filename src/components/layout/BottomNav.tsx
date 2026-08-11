"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, Settings, Users } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
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
    <nav className="fixed inset-x-0 bottom-0 z-20 h-[62px] border-t border-border-subtle bg-surface-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex h-full">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-xs ${
                  active ? "text-text-accent" : "text-text-tertiary"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
