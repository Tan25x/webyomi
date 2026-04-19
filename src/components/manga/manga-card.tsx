"use client";

import { useStore } from "@/lib/store";
import { BookmarkPlus, MoreVertical, Eye, Download, Trash2 } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Manga } from "@/types";

interface MangaCardProps {
  manga: Manga;
  onClick?: () => void;
}

export function MangaCard({ manga, onClick }: MangaCardProps) {
  const displayMode = useStore((s) => s.displayMode);
  const removeFromLibrary = useStore((s) => s.removeFromLibrary);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFromLibrary(manga.id);
  };

  if (displayMode === "list") {
    return (
      <div
        onClick={onClick}
        className="flex cursor-pointer gap-3 rounded-lg border border-outline-variant bg-surface p-3 hover:bg-surface-container-high"
      >
        <div className="h-24 w-16 shrink-0 overflow-hidden rounded bg-surface-container-highest">
          {manga.thumbnailUrl && (
            <img
              src={manga.thumbnailUrl}
              alt={manga.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="line-clamp-2 font-medium">{manga.title}</h3>
            {manga.author && (
              <p className="text-sm text-on-surface-variant">{manga.author}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">
              {manga.dateAdded > 0 && formatRelativeTime(manga.dateAdded)}
            </span>
            <button
              onClick={handleRemove}
              className="rounded p-1 hover:bg-error/10 hover:text-error"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-highest">
        {manga.thumbnailUrl ? (
          <img
            src={manga.thumbnailUrl}
            alt={manga.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
            No Cover
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleRemove}
            className="rounded-full bg-surface p-2 text-on-surface hover:bg-error hover:text-on-error"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
        
        {/* Unread badge */}
        {manga.chapterFlags > 0 && (
          <div className="absolute right-2 top-2 rounded bg-secondary px-1.5 py-0.5 text-xs font-bold text-on-secondary">
            New
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight">
          {manga.title}
        </h3>
      </div>
    </div>
  );
}

interface MangaGridProps {
  manga: Manga[];
  onMangaClick?: (manga: Manga) => void;
  loading?: boolean;
}

export function MangaGrid({ manga, onMangaClick, loading }: MangaGridProps) {
  const displayMode = useStore((s) => s.displayMode);

  if (loading) {
    return (
      <div className={cn(
        "grid gap-4",
        displayMode === "grid" 
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
          : "flex flex-col"
      )}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse rounded-lg bg-surface-container-high",
              displayMode === "grid" ? "aspect-[3/4]" : "h-20"
            )}
          />
        ))}
      </div>
    );
  }

  if (manga.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-surface-container-high p-4">
          <BookmarkPlus className="h-8 w-8 text-on-surface-variant" />
        </div>
        <h3 className="mb-1 text-lg font-medium">Your library is empty</h3>
        <p className="text-sm text-on-surface-variant">
          Browse and add manga to start reading
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4",
      displayMode === "grid" 
        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
        : "flex flex-col"
    )}>
      {manga.map((m) => (
        <MangaCard
          key={m.id}
          manga={m}
          onClick={onMangaClick ? () => onMangaClick(m) : undefined}
        />
      ))}
    </div>
  );
}