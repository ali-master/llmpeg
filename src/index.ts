import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { configManager } from "./config.js";

const systemMessage = `You are an expert FFmpeg command generator. Your role is to create precise, efficient FFmpeg commands based on user descriptions.

Rules:
1. Output ONLY the ffmpeg command - no explanations, comments, or additional text
2. Always output a single line command with no line breaks
3. Use best practices for the requested operation (optimal codecs, bitrates, filters)
4. Include appropriate flags for quality, performance, and compatibility
5. Handle common scenarios: format conversion, encoding, filtering, streaming, concatenation
6. Prefer modern codecs (h264/h265 for video, aac for audio) unless specified otherwise
7. Use hardware acceleration flags when beneficial (e.g., -hwaccel auto)
8. Include progress indicators with -progress pipe:1 for long operations

Examples of expected behavior:
- "compress video" → use crf for quality-based encoding
- "remove audio" → use -an flag
- "extract audio" → use -vn flag
- "resize to 720p" → use scale filter with proper aspect ratio handling
- "convert to gif" → optimize with palette generation

Remember: Output ONLY the command, nothing else.`;

interface GenerateOptions {
  model?: string;
  provider?: string;
}

export async function generateFfmpegCommand(
  prompt: string,
  options: GenerateOptions = {},
) {
  const { model: modelType = configManager.getDefaultProvider(), provider } =
    options;

  let model;
  const apiKey = configManager.getApiKey(modelType);

  if (!apiKey) {
    throw new Error(
      `No API key found for ${modelType}. Please configure it using:\n` +
        `  llmpeg config --${modelType} YOUR_API_KEY\n` +
        `Or set the appropriate environment variable.`,
    );
  }

  const defaultModel = configManager.getDefaultModel(modelType);
  const modelName = (provider || defaultModel)!;

  switch (modelType.toLowerCase()) {
    case "openai":
      model = openai(modelName);
      break;

    case "claude":
      model = anthropic(modelName);
      break;

    case "gemini":
      model = google(modelName);
      break;

    case "grok":
      model = xai(modelName);
      break;

    default:
      throw new Error(
        `Unknown model type: ${modelType}. Supported models: openai, claude, gemini, grok`,
      );
  }

  const { text } = await generateText({
    model,
    system: systemMessage,
    prompt,
  });

  const rawCommand = text.trim();
  if (!rawCommand) {
    throw new Error("Failed to generate a response.");
  }

  let command = rawCommand.replace(/\\"/g, '"');
  command = command.replace(/^(\s*ffmpeg)(\s+)/, "$1 -v quiet -stats$2");

  return command;
}

// Example usage (only runs when called directly)
if (import.meta.main) {
  (async () => {
    const prompt =
      "convert exampleVid.mov to h264, remove audio, and put it in an mp4 container";
    try {
      const command = await generateFfmpegCommand(prompt);
      console.log(`Prompt: ${prompt}`);
      console.log(`Command: ${command}`);
    } catch (error) {
      console.error("Error:", (error as Error).message);
      console.log("\nPlease configure an API key using:");
      console.log("  llmpeg config --openai YOUR_API_KEY");
    }
  })();
}
