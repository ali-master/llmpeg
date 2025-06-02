import { spawn } from "child_process";
import { platform } from "os";

export async function copyToClipboard(text: string): Promise<void> {
  const os = platform();

  let command: string;
  let args: string[] = [];

  switch (os) {
    case "darwin": // macOS
      command = "pbcopy";
      break;
    case "win32": // Windows
      command = "clip";
      break;
    case "linux":
    case "freebsd":
    case "openbsd": {
      // Try to detect available clipboard utility
      const { execSync } = await import("child_process");
      try {
        execSync("which xclip", { stdio: "ignore" });
        command = "xclip";
        args = ["-selection", "clipboard"];
      } catch {
        try {
          execSync("which xsel", { stdio: "ignore" });
          command = "xsel";
          args = ["--clipboard", "--input"];
        } catch {
          try {
            execSync("which wl-copy", { stdio: "ignore" });
            command = "wl-copy";
          } catch {
            throw new Error(
              "No clipboard utility found. Please install xclip, xsel, or wl-copy.",
            );
          }
        }
      }
      break;
    }
    default:
      throw new Error(`Unsupported platform: ${os}`);
  }

  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });

    proc.on("error", (error) => {
      reject(new Error(`Failed to copy to clipboard: ${error.message}`));
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Clipboard command exited with code ${code}`));
      }
    });

    proc.stdin.write(text);
    proc.stdin.end();
  });
}
