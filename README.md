# @profullstack/ai-dot-txt

A Node.js CLI tool to generate `ai.txt`, `llms.txt`, `robots.txt`, and `humans.txt` files for your website or application.

## Features

- 🤖 Generate `ai.txt` (robots.txt-like format for AI)
- 📋 Generate `llms.txt` (JSON format in `.well-known/` directory)
- 🤖 Generate `robots.txt` (web crawler rules)
- 👥 Generate `humans.txt` (team credits and site info)
- 🎯 Interactive CLI with sensible defaults
- ⚙️ Flexible command-line options
- 🧪 Fully tested with Mocha + Chai (23 passing tests)
- ✨ Modern ESM JavaScript (Node.js 20+)

## Installation

### Global Installation

```bash
pnpm add -g @profullstack/ai-dot-txt
```

### Local Installation

```bash
pnpm add -D @profullstack/ai-dot-txt
```

### From Source

```bash
git clone <repository-url>
cd ai-dot-txt
pnpm install
```

## Usage

### Interactive Mode

Run the CLI and answer the prompts:

```bash
aidottxt
```

### Command-Line Options

```bash
aidottxt [options]
```

#### Options

- `--out <dir>` - Output directory (default: current directory)
- `--ai-only` - Generate only `ai.txt`
- `--llms-only` - Generate only `llms.txt` (in `.well-known/`)
- `--robots-only` - Generate only `robots.txt`
- `--humans-only` - Generate only `humans.txt`
- `--dry-run` - Preview output without writing files
- `--help, -h` - Show help message

#### Examples

Generate both files in current directory:
```bash
aidottxt
```

Generate in a specific directory:
```bash
aidottxt --out ./public
```

Preview without writing files:
```bash
aidottxt --dry-run
```

Generate only ai.txt:
```bash
aidottxt --ai-only --out ./dist
```

Generate only llms.txt:
```bash
aidottxt --llms-only
```

Generate only robots.txt and humans.txt:
```bash
aidottxt --robots-only --humans-only
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

### robots.txt

Located at the root of your output directory. Format:

```
User-agent: *
Allow: /api/*
Allow: /docs/*
Disallow: /admin/*
Disallow: /private/*
Crawl-delay: 1
Sitemap: https://example.com/sitemap.xml
```

### humans.txt

Located at the root of your output directory. Format:

```
/* TEAM */
Developer: John Doe
Contact: https://github.com/johndoe

Designer: Jane Smith
Contact: https://twitter.com/janesmith

/* THANKS */
Open Source Community
Coffee

/* SITE */
Last update: 2024/01/01
Language: English
Standards: HTML5
Components: Node.js, JavaScript
```

## Programmatic Usage

You can also use this package programmatically:

```javascript
import { buildAiTxt, buildLlmsJson } from "@profullstack/ai-dot-txt";

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

This project follows several web standards and specifications:

- [humans.txt](https://humanstxt.org/) - See [humans.txt](humans.txt) for team and site information
- [robots.txt](https://www.robotstxt.org/) - Standard for web robots
- [llms.txt](https://llmstxt.org/) - LLM-friendly documentation format
- [ai.txt](https://ai-txt.org/) - AI agent interaction specification

## Author

**Profullstack, Inc.**
