"use client";

import { useState } from "react";
import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import { MangaGrid } from "@/components/manga";
import { Filter, SortAsc, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LibraryPage() {
  const mangaList = useStore((s) => s.mangaList);
  const filters = useStore((s) => s.filters);
  const setSearchFilter = useStore((s) => s.setSearchFilter);
  const setSortBy = useStore((s) => s.setSortBy);
  const setSortDirection = useStore((s) => s.setSortDirection);
  const [showFilters, setShowFilters] = useState(false);

  const libraryManga = mangaList.filter((m) => m.favorite);

  const filteredManga = libraryManga
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
        case 0: // Date added
          return filters.sortDirection === 1 ? b.dateAdded - a.dateAdded : a.dateAdded - b.dateAdded;
        case 1: // Last read
          return filters.sortDirection === 1 ? b.lastUpdate - a.lastUpdate : a.lastUpdate - b.lastUpdate;
        case 2: // Chapter count
          return filters.sortDirection === 1 ? (b.lastUpdate || 0) - (a.lastUpdate || 0) : (a.lastUpdate || 0) - (b.lastUpdate || 0);
        case 3: // Title
          return filters.sortDirection === 1 ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const sortOptions = [
    { value: 0, label: "Date added" },
    { value: 1, label: "Last read" },
    { value: 2, label: "Chapters" },
    { value: 3, label: "Title" },
  ];

  return (
    <Shell>
      <Header title="Library" showSearch />
      
      <div className="p-4">
        {/* Toolbar */}
        <div className="mb-4 flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
              showFilters ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container"
            )}
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button 
            onClick={() => setSortDirection(filters.sortDirection === 1 ? 0 : 1)}
            className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5 text-sm"
          >
            <SortAsc className="h-4 w-4" />
            {sortOptions.find(o => o.value === filters.sortBy)?.label}
          </button>
          <div className="flex-1" />
          <span className="text-sm text-on-surface-variant">
            {filteredManga.length} titles
          </span>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-4 rounded-lg border border-outline-variant bg-surface-container p-3">
            <div className="mb-3">
              <label className="mb-2 block text-sm font-medium">Sort by</label>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as 0 | 1 | 2 | 3)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs",
                      filters.sortBy === option.value
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <MangaGrid
          manga={filteredManga}
          onMangaClick={(m) => {
            window.location.href = `/manga/${m.id}`;
          }}
        />

        {libraryManga.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shuffle className="mb-4 h-12 w-12 text-on-surface-variant opacity-50" />
            <h3 className="mb-1 text-lg font-medium">Your library is empty</h3>
            <p className="mb-4 text-sm text-on-surface-variant">
              Browse sources to add manga to your library
            </p>
            <a
              href="/browse"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary"
            >
              Browse Sources
            </a>
          </div>
        )}
      </div>
    </Shell>
  );
}