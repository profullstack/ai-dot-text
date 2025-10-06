import { expect } from "chai";
import {
  buildAiTxt,
  buildLlmsJson,
  buildRobotsTxt,
  buildHumansTxt,
} from "../src/generators.js";

describe("File Generators", () => {
  describe("buildLlmsJson", () => {
    it("should generate valid llms.txt JSON with all fields", () => {
      const config = {
        siteName: "Test Site",
        contact: "mailto:test@example.com",
        models: ["gpt-4", "claude-3"],
        capabilities: ["chat", "embed"],
        allowPaths: ["/api/*", "/docs/*"],
        disallowPaths: ["/admin/*"],
        training: "allow",
        retention: "allow",
        commercialUse: "disallow",
        rateLimitRps: 10,
      };

      const result = buildLlmsJson(config);
      const parsed = JSON.parse(result);

      expect(parsed).to.have.property("version", "1.0");
      expect(parsed).to.have.property("site_name", "Test Site");
      expect(parsed).to.have.property("contact", "mailto:test@example.com");
      expect(parsed.models).to.deep.equal(["gpt-4", "claude-3"]);
      expect(parsed.capabilities).to.deep.equal(["chat", "embed"]);
      expect(parsed.policy.allow).to.deep.equal(["/api/*", "/docs/*"]);
      expect(parsed.policy.disallow).to.deep.equal(["/admin/*"]);
      expect(parsed.training).to.equal(true);
      expect(parsed.retention).to.equal(true);
      expect(parsed.commercial_use).to.equal(false);
      expect(parsed.rate_limit_rps).to.equal(10);
    });

    it("should handle wildcard models", () => {
      const config = {
        siteName: "Test",
        contact: "test@example.com",
        models: ["*"],
        capabilities: ["chat"],
        allowPaths: ["/*"],
        disallowPaths: [],
        training: "allow",
        retention: "allow",
        commercialUse: "allow",
        rateLimitRps: 5,
      };

      const result = buildLlmsJson(config);
      const parsed = JSON.parse(result);

      expect(parsed.models).to.deep.equal(["*"]);
    });

    it("should convert permission strings to booleans", () => {
      const config = {
        siteName: "Test",
        contact: "test@example.com",
        models: ["*"],
        capabilities: ["chat"],
        allowPaths: ["/*"],
        disallowPaths: [],
        training: "disallow",
        retention: "disallow",
        commercialUse: "disallow",
        rateLimitRps: 1,
      };

      const result = buildLlmsJson(config);
      const parsed = JSON.parse(result);

      expect(parsed.training).to.equal(false);
      expect(parsed.retention).to.equal(false);
      expect(parsed.commercial_use).to.equal(false);
    });
  });

  describe("buildAiTxt", () => {
    it("should generate valid ai.txt format", () => {
      const config = {
        siteName: "Test Site",
        baseUrl: "https://example.com",
        contact: "mailto:test@example.com",
        models: ["gpt-4", "claude-3"],
        capabilities: ["chat", "embed"],
        allowPaths: ["/api/*", "/docs/*"],
        disallowPaths: ["/admin/*"],
        training: "allow",
        retention: "allow",
        commercialUse: "disallow",
        rateLimitRps: 10,
      };

      const result = buildAiTxt(config);

      expect(result).to.include("# ai.txt for Test Site");
      expect(result).to.include("# Base: https://example.com");
      expect(result).to.include("# Contact: mailto:test@example.com");
      expect(result).to.include("# Models: gpt-4, claude-3");
      expect(result).to.include("# Capabilities: chat, embed");
      expect(result).to.include("User-agent: *");
      expect(result).to.include("Allow: /api/*");
      expect(result).to.include("Allow: /docs/*");
      expect(result).to.include("Disallow: /admin/*");
      expect(result).to.include("Training: allow");
      expect(result).to.include("Retention: allow");
      expect(result).to.include("Commercial-Use: disallow");
      expect(result).to.include("Rate-Limit-RPS: 10");
    });

    it("should handle empty disallow paths", () => {
      const config = {
        siteName: "Test",
        baseUrl: "https://example.com",
        contact: "test@example.com",
        models: ["*"],
        capabilities: ["chat"],
        allowPaths: ["/*"],
        disallowPaths: [],
        training: "allow",
        retention: "allow",
        commercialUse: "allow",
        rateLimitRps: 5,
      };

      const result = buildAiTxt(config);

      expect(result).to.include("Allow: /*");
      expect(result).to.not.include("Disallow:");
    });

    it("should format multiple paths correctly", () => {
      const config = {
        siteName: "Test",
        baseUrl: "https://example.com",
        contact: "test@example.com",
        models: ["*"],
        capabilities: ["chat"],
        allowPaths: ["/path1", "/path2", "/path3"],
        disallowPaths: ["/secret1", "/secret2"],
        training: "allow",
        retention: "allow",
        commercialUse: "allow",
        rateLimitRps: 5,
      };

      const result = buildAiTxt(config);

      expect(result).to.include("Allow: /path1");
      expect(result).to.include("Allow: /path2");
      expect(result).to.include("Allow: /path3");
      expect(result).to.include("Disallow: /secret1");
      expect(result).to.include("Disallow: /secret2");
    });
  });

  describe("buildRobotsTxt", () => {
    it("should generate valid robots.txt format", () => {
      const config = {
        userAgent: "*",
        allowPaths: ["/api/*", "/docs/*"],
        disallowPaths: ["/admin/*", "/private/*"],
        crawlDelay: 1,
        sitemap: "https://example.com/sitemap.xml",
      };

      const result = buildRobotsTxt(config);

      expect(result).to.include("User-agent: *");
      expect(result).to.include("Allow: /api/*");
      expect(result).to.include("Allow: /docs/*");
      expect(result).to.include("Disallow: /admin/*");
      expect(result).to.include("Disallow: /private/*");
      expect(result).to.include("Crawl-delay: 1");
      expect(result).to.include("Sitemap: https://example.com/sitemap.xml");
    });

    it("should handle empty allow paths", () => {
      const config = {
        userAgent: "*",
        allowPaths: [],
        disallowPaths: ["/admin/*"],
        crawlDelay: 0,
        sitemap: "",
      };

      const result = buildRobotsTxt(config);

      expect(result).to.include("User-agent: *");
      expect(result).to.include("Disallow: /admin/*");
      expect(result).to.not.include("Allow:");
      expect(result).to.not.include("Crawl-delay:");
      expect(result).to.not.include("Sitemap:");
    });

    it("should handle multiple user agents", () => {
      const config = {
        userAgent: "Googlebot",
        allowPaths: ["/*"],
        disallowPaths: [],
        crawlDelay: 0,
        sitemap: "",
      };

      const result = buildRobotsTxt(config);

      expect(result).to.include("User-agent: Googlebot");
    });
  });

  describe("buildHumansTxt", () => {
    it("should generate valid humans.txt format with team members", () => {
      const config = {
        siteName: "My Awesome Site",
        siteUrl: "https://example.com",
        language: "English",
        team: [
          { name: "John Doe", role: "Developer", link: "https://github.com/johndoe" },
          { name: "Jane Smith", role: "Designer", link: "https://twitter.com/janesmith" },
        ],
        thanks: ["Open Source Community", "Coffee"],
        technology: ["Node.js", "JavaScript", "HTML5"],
        lastUpdate: "2024/01/01",
      };

      const result = buildHumansTxt(config);

      expect(result).to.include("/* TEAM */");
      expect(result).to.include("Developer: John Doe");
      expect(result).to.include("Contact: https://github.com/johndoe");
      expect(result).to.include("Designer: Jane Smith");
      expect(result).to.include("Contact: https://twitter.com/janesmith");
      expect(result).to.include("/* THANKS */");
      expect(result).to.include("Open Source Community");
      expect(result).to.include("Coffee");
      expect(result).to.include("/* SITE */");
      expect(result).to.include("Standards: HTML5");
      expect(result).to.include("Components: Node.js, JavaScript");
      expect(result).to.include("Last update: 2024/01/01");
      expect(result).to.include("Language: English");
    });

    it("should handle empty team array", () => {
      const config = {
        siteName: "Test Site",
        siteUrl: "https://test.com",
        language: "English",
        team: [],
        thanks: [],
        technology: ["Node.js"],
        lastUpdate: "2024/01/01",
      };

      const result = buildHumansTxt(config);

      expect(result).to.include("/* TEAM */");
      expect(result).to.include("/* SITE */");
      expect(result).to.not.include("/* THANKS */");
    });

    it("should format team members correctly", () => {
      const config = {
        siteName: "Test",
        siteUrl: "https://test.com",
        language: "English",
        team: [
          { name: "Alice", role: "Lead Developer", link: "https://alice.dev" },
        ],
        thanks: [],
        technology: ["React"],
        lastUpdate: "2024/01/01",
      };

      const result = buildHumansTxt(config);

      expect(result).to.include("Lead Developer: Alice");
      expect(result).to.include("Contact: https://alice.dev");
    });
  });
});