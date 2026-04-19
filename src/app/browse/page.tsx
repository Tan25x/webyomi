"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import { builtInSources, getAdapter, type MangaEntry, type Source } from "@/lib/sources";
import { Search, Globe, Plus, RefreshCw, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// Import fonts
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

const languageLabels: Record<string, string> = {
  id: "ID",
  en: "EN",
  zh: "ZH",
  ja: "JA",
  ko: "KO",
};

export default function BrowsePage() {
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

      setHasMore(results.length >= 20);
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
  }, [selectedSource, page, searchMode, loadManga]);

  useEffect(() => {
    setPage(1);
    setManga([]);
    setHasMore(true);
  }, [selectedSource, filterLang]);

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

  const isInLibrary = (url: string) => {
    return mangaList.some((m) => m.url === url && m.favorite);
  };

  return (
    <Shell>
      <div className="min-h-screen bg-[#1a1a1f]" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#1a1a1f] border-b border-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold text-white">Browse</h1>
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder={`Search ${selectedSource.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder-white/50 focus:border-primary focus:outline-none"
                />
              </div>
            </form>
          </div>

          {/* Source chips */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
            {filteredSources.map((source) => (
              <button
                key={source.id}
                onClick={() => {
                  setSelectedSource(source);
                  setSearchMode(false);
                }}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selectedSource.id === source.id
                    ? "bg-primary text-white"
                    : "bg-white/5 text-white/70 hover:text-white"
                )}
              >
                {source.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Language filter */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {Object.entries(languageLabels).map(([lang, label]) => (
              <button
                key={lang}
                onClick={() => setFilterLang(lang)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filterLang === lang
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/50 hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Results grid - Mimanga style */}
          {loading && manga.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-sm text-white/50">Loading...</p>
            </div>
          ) : manga.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {manga.map((m, i) => (
                  <div 
                    key={`${m.url}-${i}`} 
                    className="group relative bg-[#252530] rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
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
                    {/* Add button overlay */}
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity",
                      isInLibrary(m.url) && "opacity-100"
                    )}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddManga(m);
                        }}
                        className={cn(
                          "rounded-full p-3 transition-colors",
                          isInLibrary(m.url)
                            ? "bg-green-500 text-white"
                            : "bg-primary text-white hover:bg-primary/80"
                        )}
                      >
                        {isInLibrary(m.url) ? (
                          <BookOpen className="h-5 w-5" />
                        ) : (
                          <Plus className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Globe className="h-16 w-16 text-white/20" />
              <p className="mt-4 text-base font-medium text-white">No manga found</p>
              <p className="text-sm text-white/50">Try a different source or search</p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}