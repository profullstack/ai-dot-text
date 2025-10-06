#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import inquirer from "inquirer";
import { parseArgs } from "./args.js";
import { buildAiTxt, buildLlmsJson } from "./generators.js";

const defaults = {
  siteName: "My Site",
  baseUrl: "https://example.com",
  contact: "mailto:admin@example.com",
  models: ["*"],
  capabilities: ["chat", "embed", "fine_tune", "crawl", "train"],
  allowPaths: ["/*"],
  disallowPaths: [],
  training: "allow",
  retention: "allow",
  commercialUse: "allow",
  rateLimitRps: 10,
};

const questions = [
  {
    type: "input",
    name: "siteName",
    message: "Site / app name:",
    default: defaults.siteName,
  },
  {
    type: "input",
    name: "baseUrl",
    message: "Public base URL:",
    default: defaults.baseUrl,
  },
  {
    type: "input",
    name: "contact",
    message: "Contact:",
    default: defaults.contact,
  },
  {
    type: "input",
    name: "models",
    message: "Models (comma-separated):",
    default: defaults.models.join(","),
  },
  {
    type: "checkbox",
    name: "capabilities",
    message: "Capabilities allowed:",
    choices: ["chat", "embed", "fine_tune", "crawl", "train"],
    default: defaults.capabilities,
  },
  {
    type: "input",
    name: "allowPaths",
    message: "Allow paths (comma-separated):",
    default: defaults.allowPaths.join(","),
  },
  {
    type: "input",
    name: "disallowPaths",
    message: "Disallow paths (comma-separated):",
    default: defaults.disallowPaths.join(","),
  },
  {
    type: "list",
    name: "training",
    message: "Training permission:",
    choices: ["allow", "disallow"],
    default: defaults.training,
  },
  {
    type: "list",
    name: "retention",
    message: "Data retention permission:",
    choices: ["allow", "disallow"],
    default: defaults.retention,
  },
  {
    type: "list",
    name: "commercialUse",
    message: "Commercial use permission:",
    choices: ["allow", "disallow"],
    default: defaults.commercialUse,
  },
  {
    type: "number",
    name: "rateLimitRps",
    message: "Rate-limit RPS:",
    default: defaults.rateLimitRps,
    filter: (value) =>
      Number.isFinite(Number(value)) ? Number(value) : defaults.rateLimitRps,
  },
];

/**
 * Normalize user answers by splitting comma-separated strings
 * @param {Object} answers - Raw answers from inquirer
 * @returns {Object} Normalized answers
 */
function normalizeAnswers(answers) {
  const splitList = (str) =>
    str
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  return {
    ...answers,
    models: splitList(answers.models),
    allowPaths: splitList(answers.allowPaths),
    disallowPaths: splitList(answers.disallowPaths),
  };
}

/**
 * Ensure output directories exist
 * @param {string} outDir - Output directory path
 * @param {string} wellKnownDir - .well-known directory path
 */
async function ensureDirs(outDir, wellKnownDir) {
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(wellKnownDir, { recursive: true });
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`Usage:
  ai-txt-init [options]

Options:
  --out <dir>       Output directory (default: current directory)
  --ai-only         Generate only ai.txt
  --llms-only       Generate only llms.txt (in .well-known/)
  --dry-run         Preview output without writing files
  --help, -h        Show this help message

Examples:
  ai-txt-init
  ai-txt-init --out ./public
  ai-txt-init --dry-run
  ai-txt-init --ai-only --out ./dist
`);
}

/**
 * Main CLI function
 */
async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      showHelp();
      process.exit(0);
    }

    const wellKnownDir = path.join(args.outDir, ".well-known");

    // Prompt user for configuration
    const answers = await inquirer.prompt(questions);
    const config = normalizeAnswers(answers);

    // Generate file contents
    const llmsContent = buildLlmsJson(config);
    const aiContent = buildAiTxt(config);

    // Dry run: just print the output
    if (args.dryRun) {
      if (!args.onlyAi) {
        console.log("\n# /.well-known/llms.txt\n");
        console.log(llmsContent);
      }
      if (!args.onlyLlms) {
        console.log("\n# /ai.txt\n");
        console.log(aiContent);
      }
      return;
    }

    // Create directories
    await ensureDirs(args.outDir, wellKnownDir);

    // Write files
    const createdFiles = [];

    if (!args.onlyAi) {
      const llmsPath = path.join(wellKnownDir, "llms.txt");
      await fs.writeFile(llmsPath, llmsContent, "utf8");
      createdFiles.push(llmsPath);
    }

    if (!args.onlyLlms) {
      const aiPath = path.join(args.outDir, "ai.txt");
      await fs.writeFile(aiPath, aiContent, "utf8");
      createdFiles.push(aiPath);
    }

    // Show success message
    console.log("\nCreated:");
    createdFiles.forEach((file) => console.log(`  - ${file}`));
    console.log("\nDone ✅");
  } catch (error) {
    console.error("Error:", error?.message || error);
    process.exit(1);
  }
}

main();