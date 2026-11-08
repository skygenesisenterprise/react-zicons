import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import type { IconWeight } from "../../src/core/types.js";
import { ICON_WEIGHTS, PHOSPHOR_ASSETS_DIR } from "./config.js";
import type { ParsedSvg } from "./svg.js";
import { parseSvg } from "./svg.js";

export type WeightAssets = Readonly<Record<IconWeight, ParsedSvg>>;

export interface PhosphorAssets {
  readonly icons: ReadonlyMap<string, WeightAssets>;
  readonly fileCount: number;
}

export class AssetValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Asset validation failed with ${issues.length} issue(s):\n- ${issues.join("\n- ")}`);
    this.name = "AssetValidationError";
    this.issues = issues;
  }
}

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function iconNameFromFile(filename: string, weight: IconWeight): string | null {
  if (!filename.endsWith(".svg")) return null;

  const base = filename.slice(0, -4);
  const suffix = `-${weight}`;
  if (weight !== "regular" && base.endsWith(suffix)) {
    return base.slice(0, -suffix.length);
  }

  if (base.endsWith("-regular")) {
    return base.slice(0, -"-regular".length);
  }

  return base;
}

export function loadPhosphorAssets(
  assetsDirectory = PHOSPHOR_ASSETS_DIR,
): PhosphorAssets {
  const issues: string[] = [];
  const expectedWeights = new Set<string>(ICON_WEIGHTS);
  const entries = readdirSync(assetsDirectory, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      issues.push(`Unexpected file in assets root: ${entry.name}`);
      continue;
    }
    if (!expectedWeights.has(entry.name)) {
      issues.push(`Unexpected weight directory: ${entry.name}`);
    }
  }

  const icons = new Map<string, Partial<Record<IconWeight, ParsedSvg>>>();
  let fileCount = 0;

  for (const weight of ICON_WEIGHTS) {
    const weightDirectory = join(assetsDirectory, weight);
    if (!statSync(weightDirectory, { throwIfNoEntry: false })?.isDirectory()) {
      issues.push(`Missing weight directory: ${weight}`);
      continue;
    }

    for (const entry of readdirSync(weightDirectory, { withFileTypes: true })) {
      if (!entry.isFile()) {
        issues.push(`Unexpected non-file entry in ${weight}: ${entry.name}`);
        continue;
      }

      const name = iconNameFromFile(entry.name, weight);
      if (name === null) {
        issues.push(`Unexpected non-SVG file in ${weight}: ${entry.name}`);
        continue;
      }
      if (!NAME_PATTERN.test(name)) {
        issues.push(`Invalid icon name "${name}" (${weight}/${entry.name})`);
        continue;
      }

      fileCount += 1;
      const context = `${weight}/${entry.name}`;

      try {
        const source = readFileSync(join(weightDirectory, entry.name), "utf8");
        const parsed = parseSvg(source, context);
        const existing = icons.get(name) ?? {};
        if (existing[weight]) {
          issues.push(`Duplicate ${weight} asset for "${name}"`);
        }
        existing[weight] = parsed;
        icons.set(name, existing);
      } catch (error) {
        issues.push(error instanceof Error ? error.message : String(error));
      }
    }
  }

  const complete = new Map<string, WeightAssets>();
  for (const [name, weights] of icons) {
    const missing = ICON_WEIGHTS.filter((weight) => !weights[weight]);
    if (missing.length > 0) {
      issues.push(`Icon "${name}" is missing weights: ${missing.join(", ")}`);
      continue;
    }

    const viewBoxes = new Set(
      ICON_WEIGHTS.map((weight) => {
        const asset = weights[weight];
        if (!asset) throw new Error(`unreachable: missing ${weight} for ${name}`);
        return asset.viewBox;
      }),
    );
    if (viewBoxes.size !== 1) {
      issues.push(`Icon "${name}" has inconsistent viewBox values: ${[...viewBoxes].join(", ")}`);
      continue;
    }

    complete.set(name, weights as WeightAssets);
  }

  if (issues.length > 0) throw new AssetValidationError(issues);

  return { icons: complete, fileCount };
}

export function assertKnownViewBoxes(
  assets: PhosphorAssets,
  expectedViewBox: string,
): void {
  const issues: string[] = [];

  for (const [name, weights] of assets.icons) {
    for (const weight of ICON_WEIGHTS) {
      const asset = weights[weight];
      if (asset.viewBox !== expectedViewBox) {
        issues.push(
          `Icon "${name}" (${weight}) uses viewBox "${asset.viewBox}", expected "${expectedViewBox}"`,
        );
      }
    }
  }

  if (issues.length > 0) throw new AssetValidationError(issues);
}
