#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { generateFfmpegCommand } from "./index.js";
import { configManager } from "./config.js";
import { copyToClipboard } from "./clipboard.js";
import figlet from "figlet";
import { vice } from "gradient-string";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import packageJSON from "../package.json" assert { type: "json" };

const program = new Command();

program
  .name("llmpeg")
  .description("Generate FFmpeg commands using AI models")
  .version(packageJSON.version, "--version", "Show version information")
  .option(
    "-m, --model <model>",
    "AI model to use (openai, claude, gemini, grok)",
  )
  .option("-p, --provider <provider>", "Model provider specific variant")
  .option("-c, --copy", "Copy command to clipboard")
  .option("-e, --execute", "Execute the generated command")
  .option("-v, --verbose", "Show detailed output")
  .argument("<prompt...>", "FFmpeg command description")
  .action(async (promptParts, options) => {
    const prompt = promptParts.join(" ");

    // Use configured defaults if not specified
    const model = options.model || configManager.getDefaultProvider();
    const provider = options.provider || configManager.getDefaultModel(model);

    const spinner = ora("Generating FFmpeg command...").start();

    try {
      const command = await generateFfmpegCommand(prompt, {
        model,
        provider,
      });

      spinner.succeed("Command generated successfully!");

      console.log(`\n${chalk.cyan("Prompt:")} ${prompt}`);
      console.log(`${chalk.green("Command:")} ${chalk.bold(command)}`);

      // Check if we should copy to clipboard (explicit flag or auto-copy config)
      const shouldCopy =
        options.copy || (options.copy !== false && configManager.getAutoCopy());

      if (shouldCopy) {
        try {
          await copyToClipboard(command);
          console.log(chalk.yellow("\n✓ Command copied to clipboard"));
        } catch (error) {
          console.log(
            chalk.red("\n✗ Failed to copy to clipboard:"),
            (error as Error).message,
          );
        }
      }

      if (options.execute) {
        console.log(chalk.yellow("\nExecuting command..."));
        const { spawn } = await import("child_process");
        const proc = spawn(command.split(" ")[0], command.split(" ").slice(1), {
          stdio: "inherit",
          shell: true,
        });

        await new Promise((resolve, reject) => {
          proc.on("close", (code) => {
            if (code === 0) {
              resolve(code);
            } else {
              reject(new Error(`Command exited with code ${code}`));
            }
          });
          proc.on("error", reject);
        });
      }
    } catch (error) {
      const err = error as Error;
      spinner.fail("Failed to generate command");
      console.error(chalk.red("Error:"), err.message);

      if (options.verbose && err.stack) {
        console.error(chalk.gray(err.stack));
      }

      process.exit(1);
    }
  });

program
  .command("init")
  .description("Initialize LLmpeg configuration with a sample config file")
  .option("-f, --force", "Overwrite existing configuration file")
  .action(async (options) => {
    const configPath = join(homedir(), ".llmpeg");
    const configFile = join(configPath, "config.json");

    // Check if config already exists
    if (existsSync(configFile) && !options.force) {
      console.log(chalk.yellow("⚠️  Configuration file already exists!"));
      console.log(chalk.gray(`   Location: ${configFile}`));
      console.log(
        chalk.gray(
          "\n   Use --force flag to overwrite the existing configuration.",
        ),
      );
      process.exit(1);
    }

    // Create ~/.llmpeg directory if it doesn't exist
    if (!existsSync(configPath)) {
      try {
        mkdirSync(configPath, { recursive: true });
        console.log(
          chalk.green("✓ Created directory:"),
          chalk.gray(configPath),
        );
      } catch (error) {
        console.error(
          chalk.red("Failed to create directory:"),
          (error as Error).message,
        );
        process.exit(1);
      }
    }

    // Sample configuration with placeholder values
    const sampleConfig = {
      openai: {
        apiKey: "sk-YOUR_OPENAI_API_KEY_HERE",
        defaultModel: "gpt-4o-mini",
      },
      claude: {
        apiKey: "sk-ant-YOUR_CLAUDE_API_KEY_HERE",
        defaultModel: "claude-3-haiku-20240307",
      },
      gemini: {
        apiKey: "YOUR_GEMINI_API_KEY_HERE",
        defaultModel: "gemini-1.5-flash",
      },
      grok: {
        apiKey: "xai-YOUR_GROK_API_KEY_HERE",
        defaultModel: "grok-beta",
      },
      defaultProvider: "openai",
      autoCopy: true,
    };

    try {
      writeFileSync(configFile, JSON.stringify(sampleConfig, null, 2));
      console.log(
        chalk.green("✓ Created configuration file:"),
        chalk.gray(configFile),
      );

      console.log(chalk.cyan("\n📝 Sample configuration created!"));
      console.log(chalk.bold("\nNext steps:"));
      console.log(
        chalk.gray("1. Edit the configuration file to add your API keys:"),
      );
      console.log(chalk.white(`   ${configFile}`));
      console.log(
        chalk.gray("\n2. Or use the config command to set API keys:"),
      );
      console.log(chalk.white("   llmpeg config --openai YOUR_KEY"));
      console.log(chalk.white("   llmpeg config --claude YOUR_KEY"));
      console.log(chalk.white("   llmpeg config --gemini YOUR_KEY"));
      console.log(chalk.white("   llmpeg config --grok YOUR_KEY"));
      console.log(chalk.gray("\n3. View your configuration:"));
      console.log(chalk.white("   llmpeg config --show"));
      console.log(chalk.gray("\n4. Start using LLmpeg:"));
      console.log(chalk.white('   llmpeg "convert video.mp4 to gif"'));
    } catch (error) {
      console.error(
        chalk.red("Failed to create configuration file:"),
        (error as Error).message,
      );
      process.exit(1);
    }
  });

program
  .command("config")
  .description("Configure API keys and defaults")
  .option("--openai <key>", "Set OpenAI API key")
  .option("--claude <key>", "Set Claude API key")
  .option("--gemini <key>", "Set Google Gemini API key")
  .option("--grok <key>", "Set Grok API key")
  .option(
    "--default-provider <provider>",
    "Set default AI provider (openai, claude, gemini, grok)",
  )
  .option(
    "--default-model <model>",
    "Set default model for the current provider",
  )
  .option("--show", "Show current configuration (keys are masked)")
  .option(
    "--auto-copy <value>",
    "Enable/disable automatic clipboard copy (true/false)",
  )
  .action(async (options) => {
    if (options.show) {
      const config = configManager.getConfig();
      console.log(chalk.cyan("Current Configuration:"));
      console.log(chalk.gray("Location: ~/.llmpeg/config.json\n"));

      console.log(chalk.bold("API Keys:"));
      console.log(
        "  OpenAI:",
        config.openai?.apiKey ? chalk.green("✓ Set") : chalk.red("✗ Not set"),
      );
      console.log(
        "  Claude:",
        config.claude?.apiKey ? chalk.green("✓ Set") : chalk.red("✗ Not set"),
      );
      console.log(
        "  Gemini:",
        config.gemini?.apiKey ? chalk.green("✓ Set") : chalk.red("✗ Not set"),
      );
      console.log(
        "  Grok:",
        config.grok?.apiKey ? chalk.green("✓ Set") : chalk.red("✗ Not set"),
      );

      console.log(chalk.bold("\nDefaults:"));
      console.log(
        "  Default Provider:",
        chalk.yellow(config.defaultProvider || "openai"),
      );

      if (config.openai?.defaultModel) {
        console.log(
          "  OpenAI Model:",
          chalk.yellow(config.openai.defaultModel),
        );
      }
      if (config.claude?.defaultModel) {
        console.log(
          "  Claude Model:",
          chalk.yellow(config.claude.defaultModel),
        );
      }
      if (config.gemini?.defaultModel) {
        console.log(
          "  Gemini Model:",
          chalk.yellow(config.gemini.defaultModel),
        );
      }
      if (config.grok?.defaultModel) {
        console.log("  Grok Model:", chalk.yellow(config.grok.defaultModel));
      }

      console.log(chalk.gray("\nConfiguration Priority:"));
      console.log(chalk.gray("1. CLI flags (highest)"));
      console.log(chalk.gray("2. Environment variables"));
      console.log(chalk.gray("3. ~/.llmpeg/config.json"));
      console.log(chalk.gray("4. .env files (lowest)"));

      console.log(chalk.bold("\nSettings:"));
      console.log(
        "  Auto-copy:",
        config.autoCopy ? chalk.green("✓ Enabled") : chalk.gray("✗ Disabled"),
      );
      return;
    }

    let updated = false;

    if (options.openai) {
      configManager.setApiKey("openai", options.openai);
      updated = true;
    }
    if (options.claude) {
      configManager.setApiKey("claude", options.claude);
      updated = true;
    }
    if (options.gemini) {
      configManager.setApiKey("gemini", options.gemini);
      updated = true;
    }
    if (options.grok) {
      configManager.setApiKey("grok", options.grok);
      updated = true;
    }
    if (options.defaultProvider) {
      const validProviders = ["openai", "claude", "gemini", "grok"];
      if (!validProviders.includes(options.defaultProvider.toLowerCase())) {
        console.error(
          chalk.red(`Invalid provider: ${options.defaultProvider}`),
        );
        console.error(
          chalk.gray(`Valid providers: ${validProviders.join(", ")}`),
        );
        process.exit(1);
      }
      configManager.setDefaultProvider(options.defaultProvider.toLowerCase());
      updated = true;
    }
    if (options.defaultModel) {
      const currentProvider = configManager.getDefaultProvider();
      configManager.setDefaultModel(currentProvider, options.defaultModel);
      console.log(
        chalk.gray(
          `Set default model for ${currentProvider}: ${options.defaultModel}`,
        ),
      );
      updated = true;
    }
    if (options.autoCopy !== undefined) {
      const value = options.autoCopy.toLowerCase() === "true";
      configManager.setAutoCopy(value);
      console.log(chalk.gray(`Auto-copy ${value ? "enabled" : "disabled"}`));
      updated = true;
    }

    if (updated) {
      await configManager.save();
      console.log(
        chalk.green("✓ Configuration saved to ~/.llmpeg/config.json"),
      );
    } else {
      console.log(chalk.yellow("No configuration changes made."));
      console.log(chalk.gray("Use --help to see available options."));
    }
  });

console.log(`
${vice(
  figlet.textSync("LLMPEG", {
    font: "ANSI Shadow",
    horizontalLayout: "default",
    verticalLayout: "default",
  }),
)}

Author: Ali Torki
Github: https://github.com/ali-master/llmpeg
`);

// Check if any API key is configured
if (!configManager.hasAnyApiKey()) {
  console.log(chalk.yellow("⚠️  No API keys configured. Please run:"));
  console.log(chalk.gray("  llmpeg config --openai YOUR_KEY"));
  console.log(chalk.gray("  or set environment variable OPENAI_API_KEY"));
  console.log(chalk.gray('\nRun "llmpeg config --help" for more options.'));
}

program.parse();
