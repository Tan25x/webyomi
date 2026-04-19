"use client";

import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import type { Manga, Chapter } from "@/types";
import * as db from "@/lib/db";
import { ChevronLeft, ChevronRight, Settings, ZoomIn, ZoomOut, RotateCw, X, FlipHorizontal, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReaderPage({ params }: { params: Promise<{ mangaId: string; chapterId: string }> }) {
  const [mangaId, setMangaId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [readingMode, setReadingMode] = useState<"vertical" | "horizontal" | "webtoon">("vertical");

  const addToHistory = useStore((s) => s.addToHistory);
  const readerMode = useStore((s) => s.readerMode);

  useEffect(() => {
    params.then((p) => {
      setMangaId(p.mangaId);
      setChapterId(p.chapterId);
      loadChapter(p.mangaId, p.chapterId);
    });
    setReadingMode(readerMode);
  }, [params, readerMode]);

  useEffect(() => {
    if (currentPage > 0 && chapterId) {
      saveProgress();
    }
  }, [currentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        nextPage();
      } else if (e.key === "ArrowLeft") {
        prevPage();
      } else if (e.key === "Escape") {
        window.location.href = `/manga/${mangaId}`;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mangaId, currentPage, pages.length]);

  async function loadChapter(mangaId: string, chapterId: string) {
    setLoading(true);
    try {
      const mangaData = await db.getMangaById(mangaId);
      const chapterData = await db.getChaptersByMangaId(mangaId);
      const foundChapter = chapterData.find((c) => c.id === chapterId);
      
      if (mangaData && foundChapter) {
        setManga(mangaData);
        setChapter(foundChapter);
        setCurrentPage(foundChapter.lastPageRead || 0);
        
        // Load pages (would use source API in real implementation)
        // For now, using placeholder
        setPages([
          "https://via.placeholder.com/800x1200.png?text=Page+1",
          "https://via.placeholder.com/800x1200.png?text=Page+2",
          "https://via.placeholder.com/800x1200.png?text=Page+3",
        ]);
      }
    } catch (err) {
      console.error("Failed to load chapter:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveProgress() {
    if (!chapter) return;
    
    await db.updateChapter(chapter.id, { lastPageRead: currentPage });
    await addToHistory(mangaId, chapter.id, currentPage);
  }

  function nextPage() {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col bg-black">
      {/* Top Controls */}
      <div className={cn(
        "absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-black/80 px-4 py-3 transition-opacity",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <button onClick={() => window.location.href = `/manga/${mangaId}`} className="flex items-center gap-2 text-white">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Back</span>
        </button>
        <div className="text-center">
          <div className="text-sm font-medium text-white">{manga?.title}</div>
          <div className="text-xs text-white/70">{chapter?.name}</div>
        </div>
        <button onClick={() => setShowControls(!showControls)} className="text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Page Content */}
      <div 
        className={cn(
          "flex-1 overflow-auto",
          readingMode === "vertical" ? "flex flex-col items-center" : "flex"
        )}
        onClick={() => setShowControls(!showControls)}
      >
        {pages.length > 0 ? (
          <img
            src={pages[currentPage]}
            alt={`Page ${currentPage + 1}`}
            className={cn(
              "max-h-screen object-contain",
              readingMode === "vertical" ? "w-full max-w-2xl" : "h-screen",
              `rotate-${rotation}`
            )}
            style={{ transform: `scale(${zoom})` }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white">
            No pages available
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center gap-2 bg-black/80 p-4 transition-opacity",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {/* Page Slider */}
        <div className="w-full flex items-center gap-2">
          <span className="text-xs text-white">{currentPage + 1}</span>
          <input
            type="range"
            min={0}
            max={pages.length - 1}
            value={currentPage}
            onChange={(e) => setCurrentPage(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-white">{pages.length}</span>
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center gap-4">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="text-white">
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-xs text-white">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="text-white">
            <ZoomIn className="h-5 w-5" />
          </button>
          <div className="w-px h-5 bg-white/30" />
          <button onClick={prevPage} disabled={currentPage === 0} className="text-white disabled:opacity-50">
            <SkipBack className="h-5 w-5" />
          </button>
          <button onClick={() => setRotation((r) => (r + 90) % 360)} className="text-white">
            <RotateCw className="h-5 w-5" />
          </button>
          <button onClick={nextPage} disabled={currentPage >= pages.length - 1} className="text-white disabled:opacity-50">
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}