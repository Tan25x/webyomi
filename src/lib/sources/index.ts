import axios from "axios";
import * as cheerio from "cheerio";

export interface Source {
  id: string;
  name: string;
  lang: string;
  baseUrl: string;
  supportsLatest: boolean;
  nsfw: boolean;
}

export interface RepoSource {
  name: string;
  pkg: string;
  baseUrl: string;
  lang: string;
  version: string;
  nsfw: number;
  sources: Array<{
    name: string;
    lang: string;
    id: string;
    baseUrl: string;
  }>;
}

export interface Repo {
  name: string;
  url: string;
  sources: RepoSource[];
  loadedAt: number;
}

const http = axios.create({
  timeout: 30000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
});

export async function fetchRepo(url: string): Promise<RepoSource[]> {
  try {
    const response = await http.get(url);
    const data = JSON.parse(response.data);
    
    const sources: RepoSource[] = [];
    
    for (const ext of data) {
      if (ext.sources && ext.sources.length > 0) {
        for (const source of ext.sources) {
          sources.push({
            name: ext.name,
            pkg: ext.pkg,
            baseUrl: source.baseUrl,
            lang: source.lang || ext.lang,
            version: ext.version || "1.0",
            nsfw: ext.nsfw || 0,
            sources: [source],
          });
        }
      }
    }
    
    return sources;
  } catch (err) {
    console.error("Failed to fetch repo:", err);
    return [];
  }
}

export const builtInSources: Source[] = [
  {
    id: "shinigami",
    name: "Shinigami",
    lang: "id",
    baseUrl: "https://c.shinigami.asia",
    supportsLatest: true,
    nsfw: false,
  },
  {
    id: "komikcast",
    name: "KomikCast",
    lang: "id", 
    baseUrl: "https://v1.komikcast.fit",
    supportsLatest: true,
    nsfw: false,
  },
];

export interface MangaEntry {
  url: string;
  title: string;
  thumbnailUrl: string | null;
  author: string | null;
  artist: string | null;
  description: string | null;
  genre: string[];
  status: number;
}

export interface ChapterEntry {
  url: string;
  name: string;
  dateUpload: number;
  chapterNumber: number;
  scanlator: string | null;
}

export interface PageEntry {
  index: number;
  url: string;
  imageUrl: string;
}

export abstract class SourceAdapter {
  abstract source: Source;
  
  protected http = axios.create({
    timeout: 30000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  
  protected async loadPage(url: string): Promise<cheerio.CheerioAPI> {
    const response = await this.http.get(url);
    return cheerio.load(response.data);
  }
  
  abstract getPopularManga(page: number): Promise<MangaEntry[]>;
  abstract getLatestUpdates(page: number): Promise<MangaEntry[]>;
  abstract searchManga(query: string, page: number): Promise<MangaEntry[]>;
  abstract getMangaDetails(mangaUrl: string): Promise<MangaEntry>;
  abstract getChapterList(mangaUrl: string): Promise<ChapterEntry[]>;
  abstract getPageList(chapterUrl: string): Promise<PageEntry[]>;
}

export class ShinigamiAdapter extends SourceAdapter {
  source = builtInSources[0];
  
  async getPopularManga(page: number): Promise<MangaEntry[]> {
    try {
      const $ = await this.loadPage(`${this.source.baseUrl}/popular?page=${page}`);
      const results: MangaEntry[] = [];
      
      $(".story-list .story-item").each((_, el) => {
        const element = $(el);
        const url = element.find("a").attr("href") || "";
        const title = element.find(".title").text().trim();
        const thumbnailUrl = element.find("img").attr("src") || null;
        
        if (url && title) {
          results.push({
            url,
            title,
            thumbnailUrl,
            author: null,
            artist: null,
            description: null,
            genre: [],
            status: 0,
          });
        }
      });
      
      return results;
    } catch (err) {
      console.error("Shinigami getPopularManga error:", err);
      return [];
    }
  }
  
  async getLatestUpdates(page: number): Promise<MangaEntry[]> {
    return this.getPopularManga(page);
  }
  
  async searchManga(query: string, page: number): Promise<MangaEntry[]> {
    try {
      const $ = await this.loadPage(`${this.source.baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}`);
      const results: MangaEntry[] = [];
      
      $(".story-list .story-item, .manga-list .manga-item").each((_, el) => {
        const element = $(el);
        const url = element.find("a").attr("href") || "";
        const title = element.find(".title, h3").text().trim();
        const thumbnailUrl = element.find("img").attr("src") || null;
        
        if (url && title) {
          results.push({
            url,
            title,
            thumbnailUrl,
            author: null,
            artist: null,
            description: null,
            genre: [],
            status: 0,
          });
        }
      });
      
      return results;
    } catch (err) {
      console.error("Shinigami searchManga error:", err);
      return [];
    }
  }
  
  async getMangaDetails(mangaUrl: string): Promise<MangaEntry> {
    try {
      const $ = await this.loadPage(mangaUrl);
      
      const title = $(".info-detail .title").text().trim();
      const thumbnailUrl = $(".cover-detail img").attr("src") || null;
      const author = $(".info-detail .author .value, .author .value").text().trim() || null;
      const description = $(".info-detail .description").text().trim() || null;
      const genre = $(".info-detail .genres a").map((_, el) => $(el).text().trim()).get();
      
      let status = 0;
      const statusText = $(".info-detail .status .value, .status .value").text().trim().toLowerCase();
      if (statusText.includes("ongoing")) {
        status = 1;
      } else if (statusText.includes("complete")) {
        status = 2;
      }
      
      return {
        url: mangaUrl,
        title,
        thumbnailUrl,
        author,
        artist: null,
        description,
        genre,
        status,
      };
    } catch (err) {
      console.error("Shinigami getMangaDetails error:", err);
      return {
        url: mangaUrl,
        title: "Unknown",
        thumbnailUrl: null,
        author: null,
        artist: null,
        description: null,
        genre: [],
        status: 0,
      };
    }
  }
  
  async getChapterList(mangaUrl: string): Promise<ChapterEntry[]> {
    try {
      const $ = await this.loadPage(mangaUrl);
      const results: ChapterEntry[] = [];
      
      $(".chapter-list .chapter-item").each((_, el) => {
        const element = $(el);
        const url = element.find("a").attr("href") || "";
        const name = element.find(".title").text().trim();
        
        if (url && name) {
          results.push({
            url,
            name,
            dateUpload: 0,
            chapterNumber: 0,
            scanlator: null,
          });
        }
      });
      
      return results;
    } catch (err) {
      console.error("Shinigami getChapterList error:", err);
      return [];
    }
  }
  
  async getPageList(chapterUrl: string): Promise<PageEntry[]> {
    try {
      const $ = await this.loadPage(chapterUrl);
      const results: PageEntry[] = [];
      
      $(".chapter-content img").each((i, el) => {
        const imageUrl = $(el).attr("src") || $(el).attr("data-src") || "";
        if (imageUrl) {
          results.push({
            index: i,
            url: imageUrl,
            imageUrl,
          });
        }
      });
      
      return results;
    } catch (err) {
      console.error("Shinigami getPageList error:", err);
      return [];
    }
  }
}

export class KomikCastAdapter extends SourceAdapter {
  source = builtInSources[1];
  
  async getPopularManga(page: number): Promise<MangaEntry[]> {
    try {
      const $ = await this.loadPage(`${this.source.baseUrl}/popular?page=${page}`);
      const results: MangaEntry[] = [];
      
      $(".list-update .item").each((_, el) => {
        const element = $(el);
        const url = element.find("a").attr("href") || "";
        const title = element.find(".title").text().trim();
        const thumbnailUrl = element.find("img").attr("src") || null;
        
        if (url && title) {
          results.push({
            url,
            title,
            thumbnailUrl,
            author: null,
            artist: null,
            description: null,
            genre: [],
            status: 0,
          });
        }
      });
      
      return results;
    } catch (err) {
      console.error("KomikCast getPopularManga error:", err);
      return [];
    }
  }
  
  async getLatestUpdates(page: number): Promise<MangaEntry[]> {
    return this.getPopularManga(page);
  }
  
  async searchManga(query: string, page: number): Promise<MangaEntry[]> {
    return this.getPopularManga(1);
  }
  
  async getMangaDetails(mangaUrl: string): Promise<MangaEntry> {
    return {
      url: mangaUrl,
      title: "Unknown",
      thumbnailUrl: null,
      author: null,
      artist: null,
      description: null,
      genre: [],
      status: 0,
    };
  }
  
  async getChapterList(mangaUrl: string): Promise<ChapterEntry[]> {
    return [];
  }
  
  async getPageList(chapterUrl: string): Promise<PageEntry[]> {
    return [];
  }
}

export function getAdapter(sourceId: string): SourceAdapter | null {
  switch (sourceId) {
    case "shinigami":
      return new ShinigamiAdapter();
    case "komikcast":
      return new KomikCastAdapter();
    default:
      return null;
  }
}