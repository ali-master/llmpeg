import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { configManager } from "./config.js";

const systemMessage = `You create ffmpeg commands based on the user's description. Only provide a command line command for ffmpeg, without any extra text. All responses should be a single line with no line breaks.`;

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
