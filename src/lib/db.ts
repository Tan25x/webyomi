import Dexie, { type Table } from "dexie";
import type { Manga, Chapter, Category, HistoryEntry } from "@/types";

export class WebyomiDB extends Dexie {
  manga!: Table<Manga, string>;
  chapters!: Table<Chapter, string>;
  categories!: Table<Category, string>;
  history!: Table<HistoryEntry, string>;

  constructor() {
    super("webyomi");
    
    this.version(1).stores({
      manga: "id, sourceId, url, title, favorite, dateAdded, lastUpdate",
      chapters: "id, mangaId, sourceId, url, chapterNumber, isRead, isBookmarked",
      categories: "id, name, order",
      history: "id, chapterId, mangaId, readAt",
    });
  }
}

export const db = new WebyomiDB();

// Manga operations
export async function getAllManga(): Promise<Manga[]> {
  return db.manga.toArray();
}

export async function getMangaById(id: string): Promise<Manga | undefined> {
  return db.manga.get(id);
}

export async function getFavoriteManga(): Promise<Manga[]> {
  return db.manga.where("favorite").equals(1).toArray();
}

export async function addManga(manga: Manga): Promise<string> {
  return db.manga.add(manga);
}

export async function updateManga(id: string, changes: Partial<Manga>): Promise<number> {
  return db.manga.update(id, changes);
}

export async function deleteManga(id: string): Promise<void> {
  return db.manga.delete(id);
}

export async function upsertManga(manga: Manga): Promise<string> {
  const existing = await db.manga.get(manga.id);
  if (existing) {
    const { id, ...updates } = manga;
    await db.manga.update(manga.id, updates as Partial<Manga>);
    return manga.id;
  }
  return db.manga.add(manga);
}

// Chapter operations
export async function getChaptersByMangaId(mangaId: string): Promise<Chapter[]> {
  return db.chapters.where("mangaId").equals(mangaId).toArray();
}

export async function addChapter(chapter: Chapter): Promise<string> {
  return db.chapters.add(chapter);
}

export async function addChapters(chapters: Chapter[]): Promise<void> {
  await db.chapters.bulkPut(chapters);
}

export async function updateChapter(id: string, changes: Partial<Chapter>): Promise<number> {
  return db.chapters.update(id, changes);
}

export async function deleteChapter(id: string): Promise<void> {
  return db.chapters.delete(id);
}

export async function deleteChaptersByMangaId(mangaId: string): Promise<number> {
  return db.chapters.where("mangaId").equals(mangaId).delete();
}

// Category operations
export async function getAllCategories(): Promise<Category[]> {
  return db.categories.orderBy("order").toArray();
}

export async function addCategory(category: Category): Promise<string> {
  return db.categories.add(category);
}

export async function updateCategory(id: string, changes: Partial<Category>): Promise<number> {
  return db.categories.update(id, changes);
}

export async function deleteCategory(id: string): Promise<void> {
  return db.categories.delete(id);
}

// History operations
export async function getHistory(limit = 100): Promise<HistoryEntry[]> {
  return db.history.orderBy("readAt").reverse().limit(limit).toArray();
}

export async function getChapterHistory(chapterId: string): Promise<HistoryEntry | undefined> {
  return db.history.where("chapterId").equals(chapterId).first();
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<string> {
  return db.history.add(entry);
}

export async function updateHistoryEntry(id: string, changes: Partial<HistoryEntry>): Promise<number> {
  return db.history.update(id, changes);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  return db.history.delete(id);
}

// Clear all data
export async function clearAllData(): Promise<void> {
  await db.manga.clear();
  await db.chapters.clear();
  await db.categories.clear();
  await db.history.clear();
}

// Export data for backup
export async function exportData(): Promise<{
  manga: Manga[];
  chapters: Chapter[];
  categories: Category[];
  history: HistoryEntry[];
}> {
  const [manga, chapters, categories, history] = await Promise.all([
    db.manga.toArray(),
    db.chapters.toArray(),
    db.categories.toArray(),
    db.history.toArray(),
  ]);
  
  return { manga, chapters, categories, history };
}

// Import data from backup
export async function importData(data: {
  manga?: Manga[];
  chapters?: Chapter[];
  categories?: Category[];
  history?: HistoryEntry[];
}): Promise<void> {
  await db.transaction("rw", [db.manga, db.chapters, db.categories, db.history], async () => {
    if (data.manga?.length) await db.manga.bulkPut(data.manga);
    if (data.chapters?.length) await db.chapters.bulkPut(data.chapters);
    if (data.categories?.length) await db.categories.bulkPut(data.categories);
    if (data.history?.length) await db.history.bulkPut(data.history);
  });
}