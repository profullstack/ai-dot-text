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
  buildAiPluginJson,
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
  // ai-plugin.json defaults
  pluginSchemaVersion: "v1",
  pluginNameForModel: "my_plugin",
  pluginNameForHuman: "My Plugin",
  pluginDescriptionForModel:
    "Plugin description for the model, explaining what it can do.",
  pluginDescriptionForHuman: "Plugin description for humans.",
  pluginAuthType: "none",
  pluginApiType: "openapi",
  pluginApiUrl: "https://example.com/.well-known/openapi.yaml",
  pluginHasUserAuth: false,
  pluginLogoUrl: "https://example.com/logo.png",
  pluginContactEmail: "support@example.com",
  pluginLegalInfoUrl: "https://example.com/legal",
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
      {
        name: "ai-plugin.json (OpenAI plugin manifest)",
        value: "plugin",
        checked: false,
      },
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

// ai-plugin.json specific questions
const pluginQuestions = [
  {
    type: "input",
    name: "pluginSchemaVersion",
    message: "Plugin schema version:",
    default: defaults.pluginSchemaVersion,
  },
  {
    type: "input",
    name: "pluginNameForModel",
    message: "Plugin name (for model, lowercase/underscores):",
    default: defaults.pluginNameForModel,
  },
  {
    type: "input",
    name: "pluginNameForHuman",
    message: "Plugin name (for humans):",
    default: defaults.pluginNameForHuman,
  },
  {
    type: "input",
    name: "pluginDescriptionForModel",
    message: "Description for the model:",
    default: defaults.pluginDescriptionForModel,
  },
  {
    type: "input",
    name: "pluginDescriptionForHuman",
    message: "Description for humans:",
    default: defaults.pluginDescriptionForHuman,
  },
  {
    type: "list",
    name: "pluginAuthType",
    message: "Auth type:",
    choices: ["none", "user_http", "service_http", "oauth"],
    default: defaults.pluginAuthType,
  },
  {
    type: "list",
    name: "pluginApiType",
    message: "API type:",
    choices: ["openapi"],
    default: defaults.pluginApiType,
  },
  {
    type: "input",
    name: "pluginApiUrl",
    message: "OpenAPI spec URL:",
    default: defaults.pluginApiUrl,
  },
  {
    type: "confirm",
    name: "pluginHasUserAuth",
    message: "Has user authentication?",
    default: defaults.pluginHasUserAuth,
  },
  {
    type: "input",
    name: "pluginLogoUrl",
    message: "Logo URL:",
    default: defaults.pluginLogoUrl,
  },
  {
    type: "input",
    name: "pluginContactEmail",
    message: "Contact email:",
    default: defaults.pluginContactEmail,
  },
  {
    type: "input",
    name: "pluginLegalInfoUrl",
    message: "Legal info URL:",
    default: defaults.pluginLegalInfoUrl,
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
 * @param {Array} filesToGenerate - Array of file types to generate
 * @returns {Object} Normalized answers
 */
function normalizeAnswers(answers, filesToGenerate) {
  const splitList = (str) =>
    str
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const normalized = { ...answers };

  // Normalize AI/LLM answers
  if (filesToGenerate.includes("ai") || filesToGenerate.includes("llms")) {
    normalized.models = splitList(answers.models || "");
    normalized.allowPaths = splitList(answers.allowPaths || "");
    normalized.disallowPaths = splitList(answers.disallowPaths || "");
  }

  return normalized;
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
  --robots-only     Generate only robots.txt
  --humans-only     Generate only humans.txt
  --plugin-only     Generate only ai-plugin.json (in .well-known/)
  --dry-run         Preview output without writing files
  --help, -h        Show this help message

Examples:
  aidottxt
  aidottxt --out ./public
  aidottxt --dry-run
  aidottxt --ai-only --out ./dist
  aidottxt --robots-only --humans-only
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

    // Determine which files to generate
    let filesToGenerate = [];
    if (args.onlyAi) {
      filesToGenerate = ["ai"];
    } else if (args.onlyLlms) {
      filesToGenerate = ["llms"];
    } else if (args.onlyRobots) {
      filesToGenerate = ["robots"];
    } else if (args.onlyHumans) {
      filesToGenerate = ["humans"];
    } else if (args.onlyPlugin) {
      filesToGenerate = ["plugin"];
    } else {
      // Ask user which files to generate
      const initialAnswers = await inquirer.prompt(initialQuestions);
      filesToGenerate = initialAnswers.filesToGenerate;
    }

    // Build questions based on selected files
    let questionsToAsk = [...commonQuestions];

    if (filesToGenerate.includes("ai") || filesToGenerate.includes("llms")) {
      questionsToAsk = questionsToAsk.concat(aiLlmQuestions);
    }

    if (filesToGenerate.includes("robots")) {
      questionsToAsk = questionsToAsk.concat(robotsQuestions);
    }

    if (filesToGenerate.includes("humans")) {
      questionsToAsk = questionsToAsk.concat(humansQuestions);
    }

    if (filesToGenerate.includes("plugin")) {
      questionsToAsk = questionsToAsk.concat(pluginQuestions);
    }

    // Prompt user for configuration
    const answers = await inquirer.prompt(questionsToAsk);

    // Add team members for humans.txt
    if (filesToGenerate.includes("humans")) {
      console.log("\n--- Team Members ---");
      answers.team = await promptForTeamMembers();

      console.log("\n--- Thanks ---");
      answers.thanks = await promptForThanks();

      console.log("\n--- Technology Stack ---");
      answers.technology = await promptForTechnology();
    }

    const config = normalizeAnswers(answers, filesToGenerate);

    // Generate file contents
    const fileContents = {};

    if (filesToGenerate.includes("llms")) {
      fileContents.llms = buildLlmsJson(config);
    }

    if (filesToGenerate.includes("ai")) {
      fileContents.ai = buildAiTxt(config);
    }

    if (filesToGenerate.includes("robots")) {
      fileContents.robots = buildRobotsTxt({
        userAgent: config.robotsUserAgent,
        allowPaths: config.allowPaths || [],
        disallowPaths: config.disallowPaths || [],
        crawlDelay: config.robotsCrawlDelay,
        sitemap: config.robotsSitemap,
      });
    }

    if (filesToGenerate.includes("plugin")) {
      fileContents.plugin = buildAiPluginJson({
        schemaVersion: config.pluginSchemaVersion,
        nameForModel: config.pluginNameForModel,
        nameForHuman: config.pluginNameForHuman,
        descriptionForModel: config.pluginDescriptionForModel,
        descriptionForHuman: config.pluginDescriptionForHuman,
        authType: config.pluginAuthType,
        apiType: config.pluginApiType,
        apiUrl: config.pluginApiUrl,
        hasUserAuthentication: config.pluginHasUserAuth,
        logoUrl: config.pluginLogoUrl,
        contactEmail: config.pluginContactEmail,
        legalInfoUrl: config.pluginLegalInfoUrl,
      });
    }

    if (filesToGenerate.includes("humans")) {
      fileContents.humans = buildHumansTxt({
        siteName: config.siteName,
        siteUrl: config.baseUrl,
        language: config.language,
        team: config.team || [],
        thanks: config.thanks || [],
        technology: config.technology || [],
        lastUpdate: config.lastUpdate,
      });
    }

    // Dry run: just print the output
    if (args.dryRun) {
      if (fileContents.llms) {
        console.log("\n# /.well-known/llms.txt\n");
        console.log(fileContents.llms);
      }
      if (fileContents.ai) {
        console.log("\n# /ai.txt\n");
        console.log(fileContents.ai);
      }
      if (fileContents.robots) {
        console.log("\n# /robots.txt\n");
        console.log(fileContents.robots);
      }
      if (fileContents.humans) {
        console.log("\n# /humans.txt\n");
        console.log(fileContents.humans);
      }
      if (fileContents.plugin) {
        console.log("\n# /.well-known/ai-plugin.json\n");
        console.log(fileContents.plugin);
      }
      return;
    }

    // Create directories
    await ensureDirs(args.outDir, wellKnownDir);

    // Write files
    const createdFiles = [];

    if (fileContents.llms) {
      const llmsPath = path.join(wellKnownDir, "llms.txt");
      await fs.writeFile(llmsPath, fileContents.llms, "utf8");
      createdFiles.push(llmsPath);
    }

    if (fileContents.ai) {
      const aiPath = path.join(args.outDir, "ai.txt");
      await fs.writeFile(aiPath, fileContents.ai, "utf8");
      createdFiles.push(aiPath);
    }

    if (fileContents.robots) {
      const robotsPath = path.join(args.outDir, "robots.txt");
      await fs.writeFile(robotsPath, fileContents.robots, "utf8");
      createdFiles.push(robotsPath);
    }

    if (fileContents.humans) {
      const humansPath = path.join(args.outDir, "humans.txt");
      await fs.writeFile(humansPath, fileContents.humans, "utf8");
      createdFiles.push(humansPath);
    }

    if (fileContents.plugin) {
      const pluginPath = path.join(wellKnownDir, "ai-plugin.json");
      await fs.writeFile(pluginPath, fileContents.plugin, "utf8");
      createdFiles.push(pluginPath);
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