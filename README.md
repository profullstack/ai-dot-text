# AI.txt & LLMs.txt Generator

A Node.js CLI tool to generate `ai.txt` and `llms.txt` files for defining AI/LLM policies for your website or application.

## Features

- 🤖 Generate `ai.txt` (robots.txt-like format for AI)
- 📋 Generate `llms.txt` (JSON format in `.well-known/` directory)
- 🎯 Interactive CLI with sensible defaults
- ⚙️ Flexible command-line options
- 🧪 Fully tested with Mocha + Chai
- ✨ Modern ESM JavaScript (Node.js 20+)

## Installation

### Global Installation

```bash
pnpm add -g ai-txt-generator
```

### Local Installation

```bash
pnpm add -D ai-txt-generator
```

### From Source

```bash
git clone <repository-url>
cd ai-txt-generator
pnpm install
```

## Usage

### Interactive Mode

Run the CLI and answer the prompts:

```bash
ai-txt-init
```

### Command-Line Options

```bash
ai-txt-init [options]
```

#### Options

- `--out <dir>` - Output directory (default: current directory)
- `--ai-only` - Generate only `ai.txt`
- `--llms-only` - Generate only `llms.txt` (in `.well-known/`)
- `--dry-run` - Preview output without writing files
- `--help, -h` - Show help message

#### Examples

Generate both files in current directory:
```bash
ai-txt-init
```

Generate in a specific directory:
```bash
ai-txt-init --out ./public
```

Preview without writing files:
```bash
ai-txt-init --dry-run
```

Generate only ai.txt:
```bash
ai-txt-init --ai-only --out ./dist
```

Generate only llms.txt:
```bash
ai-txt-init --llms-only
```

## Output Files

### ai.txt

Located at the root of your output directory. Format:

```
# ai.txt for My Site
# Base: https://example.com
# Contact: mailto:admin@example.com
# Models: *
# Capabilities: chat, embed, fine_tune, crawl, train

User-agent: *
Allow: /*

Training: allow
Retention: allow
Commercial-Use: allow
Rate-Limit-RPS: 10
```

### llms.txt

Located at `.well-known/llms.txt`. Format:

```json
{
  "version": "1.0",
  "site_name": "My Site",
  "contact": "mailto:admin@example.com",
  "models": ["*"],
  "capabilities": ["chat", "embed", "fine_tune", "crawl", "train"],
  "policy": {
    "allow": ["/*"],
    "disallow": []
  },
  "training": true,
  "retention": true,
  "commercial_use": true,
  "rate_limit_rps": 10
}
```

## Programmatic Usage

You can also use this package programmatically:

```javascript
import { buildAiTxt, buildLlmsJson } from "ai-txt-generator";

const config = {
  siteName: "My Site",
  baseUrl: "https://example.com",
  contact: "mailto:admin@example.com",
  models: ["gpt-4", "claude-3"],
  capabilities: ["chat", "embed"],
  allowPaths: ["/api/*", "/docs/*"],
  disallowPaths: ["/admin/*"],
  training: "allow",
  retention: "allow",
  commercialUse: "disallow",
  rateLimitRps: 10,
};

// Generate ai.txt content
const aiTxtContent = buildAiTxt(config);

// Generate llms.txt content
const llmsTxtContent = buildLlmsJson(config);
```

## Configuration Options

When running interactively, you'll be prompted for:

- **Site Name**: Your website or application name
- **Base URL**: Your public base URL
- **Contact**: Contact information (email, URL, etc.)
- **Models**: Comma-separated list of allowed AI models (use `*` for all)
- **Capabilities**: Select from: chat, embed, fine_tune, crawl, train
- **Allow Paths**: Comma-separated paths to allow (e.g., `/*`, `/api/*`)
- **Disallow Paths**: Comma-separated paths to disallow (e.g., `/admin/*`)
- **Training Permission**: Allow or disallow AI training on your content
- **Retention Permission**: Allow or disallow data retention
- **Commercial Use**: Allow or disallow commercial use of your content
- **Rate Limit**: Requests per second limit

## Development

### Install Dependencies

```bash
pnpm install
```

### Run Tests

```bash
pnpm test
```

### Run Linter

```bash
pnpm lint
```

### Fix Linting Issues

```bash
pnpm lint:fix
```

### Format Code

```bash
pnpm format
```

## Project Structure

```
.
├── src/
│   ├── args.js        # CLI argument parser
│   ├── generators.js  # File content generators
│   ├── cli.js         # Main CLI entry point
│   └── index.js       # Programmatic API exports
├── tests/
│   ├── args.test.js       # Argument parser tests
│   └── generators.test.js # Generator tests
├── package.json
├── eslint.config.js
├── .prettierrc
└── README.md
```

## Requirements

- Node.js >= 20.0.0
- pnpm (recommended) or npm

## License

MIT

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass (`pnpm test`)
5. Ensure code is linted (`pnpm lint`)
6. Submit a pull request

## Related Standards

- [ai.txt specification](https://example.com/ai-txt-spec)
- [llms.txt specification](https://example.com/llms-txt-spec)
- [robots.txt](https://www.robotstxt.org/)
