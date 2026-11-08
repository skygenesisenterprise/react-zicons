import { pathToFileURL } from "node:url";
import { join } from "node:path";

import { PHOSPHOR_METADATA_DIR } from "./config.js";

export interface UpstreamIconMetadata {
  readonly name: string;
  readonly pascal_name: string;
  readonly alias?:
    | {
        readonly name: string;
        readonly pascal_name: string;
      }
    | undefined;
  readonly categories: readonly string[];
  readonly figma_category: string;
  readonly tags: readonly string[];
  readonly codepoint: number;
  readonly published_in: number;
  readonly updated_in: number;
}

interface UpstreamMetadataModule {
  readonly icons: readonly UpstreamIconMetadata[];
}

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function pascalize(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function kebabToPascal(value: string): string {
  return pascalize(value);
}

export async function loadUpstreamMetadata(
  metadataDirectory = PHOSPHOR_METADATA_DIR,
): Promise<readonly UpstreamIconMetadata[]> {
  const metadataUrl = pathToFileURL(join(metadataDirectory, "icons.ts")).href;
  const module = (await import(metadataUrl)) as UpstreamMetadataModule;

  if (!Array.isArray(module.icons)) {
    throw new Error("Upstream metadata does not export an icons array");
  }

  const issues: string[] = [];
  const seenNames = new Set<string>();
  const seenPascalNames = new Set<string>();

  for (const icon of module.icons) {
    if (!NAME_PATTERN.test(icon.name)) {
      issues.push(`Invalid upstream icon name "${icon.name}"`);
    }
    if (icon.pascal_name !== pascalize(icon.name)) {
      issues.push(
        `Upstream PascalCase mismatch for "${icon.name}": "${icon.pascal_name}"`,
      );
    }
    if (seenNames.has(icon.name)) {
      issues.push(`Duplicate upstream icon name "${icon.name}"`);
    }
    if (seenPascalNames.has(icon.pascal_name)) {
      issues.push(`Duplicate upstream PascalCase name "${icon.pascal_name}"`);
    }
    if (typeof icon.codepoint !== "number" || !Number.isInteger(icon.codepoint)) {
      issues.push(`Invalid codepoint for "${icon.name}"`);
    }
    if (!Array.isArray(icon.categories)) {
      issues.push(`Invalid categories for "${icon.name}"`);
    }
    if (!Array.isArray(icon.tags)) {
      issues.push(`Invalid tags for "${icon.name}"`);
    }
    if (
      typeof icon.published_in !== "number" ||
      typeof icon.updated_in !== "number" ||
      icon.published_in <= 0 ||
      icon.updated_in <= 0 ||
      icon.published_in > icon.updated_in
    ) {
      issues.push(`Invalid publication versions for "${icon.name}"`);
    }

    if (icon.alias) {
      if (!NAME_PATTERN.test(icon.alias.name)) {
        issues.push(
          `Invalid alias "${icon.alias.name}" for icon "${icon.name}"`,
        );
      }
      if (icon.alias.pascal_name !== pascalize(icon.alias.name)) {
        issues.push(
          `Alias PascalCase mismatch for "${icon.alias.name}": "${icon.alias.pascal_name}"`,
        );
      }
    }

    seenNames.add(icon.name);
    seenPascalNames.add(icon.pascal_name);
  }

  if (issues.length > 0) {
    throw new Error(`Metadata validation failed:\n- ${issues.join("\n- ")}`);
  }

  return [...module.icons].sort((a, b) => a.name.localeCompare(b.name));
}
