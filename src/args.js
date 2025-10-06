import path from "node:path";

/**
 * Parse command-line arguments
 * @param {string[]} args - Array of command-line arguments
 * @returns {Object} Parsed arguments object
 */
export function parseArgs(args) {
  const flags = new Set(args.filter((a) => a.startsWith("-")));

  const getFlagValue = (name, defaultValue) => {
    const index = args.findIndex(
      (a) => a === name || a.startsWith(`${name}=`)
    );
    if (index === -1) return defaultValue;

    const arg = args[index];
    if (arg.includes("=")) {
      return arg.split("=")[1];
    }

    const nextArg = args[index + 1];
    return nextArg && !nextArg.startsWith("-") ? nextArg : defaultValue;
  };

  return {
    outDir: path.resolve(getFlagValue("--out", process.cwd())),
    onlyAi: flags.has("--ai-only"),
    onlyLlms: flags.has("--llms-only"),
    onlyRobots: flags.has("--robots-only"),
    onlyHumans: flags.has("--humans-only"),
    dryRun: flags.has("--dry-run"),
    help: flags.has("--help") || flags.has("-h"),
  };
}