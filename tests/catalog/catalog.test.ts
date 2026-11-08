import { describe, expect, it } from "vitest";

import { catalog, findIcon, icons, searchIcons, sources } from "../../src/catalog/index.js";
import { ICON_WEIGHTS } from "../../src/core/types.js";

describe("catalog", () => {
  it("contains the pinned Phosphor snapshot", () => {
    expect(sources).toHaveLength(1);
    expect(sources[0]?.id).toBe("phosphor");
    expect(sources[0]?.version).toBe("2.1.1");
    expect(sources[0]?.commit).toBe("2b75f3ad12b420c9504ef05df8d2564a28f8500e");
    expect(icons).toHaveLength(1512);
    expect(catalog.schemaVersion).toBe(1);
  });

  it("describes every icon with six weights and source metadata", () => {
    for (const icon of icons) {
      expect(icon.weights).toEqual(ICON_WEIGHTS);
      expect(icon.viewBox).toBe("0 0 256 256");
      expect(icon.source).toBe(sources[0]);
      expect(icon.sourceVersion).toBe("2.1.1");
      expect(icon.sourceCommit).toBe("2b75f3ad12b420c9504ef05df8d2564a28f8500e");
      expect(["MIT"]).toContain(icon.source.license);
    }
  });

  it("keeps names and ids unique", () => {
    expect(new Set(icons.map((icon) => icon.id)).size).toBe(icons.length);
    expect(new Set(icons.map((icon) => icon.name)).size).toBe(icons.length);
    expect(new Set(icons.map((icon) => icon.pascalName)).size).toBe(icons.length);
  });

  it("contains the expected alias count", () => {
    expect(icons.reduce((total, icon) => total + icon.aliases.length, 0)).toBe(18);
  });

  it("uses private-use codepoints when present", () => {
    for (const icon of icons) {
      if (icon.codepoint === undefined) continue;
      expect(icon.codepoint).toBeGreaterThanOrEqual(0xe000);
      expect(icon.codepoint).toBeLessThanOrEqual(0xf8ff);
    }
  });
});

describe("lookup helpers", () => {
  it("finds icons by canonical name", () => {
    expect(findIcon("heart")?.pascalName).toBe("Heart");
  });

  it("finds icons by PascalCase name", () => {
    expect(findIcon("Heart")?.name).toBe("heart");
  });

  it("finds icons by id", () => {
    expect(findIcon("phosphor:heart")?.pascalName).toBe("Heart");
  });

  it("resolves aliases to the canonical icon", () => {
    expect(findIcon("activity")?.name).toBe("pulse");
    expect(findIcon("caduceus")?.name).toBe("asclepius");
  });

  it("returns undefined for unknown icons", () => {
    expect(findIcon("definitely-not-an-icon")).toBeUndefined();
  });

  it("searches names, aliases, tags, and categories", () => {
    expect(searchIcons("favorite").length).toBeGreaterThan(0);
    expect(searchIcons("activity").some((icon) => icon.name === "pulse")).toBe(true);
    expect(searchIcons("health & wellness").length).toBeGreaterThan(0);
    expect(searchIcons("")).toHaveLength(icons.length);
  });
});
