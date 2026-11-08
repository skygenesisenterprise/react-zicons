import { createRequire } from "node:module";
import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { DIST_DIR, ROOT } from "./lib/config.js";

const require = createRequire(import.meta.url);

function directorySize(path: string): number {
  let total = 0;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) total += directorySize(child);
    else if (entry.isFile()) total += statSync(child).size;
  }
  return total;
}

function countFiles(path: string, extension: string): number {
  let total = 0;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) total += countFiles(child, extension);
    else if (entry.isFile() && entry.name.endsWith(extension)) total += 1;
  }
  return total;
}

function main(): void {
  for (const generated of [
    "src/catalog/catalog.generated.ts",
    "src/index.ts",
    "src/ssr/index.ts",
    "src/icons/generated/types.ts",
  ]) {
    if (!existsSync(join(ROOT, generated))) {
      throw new Error(
        `Missing generated file ${generated}. Run \`pnpm generate\` before building.`,
      );
    }
  }

  rmSync(DIST_DIR, { recursive: true, force: true });

  const tsc = require.resolve("typescript/bin/tsc");
  const result = spawnSync(
    process.execPath,
    [tsc, "-p", join(ROOT, "tsconfig.build.json")],
    { cwd: ROOT, stdio: "inherit" },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`TypeScript build failed with exit code ${result.status}`);
  }

  for (const entry of ["index.js", "index.d.ts", "ssr/index.js", "catalog/index.js"]) {
    if (!existsSync(join(DIST_DIR, entry))) {
      throw new Error(`Build did not emit dist/${entry}`);
    }
  }

  const jsFiles = countFiles(DIST_DIR, ".js");
  const declarationFiles = countFiles(DIST_DIR, ".d.ts");
  const bytes = directorySize(DIST_DIR);

  console.log(
    `Built ${jsFiles} JavaScript modules and ${declarationFiles} declaration files (${(bytes / 1024 / 1024).toFixed(2)} MiB).`,
  );
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
