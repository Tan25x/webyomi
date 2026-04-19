import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Manga, Chapter, Category, LibraryFilters, TriState, SortDirection, LibrarySort } from "@/types";
import * as db from "./db";

interface AppState {
  // User session
  isAuthenticated: boolean;
  userId: string | null;
  deviceId: string;
  
  // Library
  mangaList: Manga[];
  categories: Category[];
  selectedCategories: string[];
  
  // Filters
  filters: LibraryFilters;
  
  // Current viewing
  currentManga: Manga | null;
  currentChapters: Chapter[];
  currentChapter: Chapter | null;
  currentPage: number;
  
  // Sources
  availableSources: { id: string; name: string }[];
  
  // UI state
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  displayMode: "grid" | "list";
  readerMode: "vertical" | "horizontal" | "webtoon";
  
  // Reading history
  history: { mangaId: string; chapterId: string; page: number; readAt: number }[];
  
  // Actions
  setAuthenticated: (isAuthenticated: boolean, userId?: string | null) => void;
  setDeviceId: (deviceId: string) => void;
  
  // Library actions
  loadLibrary: () => Promise<void>;
  addToLibrary: (manga: Manga) => Promise<void>;
  removeFromLibrary: (mangaId: string) => Promise<void>;
  updateManga: (mangaId: string, changes: Partial<Manga>) => Promise<void>;
  
  // Category actions
  loadCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, changes: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Filter actions
  setSearchFilter: (search: string) => void;
  setUnreadFilter: (filter: TriState) => void;
  setDownloadedFilter: (filter: TriState) => void;
  setBookmarkedFilter: (filter: TriState) => void;
  setSortBy: (sortBy: LibrarySort) => void;
  setSortDirection: (direction: SortDirection) => void;
  
  // Viewer actions
  setCurrentManga: (manga: Manga | null) => void;
  setCurrentChapters: (chapters: Chapter[]) => void;
  setCurrentChapter: (chapter: Chapter | null) => void;
  setCurrentPage: (page: number) => void;
  
  // Source actions
  setAvailableSources: (sources: { id: string; name: string }[]) => void;
  
  // UI actions
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setDisplayMode: (mode: "grid" | "list") => void;
  setReaderMode: (mode: "vertical" | "horizontal" | "webtoon") => void;
  
  // History actions
  loadHistory: () => Promise<void>;
  addToHistory: (mangaId: string, chapterId: string, page: number) => Promise<void>;
  
  // Theme
  applyTheme: () => void;
}

function getStoredDeviceId(): string {
  if (typeof window === "undefined") return "";
  
  let deviceId = localStorage.getItem("webyomi_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("webyomi_device_id", deviceId);
  }
  return deviceId;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      userId: null,
      deviceId: getStoredDeviceId(),
      
      mangaList: [],
      categories: [],
      selectedCategories: [],
      
      filters: {
        search: "",
        unreadFilter: 0,
        downloadedFilter: 0,
        bookmarkedFilter: 0,
        sortBy: 0,
        sortDirection: 1,
      },
      
      currentManga: null,
      currentChapters: [],
      currentChapter: null,
      currentPage: 0,
      
      availableSources: [],
      
      sidebarOpen: false,
      theme: "system",
      displayMode: "grid",
      readerMode: "vertical",
      
      history: [],
      
      // Actions
      setAuthenticated: (isAuthenticated, userId = null) => {
        set({ isAuthenticated, userId });
      },
      
      setDeviceId: (deviceId) => {
        set({ deviceId });
      },
      
      // Library actions
      loadLibrary: async () => {
        const manga = await db.getFavoriteManga();
        set({ mangaList: manga });
      },
      
      addToLibrary: async (manga) => {
        const updatedManga = { ...manga, favorite: true, dateAdded: Date.now() };
        await db.upsertManga(updatedManga);
        
        const { mangaList } = get();
        const existingIndex = mangaList.findIndex((m) => m.id === manga.id);
        if (existingIndex >= 0) {
          const newList = [...mangaList];
          newList[existingIndex] = updatedManga;
          set({ mangaList: newList });
        } else {
          set({ mangaList: [...mangaList, updatedManga] });
        }
      },
      
      removeFromLibrary: async (mangaId) => {
        await db.updateManga(mangaId, { favorite: false });
        
        const { mangaList } = get();
        set({ mangaList: mangaList.filter((m) => m.id !== mangaId) });
      },
      
      updateManga: async (mangaId, changes) => {
        await db.updateManga(mangaId, changes);
        
        const { mangaList } = get();
        const index = mangaList.findIndex((m) => m.id === mangaId);
        if (index >= 0) {
          const newList = [...mangaList];
          newList[index] = { ...newList[index], ...changes };
          set({ mangaList: newList });
        }
      },
      
      // Category actions
      loadCategories: async () => {
        const categories = await db.getAllCategories();
        set({ categories });
      },
      
      addCategory: async (name) => {
        const { categories } = get();
        const newCategory: Category = {
          id: crypto.randomUUID(),
          name,
          order: categories.length,
          sortBy: 0,
          sortDirection: 1,
          displayMode: 0,
          flags: 0,
        };
        await db.addCategory(newCategory);
        set({ categories: [...categories, newCategory] });
      },
      
      updateCategory: async (id, changes) => {
        await db.updateCategory(id, changes);
        
        const { categories } = get();
        const index = categories.findIndex((c) => c.id === id);
        if (index >= 0) {
          const newList = [...categories];
          newList[index] = { ...newList[index], ...changes };
          set({ categories: newList });
        }
      },
      
      deleteCategory: async (id) => {
        await db.deleteCategory(id);
        
        const { categories } = get();
        set({ categories: categories.filter((c) => c.id !== id) });
      },
      
      // Filter actions
      setSearchFilter: (search) => {
        const { filters } = get();
        set({ filters: { ...filters, search } });
      },
      
      setUnreadFilter: (unreadFilter) => {
        const { filters } = get();
        set({ filters: { ...filters, unreadFilter } });
      },
      
      setDownloadedFilter: (downloadedFilter) => {
        const { filters } = get();
        set({ filters: { ...filters, downloadedFilter } });
      },
      
      setBookmarkedFilter: (bookmarkedFilter) => {
        const { filters } = get();
        set({ filters: { ...filters, bookmarkedFilter } });
      },
      
      setSortBy: (sortBy) => {
        const { filters } = get();
        set({ filters: { ...filters, sortBy } });
      },
      
      setSortDirection: (sortDirection) => {
        const { filters } = get();
        set({ filters: { ...filters, sortDirection } });
      },
      
      // Viewer actions
      setCurrentManga: (currentManga) => set({ currentManga }),
      setCurrentChapters: (currentChapters) => set({ currentChapters }),
      setCurrentChapter: (currentChapter) => set({ currentChapter }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      
      // Source actions
      setAvailableSources: (availableSources) => set({ availableSources }),
      
      // UI actions
      toggleSidebar: () => {
        const { sidebarOpen } = get();
        set({ sidebarOpen: !sidebarOpen });
      },
      
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme();
      },
      
      setDisplayMode: (displayMode) => set({ displayMode }),
      setReaderMode: (readerMode) => set({ readerMode }),
      
      // History actions
      loadHistory: async () => {
        const history = await db.getHistory(100);
        set({ history: history.map((h) => ({ mangaId: h.mangaId, chapterId: h.chapterId, page: h.page, readAt: h.readAt })) });
      },
      
      addToHistory: async (mangaId, chapterId, page) => {
        const entry = {
          id: crypto.randomUUID(),
          chapterId,
          mangaId,
          page,
          readAt: Date.now(),
        };
        await db.addHistoryEntry(entry);
        
        const { history } = get();
        set({ history: [entry, ...history.filter((h) => h.chapterId !== chapterId)].slice(0, 100) });
      },
      
      // Theme application
      applyTheme: () => {
        const { theme } = get();
        const root = document.documentElement;
        
        if (theme === "dark") {
          root.classList.add("dark");
        } else if (theme === "light") {
          root.classList.remove("dark");
        } else {
          // System preference
          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      },
    }),
    {
      name: "webyomi-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        deviceId: state.deviceId,
        theme: state.theme,
        displayMode: state.displayMode,
        readerMode: state.readerMode,
        selectedCategories: state.selectedCategories,
        filters: state.filters,
      }),
    }
  )
);

// Initialize store on app mount
export async function initializeStore() {
  const store = useStore.getState();
  await store.loadLibrary();
  await store.loadCategories();
  await store.loadHistory();
  store.applyTheme();
  
  // Set up system theme listener
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const { theme } = useStore.getState();
    if (theme === "system") {
      useStore.getState().applyTheme();
    }
  });
}