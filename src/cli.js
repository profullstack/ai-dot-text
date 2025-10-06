#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import inquirer from "inquirer";
import { parseArgs } from "./args.js";
import {
  buildAiTxt,
  buildLlmsJson,
  buildRobotsTxt,
  buildHumansTxt,
} from "./generators.js";

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
  // robots.txt defaults
  robotsUserAgent: "*",
  robotsCrawlDelay: 0,
  robotsSitemap: "",
  // humans.txt defaults
  language: "English",
  lastUpdate: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
};

// Initial question to determine which files to generate
const initialQuestions = [
  {
    type: "checkbox",
    name: "filesToGenerate",
    message: "Which files would you like to generate?",
    choices: [
      { name: "ai.txt (AI/LLM policies)", value: "ai", checked: true },
      { name: "llms.txt (LLM policies JSON)", value: "llms", checked: true },
      { name: "robots.txt (Web crawler rules)", value: "robots", checked: true },
      { name: "humans.txt (Team credits)", value: "humans", checked: true },
    ],
    default: ["ai", "llms", "robots", "humans"],
  },
];

// Common questions for all file types
const commonQuestions = [
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
];

// AI/LLM specific questions
const aiLlmQuestions = [
  {
    type: "input",
    name: "contact",
    message: "Contact (for AI/LLM):",
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
    message: "Rate-limit RPS (for AI/LLM):",
    default: defaults.rateLimitRps,
    filter: (value) =>
      Number.isFinite(Number(value)) ? Number(value) : defaults.rateLimitRps,
  },
];

// robots.txt specific questions
const robotsQuestions = [
  {
    type: "input",
    name: "robotsUserAgent",
    message: "robots.txt User-agent:",
    default: defaults.robotsUserAgent,
  },
  {
    type: "input",
    name: "robotsCrawlDelay",
    message: "robots.txt Crawl delay (seconds, 0 for none):",
    default: defaults.robotsCrawlDelay,
    filter: (value) => Number(value) || 0,
  },
  {
    type: "input",
    name: "robotsSitemap",
    message: "robots.txt Sitemap URL (leave empty to skip):",
    default: defaults.robotsSitemap,
  },
];

// humans.txt specific questions
const humansQuestions = [
  {
    type: "input",
    name: "language",
    message: "humans.txt Language:",
    default: defaults.language,
  },
  {
    type: "input",
    name: "lastUpdate",
    message: "humans.txt Last update (YYYY/MM/DD):",
    default: defaults.lastUpdate,
  },
];

// Dynamic question for adding team members
async function promptForTeamMembers() {
  const team = [];
  let addMore = true;

  while (addMore) {
    const memberAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: `Team member name (or press Enter to ${team.length === 0 ? "skip" : "finish"}):`,
      },
    ]);

    if (!memberAnswers.name) {
      addMore = false;
      continue;
    }

    const detailAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "role",
        message: "Role/Title:",
        default: "Developer",
      },
      {
        type: "input",
        name: "link",
        message: "Contact link (GitHub, Twitter, website, etc.):",
      },
    ]);

    team.push({
      name: memberAnswers.name,
      role: detailAnswers.role,
      link: detailAnswers.link,
    });
  }

  return team;
}

// Dynamic question for adding thanks
async function promptForThanks() {
  const thanks = [];
  let addMore = true;

  while (addMore) {
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "thank",
        message: `Add a thank you (or press Enter to ${thanks.length === 0 ? "skip" : "finish"}):`,
      },
    ]);

    if (!answer.thank) {
      addMore = false;
    } else {
      thanks.push(answer.thank);
    }
  }

  return thanks;
}

// Dynamic question for adding technology
async function promptForTechnology() {
  const answer = await inquirer.prompt([
    {
      type: "input",
      name: "technology",
      message: "Technology stack (comma-separated, e.g., Node.js, React, HTML5):",
      default: "Node.js, JavaScript, HTML5",
    },
  ]);

  return answer.technology
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

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
  aidottxt [options]

Options:
  --out <dir>       Output directory (default: current directory)
  --ai-only         Generate only ai.txt
  --llms-only       Generate only llms.txt (in .well-known/)
  --dry-run         Preview output without writing files
  --help, -h        Show this help message

Examples:
  aidottxt
  aidottxt --out ./public
  aidottxt --dry-run
  aidottxt --ai-only --out ./dist
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