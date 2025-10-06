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

/**
 * Build robots.txt content
 * @param {Object} config - Configuration object
 * @returns {string} Text content for robots.txt
 */
export function buildRobotsTxt(config) {
  const lines = [
    `User-agent: ${config.userAgent}`,
    ...config.allowPaths.map((p) => `Allow: ${p}`),
    ...config.disallowPaths.map((p) => `Disallow: ${p}`),
  ];

  if (config.crawlDelay > 0) {
    lines.push(`Crawl-delay: ${config.crawlDelay}`);
  }

  if (config.sitemap) {
    lines.push(`Sitemap: ${config.sitemap}`);
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Build humans.txt content
 * @param {Object} config - Configuration object
 * @returns {string} Text content for humans.txt
 */
export function buildHumansTxt(config) {
  const lines = ["/* TEAM */"];

  // Add team members
  config.team.forEach((member) => {
    lines.push(`${member.role}: ${member.name}`);
    if (member.link) {
      lines.push(`Contact: ${member.link}`);
    }
    lines.push("");
  });

  // Add thanks section if there are any
  if (config.thanks && config.thanks.length > 0) {
    lines.push("/* THANKS */");
    config.thanks.forEach((thank) => {
      lines.push(thank);
    });
    lines.push("");
  }

  // Add site section
  lines.push("/* SITE */");
  lines.push(`Last update: ${config.lastUpdate}`);
  lines.push(`Language: ${config.language}`);

  // Add technology/standards
  if (config.technology && config.technology.length > 0) {
    const standards = config.technology.filter((t) =>
      t.toLowerCase().includes("html")
    );
    const components = config.technology.filter(
      (t) => !t.toLowerCase().includes("html")
    );

    if (standards.length > 0) {
      lines.push(`Standards: ${standards.join(", ")}`);
    }
    if (components.length > 0) {
      lines.push(`Components: ${components.join(", ")}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}