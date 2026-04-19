"use client";

import { useState } from "react";
import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import { Search, Filter, SortAsc, Library, BookOpen, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function LibraryPage() {
  const mangaList = useStore((s) => s.mangaList);
  const filters = useStore((s) => s.filters);
  const setSearchFilter = useStore((s) => s.setSearchFilter);
  const setSortBy = useStore((s) => s.setSortBy);
  const setSortDirection = useStore((s) => s.setSortDirection);
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const libraryManga = mangaList.filter((m) => m.favorite);

  const filteredManga = libraryManga
    .filter((m) => {
      if (!localSearch) return true;
      const search = localSearch.toLowerCase();
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

  const sortOptions = [
    { value: 0, label: "Added" },
    { value: 1, label: "Updated" },
    { value: 3, label: "Title" },
  ];

  return (
    <Shell>
      <div className="min-h-screen bg-[#1a1a1f]" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#1a1a1f] border-b border-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold text-white">Library</h1>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showFilters ? "bg-primary text-white" : "bg-white/10 text-white"
              )}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                type="text"
                placeholder="Search library..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder-white/50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="px-4 pb-3 bg-[#252530]">
              <div className="mb-2">
                <span className="text-xs text-white/50">Sort by</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as 0 | 1 | 2 | 3)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        filters.sortBy === option.value
                          ? "bg-primary text-white"
                          : "bg-white/5 text-white/70"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="p-3">
          {filteredManga.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredManga.map((m) => (
                <div 
                  key={m.id}
                  className="group relative bg-[#252530] rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => window.location.href = `/manga/${m.id}`}
                >
                  <div className="aspect-[3/4] bg-[#1a1a1f]">
                    {m.thumbnailUrl ? (
                      <img 
                        src={m.thumbnailUrl} 
                        alt={m.title} 
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30 text-xs">
                        No Cover
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs font-medium text-white line-clamp-2 leading-tight">{m.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : libraryManga.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Library className="h-16 w-16 text-white/20" />
              <p className="mt-4 text-base font-medium text-white">Your library is empty</p>
              <p className="text-sm text-white/50 mt-1">Browse sources to add manga</p>
              <a
                href="/browse"
                className="mt-4 flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" />
                Browse
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <Search className="h-16 w-16 text-white/20" />
              <p className="mt-4 text-base font-medium text-white">No results</p>
              <p className="text-sm text-white/50 mt-1">Try a different search</p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}