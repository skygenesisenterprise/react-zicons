import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { IconWeight } from "../../src/core/types.js";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const VENDOR_PHOSPHOR_DIR = join(ROOT, "vendor", "phosphor");
export const PHOSPHOR_ASSETS_DIR = join(VENDOR_PHOSPHOR_DIR, "assets");
export const PHOSPHOR_METADATA_DIR = join(VENDOR_PHOSPHOR_DIR, "metadata");
export const PHOSPHOR_UPSTREAM_PATH = join(VENDOR_PHOSPHOR_DIR, "upstream.json");

export const SRC_DIR = join(ROOT, "src");
export const GENERATED_ICONS_DIR = join(SRC_DIR, "icons", "generated");
export const GENERATED_SSR_DIR = join(SRC_DIR, "ssr", "generated");
export const CATALOG_PATH = join(SRC_DIR, "catalog", "catalog.generated.ts");
export const ICON_TYPES_PATH = join(GENERATED_ICONS_DIR, "types.ts");
export const ROOT_INDEX_PATH = join(SRC_DIR, "index.ts");
export const ICONS_INDEX_PATH = join(GENERATED_ICONS_DIR, "index.ts");
export const SSR_INDEX_PATH = join(SRC_DIR, "ssr", "index.ts");
export const SSR_GENERATED_INDEX_PATH = join(GENERATED_SSR_DIR, "index.ts");

export const DIST_DIR = join(ROOT, "dist");

export const ICON_WEIGHTS = [
  "thin",
  "light",
  "regular",
  "bold",
  "fill",
  "duotone",
] as const satisfies readonly IconWeight[];

export const GENERATED_HEADER = `/* eslint-disable */
/* GENERATED FILE - DO NOT EDIT.
 * Run \`pnpm generate\` to regenerate.
 * Source: Phosphor Icons Core 2.1.1 (2b75f3ad12b420c9504ef05df8d2564a28f8500e)
 */`;

export interface PhosphorUpstream {
  id: string;
  name: string;
  repository: string;
  version: string;
  commit: string;
  ref: string;
  license: string;
  copyright: string;
  website: string;
  weights: readonly IconWeight[];
  viewBox: string;
}
