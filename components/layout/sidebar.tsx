"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand/brand-mark";
import { 
  LayoutDashboard, 
  MonitorSmartphone, 
  QrCode,
  ChefHat, 
  ClipboardList, 
  Utensils, 
  Package, 
  Users, 
  Settings,
  CalendarDays,
  BarChart3
} from "lucide-react";

const navItems = [
  { name: "Painel", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: MonitorSmartphone },
  { name: "Tablet", href: "/tablet-ordering", icon: QrCode },
  { name: "KOT", href: "/kot", icon: ChefHat },
  { name: "Pedidos", href: "/orders", icon: ClipboardList },
  { name: "Reservas", href: "/reservations", icon: CalendarDays },
  { name: "Cardápio", href: "/menu", icon: Utensils },
  { name: "Estoque", href: "/inventory", icon: Package },
  { name: "Clientes", href: "/customers", icon: Users },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface-shell flex h-screen w-[92px] flex-col border-r border-border/70 px-3 pb-5 pt-8 transition-all duration-300 xl:w-[280px] xl:px-4 xl:pt-10">
      <div className="flex min-h-[72px] items-start justify-center xl:min-h-[132px] xl:justify-start">
        <BrandMark compact className="xl:hidden" />
        <BrandMark withTagline className="hidden xl:flex" />
      </div>

      <nav className="scrollbar-hide mt-8 flex flex-1 flex-col gap-3 overflow-y-auto xl:mt-10">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="group">
              <div
                className={cn(
                  "relative flex items-center justify-center gap-3 rounded-[var(--radius-large)] px-3 py-3 transition-all duration-200 xl:justify-start xl:px-4",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-brand)]"
                    : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
                <span className="hidden text-sm font-semibold xl:inline">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-[var(--radius-large)] border border-border/60 bg-card/80 p-3 shadow-[var(--shadow-elevation-1)]">
        <div className="flex items-center justify-center gap-3 xl:justify-start">
          <div className="brand-script flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-primary-foreground">
            भ
          </div>
          <div className="hidden xl:block">
            <p className="text-sm font-semibold text-foreground">Restaurant OS</p>
            <p className="text-xs font-medium text-muted-foreground">Gestão completa do restaurante</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
