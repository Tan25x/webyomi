import axios, { type AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import type { SManga, SChapter, Page } from "@/types";

export interface Filter {
  type: string;
  name: string;
  value?: unknown;
}

export type FilterList = Filter[];

export class HttpClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        ...headers,
      },
      timeout: 30000,
    });
  }

  async get<T = unknown>(url: string, config?: { headers?: Record<string, string>; timeout?: number }): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async getHtml(url: string, config?: { headers?: Record<string, string> }): Promise<cheerio.CheerioAPI> {
    const response = await this.client.get<string>(url, config);
    return cheerio.load(response.data);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export abstract class MangaSource {
  protected client: HttpClient;
  
  abstract id: string;
  abstract name: string;
  abstract lang: string;
  abstract baseUrl: string;
  abstract supportsLatest: boolean;

  constructor(client: HttpClient) {
    this.client = client;
  }

  abstract getPopularManga(page: number): Promise<SManga[]>;
  abstract getLatestUpdates(page: number): Promise<SManga[]>;
  abstract searchManga(query: string, page: number, filters: FilterList): Promise<SManga[]>;
  abstract getMangaDetails(manga: SManga): Promise<SManga>;
  abstract getChapterList(manga: SManga): Promise<SChapter[]>;
  abstract getPageList(chapter: SChapter): Promise<Page[]>;

  supportsLatestManga(): boolean {
    return this.supportsLatest;
  }
}

// Simple in-memory source registry
class SourceRegistryImpl {
  private sources = new Map<string, MangaSource>();
  private sourceClasses = new Map<string, new (client: HttpClient) => MangaSource>();

  register(sourceClass: new (client: HttpClient) => MangaSource, id: string): void {
    this.sourceClasses.set(id, sourceClass);
  }

  getAll(): MangaSource[] {
    return Array.from(this.sources.values());
  }

  get(id: string): MangaSource | undefined {
    return this.sources.get(id);
  }

  createSource(id: string, baseUrl: string): MangaSource | undefined {
    const SourceClass = this.sourceClasses.get(id);
    if (!SourceClass) return undefined;
    
    const client = new HttpClient(baseUrl);
    const source = new SourceClass(client);
    this.sources.set(id, source);
    return source;
  }
}

export const sourceRegistry = new SourceRegistryImpl();