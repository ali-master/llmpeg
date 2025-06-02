<div align="center">
  <br>
  <img src="assets/logo.svg" alt="LLmpeg Logo" width="240" height="240">
  <br>
  <br>
  
  <h1>LLmpeg</h1>
  
  <p>
    <strong>🎥 Transform natural language into FFmpeg commands using AI</strong>
  </p>
  
  <p>
    <a href="#-features">Features</a> •
    <a href="#-installation">Installation</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-examples">Examples</a> •
    <a href="#-supported-ai-models">Models</a> •
    <a href="#-contributing">Contributing</a>
  </p>
  
  <p>
    <a href="https://www.npmjs.com/package/@usex/llmpeg">
      <img src="https://img.shields.io/npm/v/@usex/llmpeg?style=flat-square&color=00DC82&label=npm" alt="npm version">
    </a>
    <a href="https://github.com/ali-master/llmpeg/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/ali-master/llmpeg?style=flat-square&color=00DC82" alt="license">
    </a>
    <a href="https://github.com/ali-master/llmpeg">
      <img src="https://img.shields.io/github/stars/ali-master/llmpeg?style=flat-square&color=00DC82" alt="github stars">
    </a>
  </p>
</div>

<br>

## ✨ Features
- 🤖 **Multi-Model Support**: OpenAI, Claude, Gemini, and Grok
- 🎯 **Natural Language**: Describe tasks in plain English
- 📋 **Cross-Platform Clipboard**: Works on macOS, Windows, Linux
- ⚡ **Direct Execution**: Run commands immediately
- 🔐 **Secure Configuration**: API keys stored locally
- 🎨 **Beautiful CLI**: Colorful and intuitive interface

## 📦 Installation

```bash
# npm
npm install -g @usex/llmpeg

# bun (recommended)
bun install -g @usex/llmpeg

# yarn
yarn global add @usex/llmpeg

# pnpm
pnpm add -g @usex/llmpeg
```

### System Requirements

- **Node.js** 18.0.0 or higher
- **FFmpeg** installed on your system ([Download FFmpeg](https://ffmpeg.org/download.html))
- **API Key** from at least one AI provider

## 🚀 Quick Start

### 1️⃣ Initialize Configuration

```bash
llmpeg init
```

This creates a configuration file at `~/.llmpeg/config.json` with placeholders for your API keys.

### 2️⃣ Add Your API Key

```bash
# Choose your preferred AI provider
llmpeg config --openai YOUR_OPENAI_KEY
llmpeg config --claude YOUR_ANTHROPIC_KEY
llmpeg config --gemini YOUR_GOOGLE_KEY
llmpeg config --grok YOUR_XAI_KEY
```

### 3️⃣ Generate Your First Command

```bash
llmpeg "convert video.mp4 to gif with 10fps"
```

## 📖 Usage

### Basic Syntax

```bash
llmpeg [options] "<your request in natural language>"
```

### Command Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--model <provider>` | `-m` | AI provider to use (`openai`, `claude`, `gemini`, `grok`) |
| `--provider <model>` | `-p` | Specific model variant (e.g., `gpt-4`, `claude-3-opus`) |
| `--copy` | `-c` | Copy command to clipboard |
| `--execute` | `-e` | Execute the generated command immediately |
| `--verbose` | `-v` | Show detailed output |

### Configuration Commands

```bash
# Initialize configuration
llmpeg init [--force]

# Show current configuration
llmpeg config --show

# Set API keys
llmpeg config --openai YOUR_KEY
llmpeg config --claude YOUR_KEY
llmpeg config --gemini YOUR_KEY
llmpeg config --grok YOUR_KEY

# Set preferences
llmpeg config --default-provider claude
llmpeg config --default-model gpt-4-turbo
llmpeg config --auto-copy true
```

## 🎬 Examples

### Video Operations

<details>
<summary><b>Convert Formats</b></summary>

```bash
llmpeg "convert video.mov to mp4 with h264 codec"
# Output: ffmpeg -i video.mov -c:v libx264 -c:a aac output.mp4
```
</details>

<details>
<summary><b>Resize Video</b></summary>

```bash
llmpeg "resize video to 720p maintaining aspect ratio"
# Output: ffmpeg -i input.mp4 -vf scale=-1:720 output.mp4
```
</details>

<details>
<summary><b>Create GIF</b></summary>

```bash
llmpeg "create gif from video between 5-10 seconds"
# Output: ffmpeg -i input.mp4 -ss 5 -t 5 -vf "fps=10,scale=320:-1:flags=lanczos" output.gif
```
</details>

<details>
<summary><b>Extract Frames</b></summary>

```bash
llmpeg "extract 1 frame per second as jpg images"
# Output: ffmpeg -i input.mp4 -vf fps=1 frame_%04d.jpg
```
</details>

### Audio Operations

<details>
<summary><b>Extract Audio</b></summary>

```bash
llmpeg "extract audio from video as mp3 320kbps"
# Output: ffmpeg -i input.mp4 -vn -acodec mp3 -ab 320k output.mp3
```
</details>

<details>
<summary><b>Change Volume</b></summary>

```bash
llmpeg "increase audio volume by 50%"
# Output: ffmpeg -i input.mp4 -af "volume=1.5" output.mp4
```
</details>

### Advanced Operations

<details>
<summary><b>Batch Processing</b></summary>

```bash
llmpeg "convert all mp4 files to webm with vp9 codec"
# Output: for f in *.mp4; do ffmpeg -i "$f" -c:v libvpx-vp9 "${f%.mp4}.webm"; done
```
</details>

<details>
<summary><b>Streaming</b></summary>

```bash
llmpeg "stream video to rtmp server"
# Output: ffmpeg -re -i input.mp4 -c copy -f flv rtmp://server/live/stream
```
</details>

## 🤖 Supported AI Models

### OpenAI
- `gpt-4o-mini` (default) - Fast and efficient
- `gpt-4` - Most capable
- `gpt-4-turbo` - Latest GPT-4 with vision
- `gpt-3.5-turbo` - Fast and cost-effective

### Claude (Anthropic)
- `claude-3-haiku-20240307` (default) - Fast and efficient
- `claude-3-sonnet-20240229` - Balanced performance
- `claude-3-opus-20240229` - Most capable

### Google Gemini
- `gemini-1.5-flash` (default) - Fast multimodal
- `gemini-1.5-pro` - Advanced reasoning
- `gemini-pro` - Balanced performance

### Grok (xAI)
- `grok-beta` (default) - Latest model

## ⚙️ Configuration

### Priority Order

1. **CLI flags** (highest priority)
2. **Environment variables**
3. **Config file** (`~/.llmpeg/config.json`)
4. **`.env` files**

### Environment Variables

```bash
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"
export GOOGLE_GENERATIVE_AI_API_KEY="your-key"
export XAI_API_KEY="your-key"
export LLMPEG_DEFAULT_PROVIDER="claude"
```

### Config File Structure

```json
{
  "openai": {
    "apiKey": "your-openai-key",
    "defaultModel": "gpt-4o-mini"
  },
  "claude": {
    "apiKey": "your-claude-key",
    "defaultModel": "claude-3-haiku-20240307"
  },
  "gemini": {
    "apiKey": "your-gemini-key",
    "defaultModel": "gemini-1.5-flash"
  },
  "grok": {
    "apiKey": "your-grok-key",
    "defaultModel": "grok-beta"
  },
  "defaultProvider": "openai",
  "autoCopy": false
}
```

## 📋 Clipboard Support

### macOS
Native support via `pbcopy`

### Windows
Native support via `clip`

### Linux
Install one of these utilities:

```bash
# X11 users
sudo apt-get install xclip
# or
sudo apt-get install xsel

# Wayland users
sudo apt-get install wl-clipboard
```

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/ali-master/llmpeg
cd llmpeg

# Install dependencies
bun install

# Development
bun run start:dev        # Run in dev mode
bun run start:cli:dev    # Run CLI in dev mode

# Build
bun run build           # Build for production
bun run test:types      # Type checking
bun run format          # Format code
bun run lint            # Lint code
```

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Roadmap

- [ ] Interactive mode for command refinement
- [ ] Command history and favorites
- [ ] Preset templates for common tasks
- [ ] Integration with popular video platforms
- [ ] Web interface
- [ ] VSCode extension

## 🐛 Troubleshooting

<details>
<summary><b>No API key found</b></summary>

```bash
# Check your configuration
llmpeg config --show

# Ensure at least one API key is set
llmpeg config --openai YOUR_KEY
```
</details>

<details>
<summary><b>Command execution fails</b></summary>

- Ensure FFmpeg is installed: `ffmpeg -version`
- Use verbose mode: `llmpeg -v "your command"`
- Check the generated command before executing
</details>

<details>
<summary><b>Clipboard not working</b></summary>

- **Linux**: Install `xclip`, `xsel`, or `wl-copy`
- **WSL**: May need additional configuration
- Use manual copy as fallback
</details>

## 📄 License

MIT © [Ali Torki](https://github.com/ali-master)

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) - AI model integration
- [Bun](https://bun.sh/) - JavaScript runtime
- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [Chalk](https://github.com/chalk/chalk) - Terminal styling

---

<div align="center">
  <p>
    <sub>Built with ❤️ by <a href="https://github.com/ali-master" target="_blank">Ali Torki</a>, for developers. Happy encoding! 🎬</sub>
  </p>
  <p>
    <a href="https://github.com/ali-master/llmpeg">⭐ Star us on GitHub</a> •
    <a href="https://linkedin.com/in/alitorki">🐦 Follow on Linkedin</a>
  </p>
</div>
