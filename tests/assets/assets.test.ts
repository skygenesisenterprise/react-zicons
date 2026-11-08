import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildCatalog } from "../../scripts/lib/catalog.js";
import { GENERATED_ICONS_DIR, ROOT } from "../../scripts/lib/config.js";

describe("vendored Phosphor assets", () => {
  it("match the pinned upstream revision and asset count", async () => {
    const { assets, catalog, upstream } = await buildCatalog();

    expect(upstream.version).toBe("2.1.1");
    expect(upstream.commit).toBe("2b75f3ad12b420c9504ef05df8d2564a28f8500e");
    expect(catalog.icons).toHaveLength(1512);
    expect(assets.fileCount).toBe(9072);
  });

  it("read the upstream license and provenance files", () => {
    const license = readFileSync(join(ROOT, "vendor", "phosphor", "LICENSE"), "utf8");
    const notice = readFileSync(join(ROOT, "NOTICE"), "utf8");

    expect(license).toContain("MIT License");
    expect(license).toContain("Phosphor Icons");
    expect(notice).toContain("Phosphor Icons");
    expect(notice).toContain("2b75f3ad12b420c9504ef05df8d2564a28f8500e");
  });

  it("has parsed SVG data for every icon and weight", async () => {
    const { assets, catalog } = await buildCatalog();

    for (const icon of catalog.icons) {
      const weights = assets.icons.get(icon.name);
      expect(weights).toBeDefined();
      for (const weight of icon.weights) {
        expect(weights?.[weight].paths.length).toBeGreaterThan(0);
      }
    }
  });

  it("generates one client module per canonical icon", async () => {
    const { catalog } = await buildCatalog();
    const fs = await import("node:fs/promises");
    const entries = await fs.readdir(GENERATED_ICONS_DIR);

    expect(entries.filter((entry) => entry.endsWith(".tsx"))).toHaveLength(
      catalog.icons.length + catalog.icons.reduce((total, icon) => total + icon.aliases.length, 0),
    );
  });
});
