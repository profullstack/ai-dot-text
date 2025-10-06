import { expect } from "chai";
import { parseArgs } from "../src/args.js";

describe("Argument Parser", () => {
  describe("parseArgs", () => {
    it("should parse --out flag with value", () => {
      const args = ["--out", "/custom/path"];
      const result = parseArgs(args);

      expect(result.outDir).to.equal("/custom/path");
    });

    it("should parse --out flag with equals syntax", () => {
      const args = ["--out=/custom/path"];
      const result = parseArgs(args);

      expect(result.outDir).to.equal("/custom/path");
    });

    it("should use current directory as default for --out", () => {
      const args = [];
      const result = parseArgs(args);

      expect(result.outDir).to.be.a("string");
      expect(result.outDir.length).to.be.greaterThan(0);
    });

    it("should detect --ai-only flag", () => {
      const args = ["--ai-only"];
      const result = parseArgs(args);

      expect(result.onlyAi).to.equal(true);
      expect(result.onlyLlms).to.equal(false);
    });

    it("should detect --llms-only flag", () => {
      const args = ["--llms-only"];
      const result = parseArgs(args);

      expect(result.onlyLlms).to.equal(true);
      expect(result.onlyAi).to.equal(false);
    });

    it("should detect --dry-run flag", () => {
      const args = ["--dry-run"];
      const result = parseArgs(args);

      expect(result.dryRun).to.equal(true);
    });

    it("should detect --help flag", () => {
      const args = ["--help"];
      const result = parseArgs(args);

      expect(result.help).to.equal(true);
    });

    it("should detect -h flag", () => {
      const args = ["-h"];
      const result = parseArgs(args);

      expect(result.help).to.equal(true);
    });

    it("should handle multiple flags", () => {
      const args = ["--out", "/path", "--dry-run", "--ai-only"];
      const result = parseArgs(args);

      expect(result.outDir).to.equal("/path");
      expect(result.dryRun).to.equal(true);
      expect(result.onlyAi).to.equal(true);
    });

    it("should return false for flags not present", () => {
      const args = [];
      const result = parseArgs(args);

      expect(result.onlyAi).to.equal(false);
      expect(result.onlyLlms).to.equal(false);
      expect(result.dryRun).to.equal(false);
      expect(result.help).to.equal(false);
    });

    it("should handle mixed flag formats", () => {
      const args = ["--out=/custom", "--dry-run"];
      const result = parseArgs(args);

      expect(result.outDir).to.equal("/custom");
      expect(result.dryRun).to.equal(true);
    });
  });
});