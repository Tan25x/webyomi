"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import { builtInSources, getAdapter, type MangaEntry, type Source } from "@/lib/sources";
import { Search, Globe, Plus, RefreshCw, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const languageLabels: Record<string, string> = {
  id: "Indonesian",
  en: "English",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  all: "All",
};

export default function BrowsePage() {
  const router = useRouter();
  const [selectedSource, setSelectedSource] = useState<Source>(builtInSources[0]);
  const [manga, setManga] = useState<MangaEntry[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filterLang, setFilterLang] = useState<string>("all");

  const addToLibrary = useStore((s) => s.addToLibrary);
  const mangaList = useStore((s) => s.mangaList);

  // Filter sources by language
  const filteredSources = builtInSources.filter(s => 
    filterLang === "all" || s.lang === filterLang || s.lang === "all"
  );

  // Load manga from source
  const loadManga = useCallback(async (sourceId: string, pageNum: number, isSearch: boolean, query?: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const adapter = getAdapter(sourceId);
      if (!adapter) {
        console.error("No adapter found for:", sourceId);
        setManga([]);
        return;
      }

      let results: MangaEntry[];
      if (isSearch && query) {
        results = await adapter.searchManga(query, pageNum);
      } else {
        results = await adapter.getPopularManga(pageNum);
      }

      if (pageNum === 1) {
        setManga(results);
      } else {
        setManga(prev => [...prev, ...results]);
      }

      setHasMore(results.length > 0);
    } catch (err) {
      console.error("Failed to load manga:", err);
      setManga([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (selectedSource) {
      loadManga(selectedSource.id, page, searchMode, searchQuery);
    }
  }, [selectedSource, page, searchMode]);

  useEffect(() => {
    // Reset when source changes
    setPage(1);
    setManga([]);
    setHasMore(true);
  }, [selectedSource]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearchMode(true);
    setPage(1);
    setLoading(true);
    
    try {
      const adapter = getAdapter(selectedSource.id);
      if (adapter) {
        const results = await adapter.searchManga(searchQuery, 1);
        setManga(results);
        setHasMore(results.length > 0);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddManga(m: MangaEntry) {
    const newManga = {
      id: crypto.randomUUID(),
      sourceId: selectedSource.id,
      url: m.url,
      title: m.title,
      author: m.author,
      artist: m.artist,
      description: m.description,
      genre: m.genre,
      status: m.status as 0,
      thumbnailUrl: m.thumbnailUrl,
      updateStrategy: 0 as 0,
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
    
    await addToLibrary(newManga as any);
  }

  function handleLoadMore() {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }

  const handleSourceChange = (source: Source) => {
    setSelectedSource(source);
    setSearchMode(false);
    setSearchQuery("");
  };

  const isInLibrary = (url: string) => {
    return mangaList.some((m) => m.url === url && m.favorite);
  };

  return (
    <Shell>
      <Header title="Browse" showSearch={false} />
      
      <div className="p-4">
        {/* Language Filter */}
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {Object.entries(languageLabels).map(([lang, label]) => (
            <button
              key={lang}
              onClick={() => setFilterLang(lang)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm",
                filterLang === lang
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Source Tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {filteredSources.map((source) => (
            <button
              key={source.id}
              onClick={() => handleSourceChange(source)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm",
                selectedSource.id === source.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant"
              )}
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
              placeholder={`Search ${selectedSource.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !searchQuery.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-on-primary disabled:opacity-50"
          >
            Search
          </button>
        </form>

        {/* Results */}
        {loading && manga.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-on-surface-variant" />
          </div>
        ) : manga.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {manga.map((m, i) => (
                <div key={`${m.url}-${i}`} className="group relative">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-highest">
                    {m.thumbnailUrl ? (
                      <img 
                        src={m.thumbnailUrl} 
                        alt={m.title} 
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-on-surface-variant text-xs">
                        No Cover
                      </div>
                    )}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm">{m.title}</div>
                  <button
                    onClick={() => handleAddManga(m)}
                    disabled={isInLibrary(m.url)}
                    className={cn(
                      "absolute bottom-12 right-2 rounded-full p-2 opacity-0 transition-opacity group-hover:opacity-100",
                      isInLibrary(m.url)
                        ? "bg-tertiary text-on-tertiary"
                        : "bg-primary text-on-primary"
                    )}
                  >
                    {isInLibrary(m.url) ? (
                      <span className="text-xs">✓</span>
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && !loading && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Load More
                </button>
              </div>
            )}

            {loading && (
              <div className="mt-4 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-on-surface-variant" />
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-on-surface-variant">
            <Globe className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No manga found</p>
            <p className="text-sm mt-2">Try a different search or source</p>
          </div>
        )}
      </div>
    </Shell>
  );
}