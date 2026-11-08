import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PHOSPHOR_ASSETS_DIR,
  PHOSPHOR_METADATA_DIR,
  PHOSPHOR_UPSTREAM_PATH,
  VENDOR_PHOSPHOR_DIR,
} from "./lib/config.js";
import type { PhosphorUpstream } from "./lib/config.js";
import { readJsonFile } from "./lib/fs.js";

interface PackageJson {
  version?: string;
}

function runGit(args: readonly string[], cwd: string): void {
  const result = spawnSync("git", args, { cwd, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

function captureGit(args: readonly string[], cwd: string): string {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

function readArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function main(): Promise<void> {
  const current = readJsonFile<PhosphorUpstream>(PHOSPHOR_UPSTREAM_PATH);
  const repository = readArgument("--repo") ?? current.repository;
  const ref = readArgument("--ref") ?? current.commit;
  const temporary = mkdtempSync(join(tmpdir(), "react-zicons-sync-"));

  console.log(`Cloning ${repository} at ${ref}...`);

  try {
    runGit(["init", "--quiet"], temporary);
    runGit(["remote", "add", "origin", repository], temporary);

    const shallow = spawnSync(
      "git",
      ["fetch", "--depth", "1", "origin", ref],
      { cwd: temporary, stdio: "inherit" },
    );
    if (shallow.status !== 0) {
      console.log("Shallow fetch failed; retrying with a full fetch...");
      runGit(["fetch", "origin", ref], temporary);
    }

    runGit(["-c", "advice.detachedHead=false", "checkout", "FETCH_HEAD"], temporary);

    const commit = captureGit(["rev-parse", "HEAD"], temporary);
    const packageJson = readJsonFile<PackageJson>(join(temporary, "package.json"));
    if (!packageJson.version) {
      throw new Error("Upstream package.json does not declare a version");
    }

    console.log(`Syncing ${repository} at commit ${commit} (v${packageJson.version})...`);

    rmSync(PHOSPHOR_ASSETS_DIR, { recursive: true, force: true });
    cpSync(join(temporary, "assets"), PHOSPHOR_ASSETS_DIR, { recursive: true });

    rmSync(PHOSPHOR_METADATA_DIR, { recursive: true, force: true });
    cpSync(join(temporary, "src", "icons.ts"), join(PHOSPHOR_METADATA_DIR, "icons.ts"));
    cpSync(join(temporary, "src", "types.ts"), join(PHOSPHOR_METADATA_DIR, "types.ts"));
    cpSync(join(temporary, "LICENSE"), join(VENDOR_PHOSPHOR_DIR, "LICENSE"));

    const next: PhosphorUpstream = {
      ...current,
      repository,
      version: packageJson.version,
      commit,
      ref,
      weights: current.weights,
      viewBox: current.viewBox,
    };

    writeFileSync(PHOSPHOR_UPSTREAM_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    console.log(`Synced vendor/phosphor to ${commit}. Run \`pnpm assets:validate\` next.`);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
