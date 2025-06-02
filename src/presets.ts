import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface PresetParameter {
  name: string;
  description: string;
  type: "string" | "number" | "boolean" | "select" | "file";
  default?: any;
  required?: boolean;
  options?: string[]; // For select type
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  parameters?: PresetParameter[];
  examples?: string[];
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  commonUse: boolean;
}

export interface CustomPreset extends Preset {
  isCustom: true;
  createdAt: number;
  usageCount: number;
}

// Built-in presets organized by category
const builtInPresets: Preset[] = [
  // Video Conversion
  {
    id: "convert-to-mp4",
    name: "Convert to MP4",
    description: "Convert any video format to MP4 with H.264 codec",
    category: "Video Conversion",
    prompt: "convert {input} to mp4 with h264 codec and aac audio",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
        placeholder: "video.avi",
      },
      {
        name: "quality",
        description: "Video quality (CRF value)",
        type: "select",
        options: ["18 (High)", "23 (Medium)", "28 (Low)"],
        default: "23 (Medium)",
      },
    ],
    examples: ["convert movie.avi to mp4"],
    tags: ["conversion", "mp4", "h264"],
    difficulty: "beginner",
    commonUse: true,
  },
  {
    id: "convert-to-webm",
    name: "Convert to WebM",
    description: "Convert video to WebM format for web use",
    category: "Video Conversion",
    prompt:
      "convert {input} to webm with vp9 codec and opus audio bitrate {audio_bitrate}k",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "audio_bitrate",
        description: "Audio bitrate in kbps",
        type: "number",
        default: 128,
        validation: { min: 64, max: 320 },
      },
    ],
    tags: ["conversion", "webm", "vp9", "web"],
    difficulty: "intermediate",
    commonUse: true,
  },

  // Video Compression
  {
    id: "compress-for-web",
    name: "Compress for Web",
    description: "Optimize video for web streaming with adjustable quality",
    category: "Video Compression",
    prompt:
      "compress {input} for web streaming with {quality} quality, max resolution {resolution}",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "quality",
        description: "Quality level",
        type: "select",
        options: ["high", "medium", "low"],
        default: "medium",
      },
      {
        name: "resolution",
        description: "Maximum resolution",
        type: "select",
        options: ["1080p", "720p", "480p", "360p"],
        default: "720p",
      },
    ],
    tags: ["compression", "web", "streaming"],
    difficulty: "beginner",
    commonUse: true,
  },
  {
    id: "compress-for-discord",
    name: "Compress for Discord",
    description: "Compress video to fit Discord's file size limits",
    category: "Video Compression",
    prompt:
      "compress {input} to under {size}MB for Discord upload, maintain aspect ratio",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "size",
        description: "Target size in MB",
        type: "select",
        options: ["8", "25", "50", "100"],
        default: "8",
      },
    ],
    tags: ["compression", "discord", "social"],
    difficulty: "beginner",
    commonUse: true,
  },

  // GIF Creation
  {
    id: "video-to-gif",
    name: "Video to GIF",
    description: "Convert video segment to animated GIF",
    category: "GIF Creation",
    prompt:
      "create gif from {input} starting at {start} seconds for {duration} seconds with {fps}fps and width {width}px",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "start",
        description: "Start time in seconds",
        type: "number",
        default: 0,
        validation: { min: 0 },
      },
      {
        name: "duration",
        description: "Duration in seconds",
        type: "number",
        default: 5,
        validation: { min: 1, max: 30 },
      },
      {
        name: "fps",
        description: "Frames per second",
        type: "number",
        default: 10,
        validation: { min: 5, max: 30 },
      },
      {
        name: "width",
        description: "GIF width in pixels",
        type: "number",
        default: 480,
        validation: { min: 100, max: 1920 },
      },
    ],
    tags: ["gif", "animation", "conversion"],
    difficulty: "intermediate",
    commonUse: true,
  },
  {
    id: "optimize-gif",
    name: "Optimize GIF",
    description: "Create optimized GIF with better colors and smaller size",
    category: "GIF Creation",
    prompt:
      "create optimized gif from {input} between {start}-{end} seconds with palette optimization",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "start",
        description: "Start time in seconds",
        type: "number",
        default: 0,
      },
      {
        name: "end",
        description: "End time in seconds",
        type: "number",
        default: 5,
      },
    ],
    tags: ["gif", "optimization", "palette"],
    difficulty: "advanced",
    commonUse: false,
  },

  // Audio Processing
  {
    id: "extract-audio",
    name: "Extract Audio",
    description: "Extract audio track from video file",
    category: "Audio Processing",
    prompt:
      "extract audio from {input} and save as {format} with {bitrate}k bitrate",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "format",
        description: "Output audio format",
        type: "select",
        options: ["mp3", "aac", "wav", "flac", "ogg"],
        default: "mp3",
      },
      {
        name: "bitrate",
        description: "Audio bitrate in kbps",
        type: "select",
        options: ["128", "192", "256", "320"],
        default: "192",
      },
    ],
    tags: ["audio", "extraction", "conversion"],
    difficulty: "beginner",
    commonUse: true,
  },
  {
    id: "normalize-audio",
    name: "Normalize Audio",
    description: "Normalize audio levels in video",
    category: "Audio Processing",
    prompt: "normalize audio in {input} to {level}dB peak level",
    parameters: [
      {
        name: "input",
        description: "Input file",
        type: "file",
        required: true,
      },
      {
        name: "level",
        description: "Target peak level in dB",
        type: "number",
        default: -3,
        validation: { min: -20, max: 0 },
      },
    ],
    tags: ["audio", "normalization", "loudness"],
    difficulty: "intermediate",
    commonUse: false,
  },

  // Video Editing
  {
    id: "trim-video",
    name: "Trim Video",
    description: "Cut video to specific duration",
    category: "Video Editing",
    prompt: "trim {input} from {start} to {end} {copy_mode}",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "start",
        description: "Start time (HH:MM:SS or seconds)",
        type: "string",
        required: true,
        placeholder: "00:00:10",
      },
      {
        name: "end",
        description: "End time (HH:MM:SS or seconds)",
        type: "string",
        required: true,
        placeholder: "00:01:30",
      },
      {
        name: "copy_mode",
        description: "Re-encode or copy streams",
        type: "select",
        options: ["with re-encoding", "without re-encoding (fast)"],
        default: "without re-encoding (fast)",
      },
    ],
    tags: ["trim", "cut", "editing"],
    difficulty: "beginner",
    commonUse: true,
  },
  {
    id: "merge-videos",
    name: "Merge Videos",
    description: "Concatenate multiple videos into one",
    category: "Video Editing",
    prompt: "merge videos {files} into single video with {transition}",
    parameters: [
      {
        name: "files",
        description: "Video files to merge (comma-separated)",
        type: "string",
        required: true,
        placeholder: "video1.mp4, video2.mp4",
      },
      {
        name: "transition",
        description: "Transition type",
        type: "select",
        options: ["no transition", "fade", "dissolve", "wipe"],
        default: "no transition",
      },
    ],
    tags: ["merge", "concatenate", "join"],
    difficulty: "intermediate",
    commonUse: true,
  },
  {
    id: "add-watermark",
    name: "Add Watermark",
    description: "Add image or text watermark to video",
    category: "Video Editing",
    prompt:
      "add {watermark_type} watermark '{watermark}' to {input} at {position} with {opacity}% opacity",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "watermark_type",
        description: "Watermark type",
        type: "select",
        options: ["text", "image"],
        default: "text",
      },
      {
        name: "watermark",
        description: "Watermark text or image path",
        type: "string",
        required: true,
        placeholder: "© 2024 My Channel",
      },
      {
        name: "position",
        description: "Watermark position",
        type: "select",
        options: [
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
          "center",
        ],
        default: "bottom-right",
      },
      {
        name: "opacity",
        description: "Opacity percentage",
        type: "number",
        default: 50,
        validation: { min: 10, max: 100 },
      },
    ],
    tags: ["watermark", "overlay", "branding"],
    difficulty: "intermediate",
    commonUse: false,
  },

  // Video Resizing
  {
    id: "resize-video",
    name: "Resize Video",
    description: "Change video resolution while maintaining aspect ratio",
    category: "Video Resizing",
    prompt: "resize {input} to {resolution} maintaining aspect ratio",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "resolution",
        description: "Target resolution",
        type: "select",
        options: ["1920x1080", "1280x720", "854x480", "640x360", "custom"],
        default: "1280x720",
      },
    ],
    tags: ["resize", "scale", "resolution"],
    difficulty: "beginner",
    commonUse: true,
  },
  {
    id: "crop-video",
    name: "Crop Video",
    description: "Crop video to specific aspect ratio",
    category: "Video Resizing",
    prompt: "crop {input} to {aspect_ratio} aspect ratio {position}",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "aspect_ratio",
        description: "Target aspect ratio",
        type: "select",
        options: ["16:9", "4:3", "1:1", "9:16", "21:9"],
        default: "16:9",
      },
      {
        name: "position",
        description: "Crop position",
        type: "select",
        options: ["center", "top", "bottom"],
        default: "center",
      },
    ],
    tags: ["crop", "aspect-ratio", "resize"],
    difficulty: "intermediate",
    commonUse: true,
  },

  // Effects and Filters
  {
    id: "add-blur",
    name: "Add Blur Effect",
    description: "Apply blur effect to video or specific region",
    category: "Effects & Filters",
    prompt: "add {blur_type} blur to {input} with intensity {intensity}",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "blur_type",
        description: "Blur type",
        type: "select",
        options: ["gaussian", "box", "motion"],
        default: "gaussian",
      },
      {
        name: "intensity",
        description: "Blur intensity",
        type: "select",
        options: ["light", "medium", "heavy"],
        default: "medium",
      },
    ],
    tags: ["blur", "effects", "filter"],
    difficulty: "intermediate",
    commonUse: false,
  },
  {
    id: "color-correction",
    name: "Color Correction",
    description: "Adjust brightness, contrast, and saturation",
    category: "Effects & Filters",
    prompt:
      "adjust {input} brightness to {brightness}, contrast to {contrast}, saturation to {saturation}",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "brightness",
        description: "Brightness (-100 to 100)",
        type: "number",
        default: 0,
        validation: { min: -100, max: 100 },
      },
      {
        name: "contrast",
        description: "Contrast (-100 to 100)",
        type: "number",
        default: 0,
        validation: { min: -100, max: 100 },
      },
      {
        name: "saturation",
        description: "Saturation (-100 to 100)",
        type: "number",
        default: 0,
        validation: { min: -100, max: 100 },
      },
    ],
    tags: ["color", "correction", "adjustment"],
    difficulty: "intermediate",
    commonUse: false,
  },
  {
    id: "stabilize-video",
    name: "Stabilize Shaky Video",
    description: "Reduce camera shake in video",
    category: "Effects & Filters",
    prompt: "stabilize shaky video {input} with {strength} stabilization",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "strength",
        description: "Stabilization strength",
        type: "select",
        options: ["light", "medium", "strong"],
        default: "medium",
      },
    ],
    tags: ["stabilize", "shake", "smooth"],
    difficulty: "advanced",
    commonUse: false,
  },

  // Social Media
  {
    id: "instagram-square",
    name: "Instagram Square Video",
    description: "Create square video for Instagram feed",
    category: "Social Media",
    prompt:
      "convert {input} to instagram square video 1080x1080 with {background} background",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "background",
        description: "Background style for letterboxing",
        type: "select",
        options: ["black", "white", "blur"],
        default: "blur",
      },
    ],
    tags: ["instagram", "social", "square"],
    difficulty: "beginner",
    commonUse: true,
  },
  {
    id: "tiktok-vertical",
    name: "TikTok Vertical Video",
    description: "Optimize video for TikTok (9:16 vertical)",
    category: "Social Media",
    prompt: "convert {input} to tiktok vertical format 1080x1920 at {fps}fps",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "fps",
        description: "Frame rate",
        type: "select",
        options: ["30", "60"],
        default: "30",
      },
    ],
    tags: ["tiktok", "social", "vertical"],
    difficulty: "beginner",
    commonUse: true,
  },

  // Streaming
  {
    id: "stream-to-rtmp",
    name: "Stream to RTMP",
    description: "Stream video to RTMP server (Twitch, YouTube, etc)",
    category: "Streaming",
    prompt:
      "stream {input} to rtmp://{server}/{key} with {bitrate}k bitrate and {preset} preset",
    parameters: [
      {
        name: "input",
        description: "Input source (file or device)",
        type: "string",
        required: true,
        placeholder: "video.mp4 or webcam",
      },
      {
        name: "server",
        description: "RTMP server URL",
        type: "string",
        required: true,
        placeholder: "live.twitch.tv/live",
      },
      {
        name: "key",
        description: "Stream key",
        type: "string",
        required: true,
        placeholder: "your-stream-key",
      },
      {
        name: "bitrate",
        description: "Video bitrate in kbps",
        type: "select",
        options: ["2500", "4000", "6000", "8000"],
        default: "4000",
      },
      {
        name: "preset",
        description: "Encoding preset",
        type: "select",
        options: ["ultrafast", "superfast", "veryfast", "faster", "fast"],
        default: "veryfast",
      },
    ],
    tags: ["streaming", "rtmp", "live"],
    difficulty: "advanced",
    commonUse: false,
  },

  // Advanced
  {
    id: "extract-frames",
    name: "Extract Frames",
    description: "Extract frames from video as images",
    category: "Advanced",
    prompt: "extract {rate} from {input} as {format} images",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "rate",
        description: "Extraction rate",
        type: "select",
        options: [
          "1 frame per second",
          "all frames",
          "1 frame per 5 seconds",
          "1 frame per 10 seconds",
        ],
        default: "1 frame per second",
      },
      {
        name: "format",
        description: "Output image format",
        type: "select",
        options: ["jpg", "png", "bmp"],
        default: "jpg",
      },
    ],
    tags: ["frames", "extraction", "images"],
    difficulty: "intermediate",
    commonUse: false,
  },
  {
    id: "create-thumbnail",
    name: "Create Video Thumbnail",
    description: "Generate thumbnail from specific time in video",
    category: "Advanced",
    prompt:
      "create thumbnail from {input} at {time} seconds with {width}x{height} resolution",
    parameters: [
      {
        name: "input",
        description: "Input video file",
        type: "file",
        required: true,
      },
      {
        name: "time",
        description: "Time in seconds",
        type: "number",
        required: true,
        default: 5,
      },
      {
        name: "width",
        description: "Thumbnail width",
        type: "number",
        default: 1280,
      },
      {
        name: "height",
        description: "Thumbnail height",
        type: "number",
        default: 720,
      },
    ],
    tags: ["thumbnail", "image", "frame"],
    difficulty: "beginner",
    commonUse: true,
  },
];

export class PresetManager {
  private readonly presetsPath: string;
  private readonly presetsFile: string;
  private customPresets: CustomPreset[] = [];

  constructor() {
    this.presetsPath = join(homedir(), ".llmpeg");
    this.presetsFile = join(this.presetsPath, "presets.json");
    this.load();
  }

  private load(): void {
    if (existsSync(this.presetsFile)) {
      try {
        const content = readFileSync(this.presetsFile, "utf-8");
        this.customPresets = JSON.parse(content);
      } catch (error) {
        console.warn("Failed to load custom presets:", error);
        this.customPresets = [];
      }
    }
  }

  private save(): void {
    try {
      if (!existsSync(this.presetsPath)) {
        mkdirSync(this.presetsPath, { recursive: true });
      }
      writeFileSync(
        this.presetsFile,
        JSON.stringify(this.customPresets, null, 2),
      );
    } catch (error) {
      console.error("Failed to save custom presets:", error);
    }
  }

  getAllPresets(): Preset[] {
    return [...builtInPresets, ...this.customPresets];
  }

  getPresetsByCategory(category: string): Preset[] {
    return this.getAllPresets().filter((p) => p.category === category);
  }

  getPresetById(id: string): Preset | undefined {
    return this.getAllPresets().find((p) => p.id === id);
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    this.getAllPresets().forEach((p) => categories.add(p.category));
    return Array.from(categories).sort();
  }

  getCommonPresets(): Preset[] {
    return this.getAllPresets().filter((p) => p.commonUse);
  }

  searchPresets(query: string): Preset[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllPresets().filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        p.prompt.toLowerCase().includes(lowerQuery),
    );
  }

  addCustomPreset(
    preset: Omit<CustomPreset, "id" | "isCustom" | "createdAt" | "usageCount">,
  ): void {
    const customPreset: CustomPreset = {
      ...preset,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
      createdAt: Date.now(),
      usageCount: 0,
    };

    this.customPresets.push(customPreset);
    this.save();
  }

  updateCustomPreset(id: string, updates: Partial<CustomPreset>): boolean {
    const index = this.customPresets.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.customPresets[index] = { ...this.customPresets[index], ...updates };
      this.save();
      return true;
    }
    return false;
  }

  deleteCustomPreset(id: string): boolean {
    const index = this.customPresets.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.customPresets.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  incrementUsageCount(id: string): void {
    const preset = this.customPresets.find((p) => p.id === id);
    if (preset) {
      preset.usageCount++;
      this.save();
    }
  }

  buildPromptFromPreset(
    presetId: string,
    parameters: Record<string, any>,
  ): string {
    const preset = this.getPresetById(presetId);
    if (!preset) {
      throw new Error(`Preset ${presetId} not found`);
    }

    let prompt = preset.prompt;

    // Replace parameters in the prompt
    if (preset.parameters) {
      preset.parameters.forEach((param) => {
        const value = parameters[param.name] ?? param.default;
        if (value !== undefined) {
          // Handle special cases for select options that include descriptions
          let finalValue = value;
          if (param.type === "select" && param.options) {
            // Extract just the value part if it includes description
            const match = value.toString().match(/^(\d+)\s*\(/);
            if (match) {
              finalValue = match[1];
            } else if (value.includes("(")) {
              // For options like "without re-encoding (fast)", use the part before parentheses
              finalValue = value.split("(")[0].trim();
            }
          }
          prompt = prompt.replace(
            new RegExp(`{${param.name}}`, "g"),
            finalValue,
          );
        }
      });
    }

    return prompt;
  }

  exportPresets(): string {
    return JSON.stringify(
      {
        builtIn: builtInPresets,
        custom: this.customPresets,
      },
      null,
      2,
    );
  }

  importCustomPresets(data: string): number {
    try {
      const imported = JSON.parse(data);
      const presets = imported.custom || imported;

      if (!Array.isArray(presets)) {
        throw new TypeError("Invalid preset data format");
      }

      let count = 0;
      presets.forEach((preset: any) => {
        if (preset.name && preset.prompt && preset.category) {
          this.addCustomPreset({
            name: preset.name,
            description: preset.description || "",
            category: preset.category,
            prompt: preset.prompt,
            parameters: preset.parameters || [],
            examples: preset.examples || [],
            tags: preset.tags || [],
            difficulty: preset.difficulty || "intermediate",
            commonUse: preset.commonUse || false,
          });
          count++;
        }
      });

      return count;
    } catch (error) {
      throw new Error(`Failed to import presets: ${(error as Error).message}`);
    }
  }
}

export const presetManager = new PresetManager();
