import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { config as loadDotenv } from "dotenv";

interface Config {
  openai?: {
    apiKey?: string;
    defaultModel?: string;
  };
  claude?: {
    apiKey?: string;
    defaultModel?: string;
  };
  gemini?: {
    apiKey?: string;
    defaultModel?: string;
  };
  grok?: {
    apiKey?: string;
    defaultModel?: string;
  };
  defaultProvider?: "openai" | "claude" | "gemini" | "grok";
  autoCopy?: boolean;
}

class ConfigManager {
  private config: Config = {};
  private readonly configPath: string;
  private readonly configFile: string;

  constructor() {
    this.configPath = join(homedir(), ".llmpeg");
    this.configFile = join(this.configPath, "config.json");
    void this.load();
  }

  private async load() {
    // 1. Load from config.json if exists
    if (existsSync(this.configFile)) {
      try {
        const fileContent = readFileSync(this.configFile, "utf-8");
        this.config = JSON.parse(fileContent);
      } catch (error) {
        console.warn("Failed to parse config.json:", error);
      }
    }

    // 2. Load from environment files (.env, .env.local)
    const envPaths = [".env", ".env.local", join(homedir(), ".llmpeg", ".env")];

    for (const path of envPaths) {
      if (existsSync(path)) {
        loadDotenv({ path, override: false });
      }
    }

    // 3. Override with system environment variables (highest priority)
    this.mergeEnvironmentVariables();
  }

  private mergeEnvironmentVariables() {
    if (process.env.OPENAI_API_KEY) {
      this.config.openai = {
        ...this.config.openai,
        apiKey: process.env.OPENAI_API_KEY,
      };
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.config.claude = {
        ...this.config.claude,
        apiKey: process.env.ANTHROPIC_API_KEY,
      };
    }
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      this.config.gemini = {
        ...this.config.gemini,
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      };
    }
    if (process.env.XAI_API_KEY) {
      this.config.grok = {
        ...this.config.grok,
        apiKey: process.env.XAI_API_KEY,
      };
    }
    if (process.env.LLMPEG_DEFAULT_PROVIDER) {
      this.config.defaultProvider = process.env.LLMPEG_DEFAULT_PROVIDER as any;
    }
  }

  async save() {
    try {
      // Ensure directory exists
      if (!existsSync(this.configPath)) {
        mkdirSync(this.configPath, { recursive: true });
      }

      writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    } catch (error) {
      throw new Error(
        `Failed to save configuration: ${(error as Error).message}`,
      );
    }
  }

  getApiKey(provider: string): string | undefined {
    switch (provider.toLowerCase()) {
      case "openai":
        return this.config.openai?.apiKey;
      case "claude":
        return this.config.claude?.apiKey;
      case "gemini":
        return this.config.gemini?.apiKey;
      case "grok":
        return this.config.grok?.apiKey;
      default:
        return undefined;
    }
  }

  getDefaultModel(provider: string): string | undefined {
    switch (provider.toLowerCase()) {
      case "openai":
        return this.config.openai?.defaultModel || "gpt-4o-mini";
      case "claude":
        return this.config.claude?.defaultModel || "claude-3-haiku-20240307";
      case "gemini":
        return this.config.gemini?.defaultModel || "gemini-1.5-flash";
      case "grok":
        return this.config.grok?.defaultModel || "grok-beta";
      default:
        return undefined;
    }
  }

  getDefaultProvider(): string {
    return this.config.defaultProvider || "openai";
  }

  setApiKey(provider: string, apiKey: string) {
    switch (provider.toLowerCase()) {
      case "openai":
        this.config.openai = { ...this.config.openai, apiKey };
        break;
      case "claude":
        this.config.claude = { ...this.config.claude, apiKey };
        break;
      case "gemini":
        this.config.gemini = { ...this.config.gemini, apiKey };
        break;
      case "grok":
        this.config.grok = { ...this.config.grok, apiKey };
        break;
    }
  }

  setDefaultModel(provider: string, model: string) {
    switch (provider.toLowerCase()) {
      case "openai":
        this.config.openai = { ...this.config.openai, defaultModel: model };
        break;
      case "claude":
        this.config.claude = { ...this.config.claude, defaultModel: model };
        break;
      case "gemini":
        this.config.gemini = { ...this.config.gemini, defaultModel: model };
        break;
      case "grok":
        this.config.grok = { ...this.config.grok, defaultModel: model };
        break;
    }
  }

  setDefaultProvider(provider: "openai" | "claude" | "gemini" | "grok") {
    this.config.defaultProvider = provider;
  }

  hasAnyApiKey(): boolean {
    return !!(
      this.config.openai?.apiKey ||
      this.config.claude?.apiKey ||
      this.config.gemini?.apiKey ||
      this.config.grok?.apiKey
    );
  }

  getConfig(): Config {
    return { ...this.config };
  }

  getAutoCopy(): boolean {
    return this.config.autoCopy || false;
  }

  setAutoCopy(value: boolean) {
    this.config.autoCopy = value;
  }
}

export const configManager = new ConfigManager();
