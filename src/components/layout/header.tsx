"use client";

import { useStore } from "@/lib/store";
import { Menu, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  showMenu?: boolean;
  showSearch?: boolean;
  actions?: React.ReactNode;
}

export function Header({ title, showMenu = false, showSearch = true, actions }: HeaderProps) {
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const filters = useStore((s) => s.filters);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-outline-variant bg-surface px-4">
      {showMenu && (
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 hover:bg-surface-container-high"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <h1 className="flex-1 text-lg font-semibold">{title}</h1>

      {showSearch && (
        <div className="relative flex-1 max-w-md md:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search library..."
            value={filters.search}
            onChange={(e) => useStore.getState().setSearchFilter(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <button className="rounded-lg p-2 hover:bg-surface-container-high">
          <Bell className="h-5 w-5" />
        </button>
        {actions}
      </div>
    </header>
  );
}