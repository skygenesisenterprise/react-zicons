import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { GENERATED_ICONS_DIR, GENERATED_SSR_DIR, ROOT } from "../../scripts/lib/config.js";

function readGenerated(directory: string, name: string): string {
  return readFileSync(join(directory, name), "utf8");
}

describe("generated module invariants", () => {
  it("marks client icons as client components", () => {
    const source = readGenerated(GENERATED_ICONS_DIR, "Heart.tsx");

    expect(source).toContain('"use client"');
    expect(source).toContain("React.forwardRef");
    expect(source).toContain("IconBase");
    expect(source).toContain('viewBox: "0 0 256 256"');
  });

  it("keeps SSR icons free of the client directive and refs", () => {
    const source = readGenerated(GENERATED_SSR_DIR, "Heart.tsx");

    expect(source).not.toContain('"use client"');
    expect(source).not.toContain("forwardRef");
    expect(source).toContain("SSRBase");
  });

  it("re-exports canonical icons from alias modules", () => {
    const source = readGenerated(GENERATED_SSR_DIR, "Caduceus.tsx");

    expect(source).toContain("Asclepius");
    expect(source).toContain("Asclepius");
  });

  it("keeps the generated root entry pointed at the client modules", () => {
    const source = readFileSync(join(ROOT, "src", "index.ts"), "utf8");

    expect(source).toContain('"use client"');
    expect(source).toContain('export * from "./core/index.js"');
    expect(source).toContain('from "./icons/generated/Heart.js"');
  });

  it("keeps the SSR entry pointed at the server modules", () => {
    const source = readFileSync(join(ROOT, "src", "ssr", "index.ts"), "utf8");

    expect(source).not.toContain('"use client"');
    expect(source).toContain('from "./generated/Heart.js"');
  });

  it("includes the pinned source revision in generated headers", () => {
    const source = readGenerated(GENERATED_ICONS_DIR, "Heart.tsx");

    expect(source).toContain("Phosphor Icons Core 2.1.1");
    expect(source).toContain("2b75f3ad12b420c9504ef05df8d2564a28f8500e");
  });
});
