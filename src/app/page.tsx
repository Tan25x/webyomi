"use client";

import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import { MangaGrid } from "@/components/manga";
import { TrendingUp, Library } from "lucide-react";

export default function HomePage() {
  const mangaList = useStore((s) => s.mangaList);
  const filters = useStore((s) => s.filters);

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

  const libraryCount = mangaList.filter((m) => m.favorite).length;

  return (
    <Shell>
      <Header title="WebYomi" showSearch />
      
      <div className="p-4">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-surface-container p-4 text-center">
            <div className="text-2xl font-bold">{libraryCount}</div>
            <div className="text-xs text-on-surface-variant">In Library</div>
          </div>
          <div className="rounded-lg bg-surface-container p-4 text-center">
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-on-surface-variant">Unread</div>
          </div>
          <div className="rounded-lg bg-surface-container p-4 text-center">
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-on-surface-variant">Downloaded</div>
          </div>
        </div>

        {libraryCount > 0 ? (
          <>
            <section className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Library className="h-5 w-5" />
                My Library
              </h2>
              <MangaGrid
                manga={filteredManga}
                onMangaClick={(m) => {
                  window.location.href = `/manga/${m.id}`;
                }}
              />
            </section>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-surface-container-high p-4">
              <TrendingUp className="h-8 w-8 text-on-surface-variant" />
            </div>
            <h3 className="mb-1 text-lg font-medium">Welcome to WebYomi</h3>
            <p className="mb-4 text-sm text-on-surface-variant">
              Your manga library is empty. Start by browsing sources to add manga.
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