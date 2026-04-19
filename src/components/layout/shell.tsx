"use client";

import { useEffect } from "react";
import { useStore, initializeStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import { Home, Library, Compass, Settings, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/browse", icon: Compass, label: "Browse" },
  { href: "/library", icon: Library, label: "Library" },
  { href: "/history", icon: BookOpen, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const displayMode = useStore((s) => s.displayMode);

  useEffect(() => {
    initializeStore();
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Mobile Navigation - Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-outline-variant bg-surface-container md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-outline-variant bg-surface-container md:flex">
        <div className="flex h-14 items-center border-b border-outline-variant px-4">
          <span className="text-lg font-semibold">WebYomi</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}