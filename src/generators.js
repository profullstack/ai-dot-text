/**
 * Build llms.txt JSON content
 * @param {Object} config - Configuration object
 * @returns {string} JSON string for llms.txt
 */
export function buildLlmsJson(config) {
  const data = {
    version: "1.0",
    site_name: config.siteName,
    contact: config.contact,
    models: config.models,
    capabilities: config.capabilities,
    policy: {
      allow: config.allowPaths,
      disallow: config.disallowPaths,
    },
    training: config.training === "allow",
    retention: config.retention === "allow",
    commercial_use: config.commercialUse === "allow",
    rate_limit_rps: config.rateLimitRps,
  };

  return JSON.stringify(data, null, 2) + "\n";
}

/**
 * Build ai.txt content
 * @param {Object} config - Configuration object
 * @returns {string} Text content for ai.txt
 */
export function buildAiTxt(config) {
  const lines = [
    `# ai.txt for ${config.siteName}`,
    `# Base: ${config.baseUrl}`,
    `# Contact: ${config.contact}`,
    `# Models: ${config.models.join(", ")}`,
    `# Capabilities: ${config.capabilities.join(", ")}`,
    "",
    "User-agent: *",
    ...config.allowPaths.map((p) => `Allow: ${p}`),
    ...config.disallowPaths.map((p) => `Disallow: ${p}`),
    "",
    `Training: ${config.training}`,
    `Retention: ${config.retention}`,
    `Commercial-Use: ${config.commercialUse}`,
    `Rate-Limit-RPS: ${config.rateLimitRps}`,
    "",
  ];

  return lines.join("\n");
}