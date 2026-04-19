"use client";

import { useState } from "react";
import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import { Moon, Sun, Monitor, Grid, List, ArrowUpToLine, ArrowDownToLine, User, Download, FolderOpen, BarChart3, Info, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as db from "@/lib/db";

export default function MorePage() {
  const theme = useStore((s) => s.theme);
  const displayMode = useStore((s) => s.displayMode);
  const setTheme = useStore((s) => s.setTheme);
  const setDisplayMode = useStore((s) => s.setDisplayMode);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const mangaList = useStore((s) => s.mangaList);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const libraryCount = mangaList.filter(m => m.favorite).length;

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  const displayModes = [
    { value: "grid", label: "Grid", icon: Grid },
    { value: "list", label: "List", icon: List },
  ] as const;

  const sections = [
    {
      id: "library",
      label: "Library",
      icon: FolderOpen,
      items: [
        { label: "Titles in library", value: `${libraryCount}` },
      ]
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      items: [
        { 
          label: "Appearance", 
          value: theme,
          type: "theme" as const
        },
        { 
          label: "Display mode", 
          value: displayMode,
          type: "display" as const
        },
      ]
    },
    {
      id: "account",
      label: "Account",
      icon: User,
      items: [
        { 
          label: isAuthenticated ? "Signed in" : "Sign in to sync",
          value: isAuthenticated ? "Connected" : "Not connected",
          action: "/auth"
        },
      ]
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      items: [
        { label: "Version", value: "0.1.0" },
        { label: "Based on", value: "Mihon/Tachiyomi" },
        { label: "Built with", value: "Next.js + Supabase" },
      ]
    },
  ];

  async function handleClearData() {
    const { clearAllData } = await import("@/lib/db");
    await clearAllData();
    window.location.reload();
  }

  async function handleExport() {
    const { exportData } = await import("@/lib/db");
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webyomi-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Shell>
      <Header title="More" showSearch={false} />
      
      <div className="p-4 space-y-4">
        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-on-surface-variant">
              <section.icon className="h-4 w-4" />
              {section.label}
            </h2>
            <div className="rounded-lg border border-outline-variant bg-surface divide-y divide-outline-variant">
              {section.items.map((item: any, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3"
                >
                  <span>{item.label}</span>
                  {item.type === "theme" && (
                    <div className="flex gap-1">
                      {themes.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTheme(t.value)}
                          className={cn(
                            "flex items-center gap-1 rounded-lg border border-outline-variant px-2 py-1 text-xs",
                            theme === t.value && "border-primary bg-primary-container"
                          )}
                        >
                          <t.icon className="h-3 w-3" />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {item.type === "display" && (
                    <div className="flex gap-1">
                      {displayModes.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setDisplayMode(d.value)}
                          className={cn(
                            "flex items-center gap-1 rounded-lg border border-outline-variant px-2 py-1 text-xs",
                            displayMode === d.value && "border-primary bg-primary-container"
                          )}
                        >
                          <d.icon className="h-3 w-3" />
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {item.value && !item.type && (
                    <span className="text-sm text-on-surface-variant">{item.value}</span>
                  )}
                  {item.action && (
                    <a href={item.action} className="text-sm text-primary">Configure</a>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Data Management */}
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-on-surface-variant">
            <Download className="h-4 w-4" />
            Data
          </h2>
          <div className="rounded-lg border border-outline-variant bg-surface divide-y divide-outline-variant">
            <button
              onClick={handleExport}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <ArrowUpToLine className="h-5 w-5" />
              <span>Export Library</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full items-center gap-3 p-3 text-left text-error"
            >
              <Trash2 className="h-5 w-5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-80 rounded-lg bg-surface p-6">
              <h3 className="mb-2 text-lg font-semibold">Clear All Data?</h3>
              <p className="mb-4 text-sm text-on-surface-variant">
                This will permanently delete all your library data. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-lg border border-outline-variant py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearData}
                  className="flex-1 rounded-lg bg-error py-2 text-on-error"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}