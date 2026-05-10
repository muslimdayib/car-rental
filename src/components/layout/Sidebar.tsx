"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Car, TrendingDown, BadgeDollarSign, Wrench, Fuel, CalendarDays, UserCheck, Users, Briefcase, ShieldCheck, FileWarning, CircleDollarSign, BarChart3, Settings, ChevronLeft, ChevronRight
} from "lucide-react";

const menuGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Car },
    ],
  },
  {
    label: "Fleet",
    items: [
      { name: "Cars", href: "/dashboard/cars", icon: Car },
      { name: "Depreciation", href: "/dashboard/depreciation", icon: TrendingDown },
      { name: "Car Sales", href: "/dashboard/car-sales", icon: BadgeDollarSign },
      { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
      { name: "Fuel Logs", href: "/dashboard/fuel", icon: Fuel },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
      { name: "Drivers", href: "/dashboard/drivers", icon: UserCheck },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Employees", href: "/dashboard/employees", icon: Briefcase },
    ],
  },
  {
    label: "Risk",
    items: [
      { name: "Insurance", href: "/dashboard/insurance", icon: ShieldCheck },
      { name: "Claims", href: "/dashboard/claims", icon: FileWarning },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Finance", href: "/dashboard/finance", icon: CircleDollarSign },
      { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-card h-screen transition-all duration-300 sticky top-0 relative z-20",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      <div className="flex h-16 items-center justify-center border-b shrink-0 relative">
        <Car className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="ml-3 text-lg font-bold tracking-tight truncate">
            RentFlow
          </span>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent focus:outline-none z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-4 px-2">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                  {group.label}
                </div>
              )}
              {collapsed && (
                <div className="h-px w-8 mx-auto bg-border my-2" />
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex w-full items-center rounded-md py-2 text-sm font-medium transition-colors focus:outline-none",
                      collapsed ? "justify-center px-0" : "justify-start px-3",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-accent-foreground" : "text-muted-foreground"
                      )}
                    />
                    {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
