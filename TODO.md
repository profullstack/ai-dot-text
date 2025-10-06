# AI.txt & LLMs.txt Generator - TODO

## Project Overview
Build a Node.js npm module/CLI interface for generating ai.txt and llms.txt static files.

## Requirements

### Core Features
- Interactive CLI using inquirer for user input
- Generate ai.txt file (robots.txt-like format for AI)
- Generate llms.txt file (JSON format for LLM policies)
- Support command-line flags for customization
- Output files to specified directory (default: current working directory)

### CLI Flags
- `--out <dir>` - Output directory (default: current working directory)
- `--ai-only` - Generate only ai.txt
- `--llms-only` - Generate only llms.txt
- `--dry-run` - Preview output without writing files
- `--help` / `-h` - Show help message

### File Formats

#### ai.txt (text format)
```
# ai.txt for <site_name>
# Base: <base_url>
# Contact: <contact>
# Models: <models>
# Capabilities: <capabilities>

User-agent: *
Allow: <paths>
Disallow: <paths>

Training: allow/disallow
Retention: allow/disallow
Commercial-Use: allow/disallow
Rate-Limit-RPS: <number>
```

#### llms.txt (JSON format in .well-known/)
```json
{
  "version": "1.0",
  "site_name": "...",
  "contact": "...",
  "models": ["..."],
  "capabilities": ["..."],
  "policy": {
    "allow": ["..."],
    "disallow": ["..."]
  },
  "training": true/false,
  "retention": true/false,
  "commercial_use": true/false,
  "rate_limit_rps": 10
}
```

### Configuration Options
- Site name
- Base URL
- Contact information
- Allowed models (default: ["*"])
- Capabilities (chat, embed, fine_tune, crawl, train)
- Allow/disallow paths
- Training permission
- Data retention permission
- Commercial use permission
- Rate limit (requests per second)

## Technical Stack
- Node.js v20+
- ESM modules
- inquirer for interactive prompts
- Mocha + Chai for testing
- ESLint + Prettier for code quality

## Development Tasks
1. ✅ Create TODO.md
2. Set up package.json with dependencies
3. Create directory structure (src/, tests/)
4. Write tests for argument parsing
5. Write tests for file generators
6. Implement argument parser
7. Implement ai.txt generator
8. Implement llms.txt generator
9. Create CLI entry point
10. Add ESLint/Prettier config
11. Manual testing
12. Update README