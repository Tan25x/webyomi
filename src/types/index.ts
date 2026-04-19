export interface Manga {
  id: string;
  sourceId: string;
  url: string;
  title: string;
  author: string | null;
  artist: string | null;
  description: string | null;
  genre: string[];
  status: MangaStatus;
  thumbnailUrl: string | null;
  updateStrategy: UpdateStrategy;
  initialized: boolean;
  favorite: boolean;
  lastUpdate: number;
  nextUpdate: number;
  fetchInterval: number;
  dateAdded: number;
  viewerFlags: number;
  chapterFlags: number;
  coverLastModified: number;
  lastModifiedAt: number;
  favoriteModifiedAt: number | null;
  version: number;
  notes: string;
}

export interface Chapter {
  id: string;
  mangaId: string;
  sourceId: string;
  url: string;
  name: string;
  dateUpload: number;
  chapterNumber: number;
  pageCount: number | null;
  scanlator: string | null;
  isRead: boolean;
  isBookmarked: boolean;
  isDownloaded: boolean;
  lastPageRead: number;
  readAt: number | null;
  historyId: string | null;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  sortBy: number;
  sortDirection: SortDirection;
  displayMode: DisplayMode;
  flags: number;
}

export interface Source {
  id: string;
  name: string;
  lang: string;
  baseUrl: string;
  iconUrl: string | null;
  supportsLatest: boolean;
  isEnabled: boolean;
  isStub: boolean;
}

export interface Track {
  id: string;
  mangaId: string;
  trackId: string;
  syncId: number;
  title: string;
  url: string;
  coverUrl: string | null;
  lastChapterRead: string;
  score: number;
  status: number;
  startDate: string | null;
  finishDate: string | null;
  libraryId: string | null;
}

export interface HistoryEntry {
  id: string;
  chapterId: string;
  mangaId: string;
  page: number;
  readAt: number;
}

export type MangaStatus = 0 | 1 | 2 | 3 | 4 | 5;
export type UpdateStrategy = 0 | 1 | 2;
export type SortDirection = 0 | 1;
export type DisplayMode = 0 | 1 | 2;

export const MangaStatus = {
  UNKNOWN: 0 as MangaStatus,
  ONGOING: 1 as MangaStatus,
  COMPLETED: 2 as MangaStatus,
  LICENSED: 3 as MangaStatus,
  PUBLISHING_FINISHED: 4 as MangaStatus,
  CANCELLED: 5 as MangaStatus,
};

export const UpdateStrategy = {
  ALWAYS_UPDATE: 0 as UpdateStrategy,
  ONLY_FRESH: 1 as UpdateStrategy,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-members
  NEVER: 2 as UpdateStrategy,
};

// Chapter flags
export const CHAPTER_SORT_DESC = 0x00000000;
export const CHAPTER_SORT_ASC = 0x00000001;
export const CHAPTER_SORT_DIR_MASK = 0x00000001;
export const CHAPTER_SHOW_UNREAD = 0x00000002;
export const CHAPTER_SHOW_READ = 0x00000004;
export const CHAPTER_UNREAD_MASK = 0x00000006;
export const CHAPTER_SHOW_DOWNLOADED = 0x00000008;
export const CHAPTER_SHOW_NOT_DOWNLOADED = 0x00000010;
export const CHAPTER_DOWNLOADED_MASK = 0x00000018;
export const CHAPTER_SHOW_BOOKMARKED = 0x00000020;
export const CHAPTER_SHOW_NOT_BOOKMARKED = 0x00000040;
export const CHAPTER_BOOKMARKED_MASK = 0x00000060;
export const CHAPTER_SORTING_SOURCE = 0x00000000;
export const CHAPTER_SORTING_NUMBER = 0x00000100;
export const CHAPTER_SORTING_UPLOAD_DATE = 0x00000200;
export const CHAPTER_SORTING_ALPHABET = 0x00000300;
export const CHAPTER_SORTING_MASK = 0x00000300;
export const CHAPTER_DISPLAY_NAME = 0x00000000;
export const CHAPTER_DISPLAY_NUMBER = 0x00100000;
export const CHAPTER_DISPLAY_MASK = 0x00100000;

// Source model for web (mirrors SManga from Mihon)
export interface SManga {
  url: string;
  title: string;
  author: string | null;
  artist: string | null;
  description: string | null;
  genre: string[];
  status: number;
  thumbnailUrl: string | null;
  updateStrategy: UpdateStrategy;
}

export interface SChapter {
  url: string;
  name: string;
  dateUpload: number;
  chapterNumber: number;
  pageCount: number | null;
  scanlator: string | null;
}

export interface Page {
  index: number;
  url: string;
  imageUrl: string;
}

// Library search/filter types
export interface LibraryFilters {
  search: string;
  unreadFilter: TriState;
  downloadedFilter: TriState;
  bookmarkedFilter: TriState;
  sortBy: LibrarySort;
  sortDirection: SortDirection;
}

export type TriState = 0 | 1 | 2;
export type LibrarySort = 0 | 1 | 2 | 3 | 4;

export const TriState = {
  DISABLED: 0 as TriState,
  ENABLED_IS: 1 as TriState,
  ENABLED_NOT: 2 as TriState,
};

export const LibrarySort = {
  DATE_ADDED: 0 as LibrarySort,
  LAST_READ: 1 as LibrarySort,
  CHAPTER_COUNT: 2 as LibrarySort,
  TITLE: 3 as LibrarySort,
  NEXT_UPDATE: 4 as LibrarySort,
};

export function createManga(partial: Partial<Manga> = {}): Manga {
  return {
    id: partial.id ?? crypto.randomUUID(),
    sourceId: partial.sourceId ?? "",
    url: partial.url ?? "",
    title: partial.title ?? "",
    author: partial.author ?? null,
    artist: partial.artist ?? null,
    description: partial.description ?? null,
    genre: partial.genre ?? [],
    status: partial.status ?? 0,
    thumbnailUrl: partial.thumbnailUrl ?? null,
    updateStrategy: partial.updateStrategy ?? 0,
    initialized: partial.initialized ?? false,
    favorite: partial.favorite ?? false,
    lastUpdate: partial.lastUpdate ?? 0,
    nextUpdate: partial.nextUpdate ?? 0,
    fetchInterval: partial.fetchInterval ?? 0,
    dateAdded: partial.dateAdded ?? Date.now(),
    viewerFlags: partial.viewerFlags ?? 0,
    chapterFlags: partial.chapterFlags ?? 0,
    coverLastModified: partial.coverLastModified ?? 0,
    lastModifiedAt: partial.lastModifiedAt ?? 0,
    favoriteModifiedAt: partial.favoriteModifiedAt ?? null,
    version: partial.version ?? 0,
    notes: partial.notes ?? "",
    ...partial,
  };
}

export function createChapter(partial: Partial<Chapter> = {}): Chapter {
  return {
    id: partial.id ?? crypto.randomUUID(),
    mangaId: partial.mangaId ?? "",
    sourceId: partial.sourceId ?? "",
    url: partial.url ?? "",
    name: partial.name ?? "",
    dateUpload: partial.dateUpload ?? 0,
    chapterNumber: partial.chapterNumber ?? 0,
    pageCount: partial.pageCount ?? null,
    scanlator: partial.scanlator ?? null,
    isRead: partial.isRead ?? false,
    isBookmarked: partial.isBookmarked ?? false,
    isDownloaded: partial.isDownloaded ?? false,
    lastPageRead: partial.lastPageRead ?? 0,
    readAt: partial.readAt ?? null,
    historyId: partial.historyId ?? null,
    ...partial,
  };
}