"use client";

import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import { BookOpen, ChevronRight, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function HistoryPage() {
  const history = useStore((s) => s.history);
  const mangaList = useStore((s) => s.mangaList);

  const historyWithManga = history.map((h) => {
    const manga = mangaList.find((m) => m.id === h.mangaId);
    return { ...h, manga };
  }).filter((h) => h.manga);

  return (
    <Shell>
      <Header title="History" showSearch={false} />
      
      <div className="p-4">
        {historyWithManga.length > 0 ? (
          <div className="space-y-2">
            {historyWithManga.map((h) => (
              <div
                key={h.chapterId}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant bg-surface p-3 hover:bg-surface-container-high"
                onClick={() => {
                  window.location.href = `/reader/${h.mangaId}/${h.chapterId}`;
                }}
              >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-surface-container-highest">
                  {h.manga?.thumbnailUrl && (
                    <img
                      src={h.manga.thumbnailUrl}
                      alt={h.manga?.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{h.manga?.title}</div>
                  <div className="text-sm text-on-surface-variant">
                    Page {h.page + 1}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {formatRelativeTime(h.readAt)}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-on-surface-variant" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-on-surface-variant opacity-50" />
            <h3 className="mb-1 text-lg font-medium">No Reading History</h3>
            <p className="text-sm text-on-surface-variant">
              Start reading to track your progress
            </p>
          </div>
        )}
      </div>
    </Shell>
  );
}