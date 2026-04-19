"use client";

import { Shell, Header } from "@/components/layout";
import { MangaGrid } from "@/components/manga";
import { useStore } from "@/lib/store";
import { Filter, SortAsc } from "lucide-react";

export default function LibraryPage() {
  const mangaList = useStore((s) => s.mangaList);
  const filters = useStore((s) => s.filters);
  const displayMode = useStore((s) => s.displayMode);

  const filteredManga = mangaList
    .filter((m) => m.favorite)
    .filter((m) => {
      if (!filters.search) return true;
      const search = filters.search.toLowerCase();
      return (
        m.title.toLowerCase().includes(search) ||
        m.author?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 0:
          return filters.sortDirection === 1 ? b.dateAdded - a.dateAdded : a.dateAdded - b.dateAdded;
        case 1:
          return filters.sortDirection === 1 ? b.lastUpdate - a.lastUpdate : a.lastUpdate - b.lastUpdate;
        case 3:
          return filters.sortDirection === 1 ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <Shell>
      <Header title="Library" />
      
      <div className="p-4">
        {/* Toolbar */}
        <div className="mb-4 flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5 text-sm">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5 text-sm">
            <SortAsc className="h-4 w-4" />
            Sort
          </button>
          <div className="flex-1" />
          <span className="text-sm text-on-surface-variant">
            {filteredManga.length} manga
          </span>
        </div>

        <MangaGrid
          manga={filteredManga}
          onMangaClick={(m) => {
            window.location.href = `/manga/${m.id}`;
          }}
        />
      </div>
    </Shell>
  );
}