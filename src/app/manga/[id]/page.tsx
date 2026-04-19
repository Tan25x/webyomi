"use client";

import { useEffect, useState } from "react";
import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import type { Manga, Chapter } from "@/types";
import { BookmarkPlus, MoreVertical, ArrowLeft, Download, Share, ExternalLink } from "lucide-react";
import * as db from "@/lib/db";

export default function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const addToLibrary = useStore((s) => s.addToLibrary);
  const removeFromLibrary = useStore((s) => s.removeFromLibrary);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      loadManga(p.id);
    });
  }, [params]);

  async function loadManga(mangaId: string) {
    setLoading(true);
    try {
      const mangaData = await db.getMangaById(mangaId);
      if (mangaData) {
        setManga(mangaData);
        const chapterData = await db.getChaptersByMangaId(mangaId);
        setChapters(chapterData.sort((a, b) => b.chapterNumber - a.chapterNumber));
      }
    } catch (err) {
      console.error("Failed to load manga:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFavorite() {
    if (!manga) return;
    
    if (manga.favorite) {
      await removeFromLibrary(manga.id);
    } else {
      await addToLibrary(manga);
    }
    
    setManga({ ...manga, favorite: !manga.favorite });
  }

  if (loading) {
    return (
      <Shell>
        <Header title="Loading..." showSearch={false} />
        <div className="p-4 flex justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </Shell>
    );
  }

  if (!manga) {
    return (
      <Shell>
        <Header title="Not Found" showSearch={false} />
        <div className="p-4 text-center">
          <p>Manga not found</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header 
        title="" 
        showSearch={false}
        actions={
          <button onClick={handleToggleFavorite} className="rounded-lg p-2 hover:bg-surface-container-high">
            <BookmarkPlus className={`h-5 w-5 ${manga.favorite ? "fill-primary text-primary" : ""}`} />
          </button>
        }
      />
      
      <div className="p-4">
        {/* Manga Info */}
        <div className="mb-6 flex gap-4">
          <div className="w-32 shrink-0">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-highest">
              {manga.thumbnailUrl && (
                <img
                  src={manga.thumbnailUrl}
                  alt={manga.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="mb-2 text-xl font-bold">{manga.title}</h1>
            {manga.author && (
              <p className="mb-1 text-sm text-on-surface-variant">by {manga.author}</p>
            )}
            {manga.artist && (
              <p className="mb-1 text-sm text-on-surface-variant">by {manga.artist}</p>
            )}
            <div className="mb-2 flex flex-wrap gap-2">
              {manga.genre?.map((g) => (
                <span key={g} className="rounded-full bg-surface-container px-2 py-0.5 text-xs">
                  {g}
                </span>
              ))}
            </div>
            {manga.status !== undefined && (
              <p className="text-sm">
                Status: {["Unknown", "Ongoing", "Completed", "Licensed", "Finished", "Cancelled"][manga.status] || "Unknown"}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {manga.description && (
          <div className="mb-6">
            <p className="text-sm text-on-surface-variant">{manga.description}</p>
          </div>
        )}

        {/* Chapters */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Chapters ({chapters.length})
          </h2>
          <div className="space-y-1">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-outline-variant bg-surface p-3 hover:bg-surface-container-high"
                onClick={() => {
                  window.location.href = `/reader/${manga.id}/${chapter.id}`;
                }}
              >
                <div>
                  <div className="font-medium">{chapter.name}</div>
                  {chapter.scanlator && (
                    <div className="text-xs text-on-surface-variant">{chapter.scanlator}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {chapter.isRead && (
                    <span className="text-xs text-on-surface-variant">Read</span>
                  )}
                  <span className="text-sm text-on-surface-variant">
                    {chapter.pageCount ? `${chapter.pageCount} pages` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {chapters.length === 0 && (
            <div className="py-8 text-center text-on-surface-variant">
              <p>No chapters found</p>
              <button className="mt-2 text-primary">Refresh</button>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}