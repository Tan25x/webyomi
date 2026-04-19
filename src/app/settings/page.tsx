"use client";

import { useState } from "react";
import { Shell, Header } from "@/components/layout";
import { useStore } from "@/lib/store";
import { Moon, Sun, Monitor, Grid, List, Download, Trash2, ArrowUpToLine, ArrowDownToLine, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const theme = useStore((s) => s.theme);
  const displayMode = useStore((s) => s.displayMode);
  const setTheme = useStore((s) => s.setTheme);
  const setDisplayMode = useStore((s) => s.setDisplayMode);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  const displayModes = [
    { value: "grid", label: "Grid", icon: Grid },
    { value: "list", label: "List", icon: List },
  ] as const;

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
      <Header title="Settings" showSearch={false} />
      
      <div className="p-4 space-y-6">
        {/* Account Section */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-on-surface-variant">Account</h2>
          <div className="rounded-lg border border-outline-variant bg-surface">
            <button
              className="flex w-full items-center gap-3 p-4 text-left"
              onClick={() => window.location.href = "/auth"}
            >
              <div className="rounded-full bg-surface-container-high p-2">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {isAuthenticated ? "Signed In" : "Sign In"}
                </div>
                <div className="text-sm text-on-surface-variant">
                  {isAuthenticated ? "Sync across devices" : "Sign in to sync library"}
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-on-surface-variant">Appearance</h2>
          <div className="rounded-lg border border-outline-variant bg-surface p-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm">Theme</label>
              <div className="flex gap-2">
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant py-2",
                      theme === t.value && "border-primary bg-primary-container text-on-primary-container"
                    )}
                  >
                    <t.icon className="h-4 w-4" />
                    <span className="text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="mb-2 block text-sm">Display</label>
              <div className="flex gap-2">
                {displayModes.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDisplayMode(d.value)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant py-2",
                      displayMode === d.value && "border-primary bg-primary-container text-on-primary-container"
                    )}
                  >
                    <d.icon className="h-4 w-4" />
                    <span className="text-sm">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-on-surface-variant">Data</h2>
          <div className="rounded-lg border border-outline-variant bg-surface divide-y divide-outline-variant">
            <button
              className="flex w-full items-center gap-3 p-4 text-left"
              onClick={handleExport}
            >
              <ArrowUpToLine className="h-5 w-5" />
              <span>Export Library</span>
            </button>
            <label className="flex w-full cursor-pointer items-center gap-3 p-4 text-left">
              <ArrowDownToLine className="h-5 w-5" />
              <span>Import Library</span>
              <input type="file" accept=".json" className="hidden" />
            </label>
            <button
              className="flex w-full items-center gap-3 p-4 text-left text-error"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-5 w-5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-on-surface-variant">About</h2>
          <div className="rounded-lg border border-outline-variant bg-surface p-4">
            <div className="text-center">
              <div className="text-lg font-semibold">WebYomi</div>
              <div className="text-sm text-on-surface-variant">Version 0.1.0</div>
              <div className="mt-2 text-xs text-on-surface-variant">
                Based on Mihon/Tachiyomi
              </div>
            </div>
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