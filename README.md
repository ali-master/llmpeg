<div align="center">
  <img src="assets/logo.svg" alt="LLmpeg Logo" width="200" height="200">
  
  # LLmpeg 🎥✨

  > Generate FFmpeg commands using AI models (OpenAI, Claude, Gemini, Grok)
</div>

LLmpeg is a powerful command-line tool that uses AI to generate FFmpeg commands from natural language descriptions. Simply describe what you want to do with your video/audio files, and LLmpeg will generate the appropriate FFmpeg command for you.

## Features

- 🤖 **Multi-Model Support**: Works with OpenAI (GPT-4), Claude (Anthropic), Google Gemini, and Grok (xAI)
- 🎯 **Natural Language**: Describe your media processing needs in plain English
- 📋 **Clipboard Support**: Copy generated commands directly to your clipboard
- ⚡ **Direct Execution**: Optionally execute generated commands immediately
- 🔐 **Secure Configuration**: Store API keys safely in your home directory
- 🎨 **Beautiful CLI**: Colorful output with loading spinners and clear formatting

## Installation

```bash
# Using npm
npm install -g @usex/llmpeg

# Using bun
bun install -g @usex/llmpeg

# Using yarn
yarn global add @usex/llmpeg
```

## Quick Start

1. **Configure your API key** (at least one):
```bash
# Configure OpenAI
llmpeg config --openai YOUR_OPENAI_API_KEY

# Configure Claude
llmpeg config --claude YOUR_ANTHROPIC_API_KEY

# Configure Gemini
llmpeg config --gemini YOUR_GOOGLE_API_KEY

# Configure Grok
llmpeg config --grok YOUR_XAI_API_KEY
```

2. **Generate an FFmpeg command**:
```bash
llmpeg "convert video.mp4 to webm format with VP9 codec"
```

## Usage

### Basic Command Generation

```bash
# Simple conversion
llmpeg "convert input.mov to mp4"

# More complex example
llmpeg "extract audio from video.mp4 and save as mp3 with 192k bitrate"

# Multiple operations
llmpeg "resize video to 720p, add fade in and fade out effects, and compress for web"
```

### Command Options

```bash
# Use a specific AI model
llmpeg -m claude "stabilize shaky video footage"
llmpeg -m gemini "create a gif from video between 10-15 seconds"
llmpeg -m grok "merge audio.mp3 with video.mp4"

# Use a specific model variant
llmpeg -m openai -p gpt-4 "complex video editing task"
llmpeg -m claude -p claude-3-opus-20240229 "advanced filtering"

# Copy command to clipboard
llmpeg -c "compress video for Discord upload"

# Execute the command directly
llmpeg -e "convert all png images to a video"

# Verbose output for debugging
llmpeg -v "extract frames from video"
```

### Configuration Management

```bash
# Show current configuration
llmpeg config --show

# Set API keys
llmpeg config --openai YOUR_OPENAI_KEY
llmpeg config --claude YOUR_ANTHROPIC_KEY
llmpeg config --gemini YOUR_GOOGLE_KEY
llmpeg config --grok YOUR_XAI_KEY

# Set default provider (openai, claude, gemini, grok)
llmpeg config --default-provider claude

# Set default model for current provider
llmpeg config --default-model gpt-4-turbo

# Multiple settings at once
llmpeg config --openai KEY --default-provider openai
```

## Supported AI Models

### OpenAI (Default)
- `gpt-4o-mini` (default)
- `gpt-4`
- `gpt-4-turbo`
- `gpt-3.5-turbo`

### Claude (Anthropic)
- `claude-3-haiku-20240307` (default)
- `claude-3-sonnet-20240229`
- `claude-3-opus-20240229`

### Google Gemini
- `gemini-1.5-flash` (default)
- `gemini-1.5-pro`
- `gemini-pro`

### Grok (xAI)
- `grok-beta` (default)

## Examples

### Video Conversion
```bash
llmpeg "convert MOV to MP4 with H.264 codec"
# Output: ffmpeg -v quiet -stats -i input.mov -c:v libx264 output.mp4
```

### Audio Extraction
```bash
llmpeg "extract audio from video and save as high quality mp3"
# Output: ffmpeg -v quiet -stats -i input.mp4 -q:a 0 -map a output.mp3
```

### Video Resizing
```bash
llmpeg "resize video to 1280x720 maintaining aspect ratio"
# Output: ffmpeg -v quiet -stats -i input.mp4 -vf scale=1280:720:force_original_aspect_ratio=decrease output.mp4
```

### GIF Creation
```bash
llmpeg "create gif from video between 5-10 seconds with 10fps"
# Output: ffmpeg -v quiet -stats -i input.mp4 -ss 5 -t 5 -filter_complex "[0:v] fps=10,scale=480:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse" output.gif
```

### Video Compression
```bash
llmpeg "compress video for web streaming with good quality"
# Output: ffmpeg -v quiet -stats -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

### Batch Processing
```bash
llmpeg "convert all MP4 files in current directory to WebM"
# Output: ffmpeg -v quiet -stats -i "*.mp4" -c:v libvpx-vp9 -c:a libopus "%~nf.webm"
```

## Environment Variables

You can also set API keys using environment variables:

- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Claude API key
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini API key
- `XAI_API_KEY` - Grok API key

## Configuration

LLmpeg uses a flexible configuration system with the following priority order:

1. **CLI flags** (highest priority) - Options passed directly to commands
2. **Environment variables** - System environment variables
3. **Config file** - `~/.llmpeg/config.json`
4. **Env files** - `.env` files in current directory or home

### Configuration File

The main configuration file is stored at `~/.llmpeg/config.json`:

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
  "defaultProvider": "openai"
}
```

## Tips

1. **Be specific**: The more detailed your description, the better the generated command
2. **Check commands**: Always review generated commands before execution
3. **Use appropriate models**: Different models may excel at different types of tasks
4. **Save commands**: Use `-c` to copy complex commands for later use

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/llmpeg
cd llmpeg

# Install dependencies
bun install

# Run in development mode
bun run start:dev

# Run tests
bun test

# Build for production
bun run build
```

## API Key Security

- API keys are stored locally in `~/.llmpeg/config.json`
- Configuration file is never committed to version control
- Environment variables override config file settings
- Use environment-specific `.env` files for different environments
- Keys are never sent anywhere except to the respective AI service

## Troubleshooting

### "No API key found" Error
Make sure you've configured at least one API key:
```bash
llmpeg config --show
```

### Command Execution Fails
- Ensure FFmpeg is installed on your system
- Check that the generated command is valid
- Use `-v` flag for verbose output

### Model Errors
- Verify your API key is valid
- Check your API usage limits
- Try a different model provider

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Vercel AI SDK](https://sdk.vercel.ai/)
- Powered by [Bun](https://bun.sh/)
- Uses models from OpenAI, Anthropic, Google, and xAI

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [documentation](https://github.com/yourusername/llmpeg/wiki)

---

Made with ❤️ by [Ali Torki](https://github.com/ali-master), for developers. Happy encoding! 🎬
