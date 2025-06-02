import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import crypto from "crypto";

export interface HistoryEntry {
  id: string;
  prompt: string;
  command: string;
  provider: string;
  model?: string;
  timestamp: number;
  executionCount: number;
  tags: string[];
  isFavorite: boolean;
  category?: string;
  error?: string;
}

export interface HistoryStats {
  totalCommands: number;
  favoriteCount: number;
  mostUsedProvider: string;
  mostUsedCategory: string;
  commandsToday: number;
  commandsThisWeek: number;
  commandsThisMonth: number;
}

export class HistoryManager {
  private readonly historyPath: string;
  private readonly historyFile: string;
  private history: HistoryEntry[] = [];
  private readonly maxHistorySize = 1000;
  private readonly recentLimit = 10;

  constructor() {
    this.historyPath = join(homedir(), ".llmpeg");
    this.historyFile = join(this.historyPath, "history.json");
    this.load();
  }

  private load(): void {
    if (existsSync(this.historyFile)) {
      try {
        const content = readFileSync(this.historyFile, "utf-8");
        this.history = JSON.parse(content);
        // Migrate old entries without required fields
        this.history = this.history.map((entry) => ({
          ...entry,
          executionCount: entry.executionCount || 0,
          tags: entry.tags || [],
          isFavorite: entry.isFavorite || false,
        }));
      } catch (error) {
        console.warn("Failed to load history:", error);
        this.history = [];
      }
    }
  }

  private save(): void {
    try {
      if (!existsSync(this.historyPath)) {
        mkdirSync(this.historyPath, { recursive: true });
      }

      // Keep only the most recent entries
      if (this.history.length > this.maxHistorySize) {
        this.history = this.history
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, this.maxHistorySize);
      }

      writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  }

  add(
    entry: Omit<
      HistoryEntry,
      "id" | "timestamp" | "executionCount" | "tags" | "isFavorite"
    >,
  ): void {
    // Check if similar command exists
    const existingIndex = this.history.findIndex(
      (h) =>
        h.prompt.toLowerCase() === entry.prompt.toLowerCase() &&
        h.command === entry.command,
    );

    if (existingIndex !== -1) {
      // Update existing entry
      this.history[existingIndex].executionCount++;
      this.history[existingIndex].timestamp = Date.now();
    } else {
      // Add new entry
      const newEntry: HistoryEntry = {
        ...entry,
        id: crypto.randomBytes(8).toString("hex"),
        timestamp: Date.now(),
        executionCount: 1,
        tags: this.autoGenerateTags(entry.prompt),
        isFavorite: false,
      };
      this.history.unshift(newEntry);
    }

    this.save();
  }

  private autoGenerateTags(prompt: string): string[] {
    const tags: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Video operations
    if (
      lowerPrompt.includes("video") ||
      lowerPrompt.includes("mp4") ||
      lowerPrompt.includes("avi")
    ) {
      tags.push("video");
    }

    // Audio operations
    if (
      lowerPrompt.includes("audio") ||
      lowerPrompt.includes("mp3") ||
      lowerPrompt.includes("sound")
    ) {
      tags.push("audio");
    }

    // Conversion operations
    if (lowerPrompt.includes("convert") || lowerPrompt.includes("to")) {
      tags.push("conversion");
    }

    // Compression
    if (
      lowerPrompt.includes("compress") ||
      lowerPrompt.includes("reduce") ||
      lowerPrompt.includes("optimize")
    ) {
      tags.push("compression");
    }

    // GIF operations
    if (lowerPrompt.includes("gif")) {
      tags.push("gif");
    }

    // Streaming
    if (
      lowerPrompt.includes("stream") ||
      lowerPrompt.includes("rtmp") ||
      lowerPrompt.includes("hls")
    ) {
      tags.push("streaming");
    }

    // Extract operations
    if (lowerPrompt.includes("extract")) {
      tags.push("extraction");
    }

    // Resize operations
    if (
      lowerPrompt.includes("resize") ||
      lowerPrompt.includes("scale") ||
      lowerPrompt.includes("resolution")
    ) {
      tags.push("resize");
    }

    return tags;
  }

  getRecent(limit: number = this.recentLimit): HistoryEntry[] {
    return this.history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getFavorites(): HistoryEntry[] {
    return this.history
      .filter((entry) => entry.isFavorite)
      .sort((a, b) => b.executionCount - a.executionCount);
  }

  getMostUsed(limit: number = 10): HistoryEntry[] {
    return this.history
      .filter((entry) => entry.executionCount > 1)
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, limit);
  }

  search(query: string): HistoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.history.filter(
      (entry) =>
        entry.prompt.toLowerCase().includes(lowerQuery) ||
        entry.command.toLowerCase().includes(lowerQuery) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        (entry.category && entry.category.toLowerCase().includes(lowerQuery)),
    );
  }

  getByTag(tag: string): HistoryEntry[] {
    return this.history.filter((entry) =>
      entry.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
    );
  }

  getByCategory(category: string): HistoryEntry[] {
    return this.history.filter(
      (entry) =>
        entry.category &&
        entry.category.toLowerCase() === category.toLowerCase(),
    );
  }

  toggleFavorite(id: string): boolean {
    const entry = this.history.find((h) => h.id === id);
    if (entry) {
      entry.isFavorite = !entry.isFavorite;
      this.save();
      return entry.isFavorite;
    }
    return false;
  }

  addTags(id: string, tags: string[]): void {
    const entry = this.history.find((h) => h.id === id);
    if (entry) {
      entry.tags = [...new Set([...entry.tags, ...tags])];
      this.save();
    }
  }

  setCategory(id: string, category: string): void {
    const entry = this.history.find((h) => h.id === id);
    if (entry) {
      entry.category = category;
      this.save();
    }
  }

  delete(id: string): boolean {
    const index = this.history.findIndex((h) => h.id === id);
    if (index !== -1) {
      this.history.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  clear(): void {
    this.history = [];
    this.save();
  }

  clearOldEntries(daysToKeep: number = 30): number {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const initialLength = this.history.length;

    this.history = this.history.filter(
      (entry) => entry.isFavorite || entry.timestamp > cutoffTime,
    );

    this.save();
    return initialLength - this.history.length;
  }

  getStats(): HistoryStats {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    const providers = this.history.reduce(
      (acc, entry) => {
        acc[entry.provider] = (acc[entry.provider] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const categories = this.history
      .filter((entry) => entry.category)
      .reduce(
        (acc, entry) => {
          acc[entry.category!] = (acc[entry.category!] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

    return {
      totalCommands: this.history.length,
      favoriteCount: this.history.filter((e) => e.isFavorite).length,
      mostUsedProvider:
        Object.entries(providers).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "none",
      mostUsedCategory:
        Object.entries(categories).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "uncategorized",
      commandsToday: this.history.filter((e) => e.timestamp > now - dayMs)
        .length,
      commandsThisWeek: this.history.filter((e) => e.timestamp > now - weekMs)
        .length,
      commandsThisMonth: this.history.filter((e) => e.timestamp > now - monthMs)
        .length,
    };
  }

  exportHistory(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = [
        "Timestamp",
        "Prompt",
        "Command",
        "Provider",
        "Model",
        "Tags",
        "Favorite",
        "Execution Count",
      ];
      const rows = this.history.map((entry) => [
        new Date(entry.timestamp).toISOString(),
        `"${entry.prompt.replace(/"/g, '""')}"`,
        `"${entry.command.replace(/"/g, '""')}"`,
        entry.provider,
        entry.model || "",
        entry.tags.join(";"),
        entry.isFavorite ? "Yes" : "No",
        entry.executionCount.toString(),
      ]);

      return [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\n",
      );
    }

    return JSON.stringify(this.history, null, 2);
  }

  importHistory(data: string, format: "json" | "csv" = "json"): number {
    try {
      let entries: HistoryEntry[] = [];

      if (format === "json") {
        entries = JSON.parse(data);
      } else {
        // CSV import logic would go here
        throw new Error("CSV import not yet implemented");
      }

      // Validate and merge entries
      const validEntries = entries.filter(
        (entry) => entry.prompt && entry.command && entry.provider,
      );

      // Merge with existing history, avoiding duplicates
      validEntries.forEach((entry) => {
        const exists = this.history.some(
          (h) => h.prompt === entry.prompt && h.command === entry.command,
        );

        if (!exists) {
          this.history.push({
            ...entry,
            id: entry.id || crypto.randomBytes(8).toString("hex"),
            timestamp: entry.timestamp || Date.now(),
            executionCount: entry.executionCount || 1,
            tags: entry.tags || [],
            isFavorite: entry.isFavorite || false,
          });
        }
      });

      this.save();
      return validEntries.length;
    } catch (error) {
      throw new Error(`Failed to import history: ${(error as Error).message}`);
    }
  }
}

export const historyManager = new HistoryManager();
