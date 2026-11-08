import { rmSync } from "node:fs";
import { join } from "node:path";

import { ROOT } from "./lib/config.js";

for (const target of [
  "dist",
  "coverage",
  "tests/fixtures/next-app/.next",
  "tests/fixtures/next-app/out",
]) {
  rmSync(join(ROOT, target), { recursive: true, force: true });
}

console.log("Removed build, coverage, and fixture output directories.");
