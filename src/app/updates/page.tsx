"use client";

import { useEffect, useState } from "react";
import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import { RefreshCw, ChevronRight, Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Manga, Chapter } from "@/types";
import * as db from "@/lib/db";

interface ChapterWithManga extends Chapter {
  manga?: Manga;
}

export default function UpdatesPage() {
  const mangaList = useStore((s) => s.mangaList);
  const [updates, setUpdates] = useState<ChapterWithManga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpdates();
  }, []);

  async function loadUpdates() {
    setLoading(true);
    try {
      // Get all chapters from library manga
      const libraryManga = mangaList.filter(m => m.favorite);
      const allChapters: ChapterWithManga[] = [];

      for (const manga of libraryManga) {
        const chapters = await db.getChaptersByMangaId(manga.id);
        for (const chapter of chapters) {
          allChapters.push({ ...chapter, manga });
        }
      }

      // Sort by date upload (newest first)
      allChapters.sort((a, b) => b.dateUpload - a.dateUpload);

      // Take first 50
      setUpdates(allChapters.slice(0, 50));
    } catch (err) {
      console.error("Failed to load updates:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <Header title="Updates" showSearch={false} />
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-on-surface-variant" />
          </div>
        ) : updates.length > 0 ? (
          <div className="space-y-2">
            {updates.map((chapter) => (
              <div
                key={chapter.id}
                onClick={() => chapter.manga && (window.location.href = `/reader/${chapter.manga.id}/${chapter.id}`)}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant bg-surface p-3 hover:bg-surface-container-high"
              >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-surface-container-highest">
                  {chapter.manga?.thumbnailUrl && (
                    <img
                      src={chapter.manga.thumbnailUrl}
                      alt={chapter.manga.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chapter.manga?.title}</div>
                  <div className="text-sm text-on-surface-variant truncate">{chapter.name}</div>
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                    <Clock className="h-3 w-3" />
                    {chapter.dateUpload > 0 ? formatRelativeTime(chapter.dateUpload) : 'Unknown'}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-on-surface-variant" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RefreshCw className="mb-4 h-12 w-12 text-on-surface-variant opacity-50" />
            <h3 className="mb-1 text-lg font-medium">No updates yet</h3>
            <p className="text-sm text-on-surface-variant">
              Add manga to your library to see updates here
            </p>
            <a
              href="/browse"
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary"
            >
              Browse Sources
            </a>
          </div>
        )}
      </div>
    </Shell>
  );
}