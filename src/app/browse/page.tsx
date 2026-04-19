"use client";

import { useState } from "react";
import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import type { SManga } from "@/types";
import { Search, Globe, ArrowRight, RefreshCw } from "lucide-react";

const defaultSources = [
  { id: "mangadex", name: "MangaDex", lang: "en", baseUrl: "https://mangadex.org", supportsLatest: true },
  { id: "manganato", name: "MangaNato", lang: "en", baseUrl: "https://manganato.com", supportsLatest: true },
  { id: "toonguyenviet", name: "Toonguyenviet", lang: "vi", baseUrl: "https://toonguyenviet.me", supportsLatest: true },
];

// Placeholder manga data since sources require server-side proxy
const placeholderManga: SManga[] = [
  { url: "/manga/1", title: "Sample Manga 1", thumbnailUrl: null, author: "Author 1", artist: null, description: "Description 1", genre: ["Action", "Adventure"], status: 1, updateStrategy: 0 },
  { url: "/manga/2", title: "Sample Manga 2", thumbnailUrl: null, author: "Author 2", artist: null, description: "Description 2", genre: ["Romance"], status: 0, updateStrategy: 0 },
  { url: "/manga/3", title: "Sample Manga 3", thumbnailUrl: null, author: "Author 3", artist: null, description: "Description 3", genre: ["Comedy"], status: 2, updateStrategy: 0 },
  { url: "/manga/4", title: "Sample Manga 4", thumbnailUrl: null, author: "Author 4", artist: null, description: "Description 4", genre: ["Drama"], status: 1, updateStrategy: 0 },
  { url: "/manga/5", title: "Sample Manga 5", thumbnailUrl: null, author: "Author 5", artist: null, description: "Description 5", genre: ["Horror"], status: 0, updateStrategy: 0 },
];

export default function BrowsePage() {
  const [sources] = useState(defaultSources);
  const [selectedSource, setSelectedSource] = useState(defaultSources[0]);
  const [manga, setManga] = useState<SManga[]>(placeholderManga);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  const addToLibrary = useStore((s) => s.addToLibrary);
  const mangaList = useStore((s) => s.mangaList);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearchMode(true);
    // Filter placeholder data for demo
    if (searchQuery) {
      const filtered = placeholderManga.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setManga(filtered);
    } else {
      setManga(placeholderManga);
    }
  }

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }

  async function handleAddManga(m: SManga) {
    const newManga = {
      id: crypto.randomUUID(),
      sourceId: selectedSource.id,
      url: m.url,
      title: m.title,
      author: m.author,
      artist: m.artist,
      description: m.description,
      genre: m.genre,
      status: m.status as 0 | 1 | 2 | 3 | 4 | 5,
      thumbnailUrl: m.thumbnailUrl,
      updateStrategy: m.updateStrategy,
      initialized: false,
      favorite: true,
      lastUpdate: 0,
      nextUpdate: 0,
      fetchInterval: 0,
      dateAdded: Date.now(),
      viewerFlags: 0,
      chapterFlags: 0,
      coverLastModified: 0,
      lastModifiedAt: 0,
      favoriteModifiedAt: null,
      version: 0,
      notes: "",
    };
    
    await addToLibrary(newManga);
  }

  const isInLibrary = (url: string) => {
    return mangaList.some((m) => m.url === url && m.favorite);
  };

  return (
    <Shell>
      <Header title="Browse" showSearch={false} />
      
      <div className="p-4">
        {/* Source Tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => {
                setSelectedSource(source);
                setSearchMode(false);
              }}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                selectedSource.id === source.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {source.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search manga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchMode(true)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-on-primary">
            Search
          </button>
        </form>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-surface-container-high aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {manga.map((m, i) => (
              <div key={`${m.url}-${i}`} className="group relative">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-highest">
                  {m.thumbnailUrl && (
                    <img src={m.thumbnailUrl} alt={m.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="mt-1 line-clamp-2 text-sm">{m.title}</div>
                <button
                  onClick={() => handleAddManga(m)}
                  disabled={isInLibrary(m.url)}
                  className={`absolute bottom-12 right-2 rounded-full p-2 opacity-0 transition-opacity group-hover:opacity-100 ${
                    isInLibrary(m.url)
                      ? "bg-tertiary text-on-tertiary"
                      : "bg-primary text-on-primary"
                  }`}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {manga.length > 0 && !loading && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2"
            >
              <RefreshCw className="h-4 w-4" />
              Load More
            </button>
          </div>
        )}

        {manga.length === 0 && !loading && (
          <div className="py-12 text-center text-on-surface-variant">
            <Globe className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Select a source and browse manga</p>
          </div>
        )}
      </div>
    </Shell>
  );
}