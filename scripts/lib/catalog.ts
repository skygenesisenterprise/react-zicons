import type { IconWeight } from "../../src/core/types.js";
import type {
  IconCatalog,
  IconDefinition,
  IconSource,
} from "../../src/catalog/types.js";
import { assertKnownViewBoxes, loadPhosphorAssets } from "./assets.js";
import type { PhosphorAssets } from "./assets.js";
import {
  ICON_WEIGHTS,
  PHOSPHOR_UPSTREAM_PATH,
} from "./config.js";
import { readJsonFile } from "./fs.js";
import type { PhosphorUpstream } from "./config.js";
import { kebabToPascal, loadUpstreamMetadata } from "./metadata.js";

const PUA_START = 0x0e000;
const PUA_END = 0x0f8ff;

export interface PhosphorCatalogResult {
  readonly catalog: IconCatalog;
  readonly assets: PhosphorAssets;
  readonly upstream: PhosphorUpstream;
}

function assertStringArray(
  values: readonly string[],
  label: string,
  issues: string[],
): void {
  if (!Array.isArray(values)) {
    issues.push(`${label} is not an array`);
    return;
  }
  for (const value of values) {
    if (typeof value !== "string" || value.trim() === "") {
      issues.push(`${label} contains an invalid value`);
    }
  }
}

export async function buildCatalog(): Promise<PhosphorCatalogResult> {
  const upstream = readJsonFile<PhosphorUpstream>(PHOSPHOR_UPSTREAM_PATH);
  if (!upstream.commit || !upstream.version) {
    throw new Error("vendor/phosphor/upstream.json must record a version and commit");
  }

  const assets = loadPhosphorAssets();
  assertKnownViewBoxes(assets, upstream.viewBox);
  const metadata = await loadUpstreamMetadata();

  const issues: string[] = [];
  const metadataByName = new Map(metadata.map((icon) => [icon.name, icon]));

  for (const name of metadataByName.keys()) {
    if (!assets.icons.has(name)) {
      issues.push(`Metadata entry "${name}" has no SVG assets`);
    }
  }
  for (const name of assets.icons.keys()) {
    if (!metadataByName.has(name)) {
      issues.push(`SVG assets for "${name}" have no metadata entry`);
    }
  }

  const names = new Set<string>();
  const pascalNames = new Set<string>();

  for (const icon of metadata) {
    if (names.has(icon.name)) {
      issues.push(`Duplicate icon name "${icon.name}"`);
    }
    names.add(icon.name);
    if (pascalNames.has(icon.pascal_name)) {
      issues.push(`Duplicate PascalCase icon name "${icon.pascal_name}"`);
    }
    pascalNames.add(icon.pascal_name);
  }

  const aliases = new Map<string, string>();
  const aliasPascalNames = new Map<string, string>();

  for (const icon of metadata) {
    if (!icon.alias) continue;

    if (names.has(icon.alias.name)) {
      issues.push(
        `Alias "${icon.alias.name}" for "${icon.name}" collides with a canonical icon name`,
      );
    }
    if (aliases.has(icon.alias.name)) {
      issues.push(
        `Alias "${icon.alias.name}" is declared by both "${aliases.get(icon.alias.name)}" and "${icon.name}"`,
      );
    }
    aliases.set(icon.alias.name, icon.name);

    if (pascalNames.has(icon.alias.pascal_name)) {
      issues.push(
        `Alias "${icon.alias.pascal_name}" for "${icon.name}" collides with a canonical PascalCase name`,
      );
    }
    if (aliasPascalNames.has(icon.alias.pascal_name)) {
      issues.push(
        `Alias "${icon.alias.pascal_name}" is declared by both "${aliasPascalNames.get(icon.alias.pascal_name)}" and "${icon.name}"`,
      );
    }
    aliasPascalNames.set(icon.alias.pascal_name, icon.name);
  }

  const source: IconSource = {
    id: upstream.id,
    name: upstream.name,
    repository: upstream.repository,
    website: upstream.website,
    version: upstream.version,
    commit: upstream.commit,
    license: upstream.license,
    copyright: upstream.copyright,
  };

  const definitions: IconDefinition[] = [];

  for (const icon of metadata) {
    const weightAssets = assets.icons.get(icon.name);
    if (!weightAssets) continue;

    assertStringArray(icon.categories, `Categories for "${icon.name}"`, issues);
    assertStringArray(icon.tags, `Tags for "${icon.name}"`, issues);

    if (
      typeof icon.codepoint !== "number" ||
      icon.codepoint < PUA_START ||
      icon.codepoint > PUA_END
    ) {
      issues.push(`Icon "${icon.name}" has an invalid private-use codepoint`);
    }

    const aliasNames = icon.alias ? [icon.alias.name] : [];
    const aliasPascals = icon.alias ? [icon.alias.pascal_name] : [];
    const regularAsset = weightAssets.regular;

    definitions.push({
      id: `${upstream.id}:${icon.name}`,
      name: icon.name,
      pascalName: icon.pascal_name,
      kebabName: icon.name,
      aliases: aliasNames,
      aliasPascalNames: aliasPascals,
      categories: [...icon.categories],
      tags: [...icon.tags],
      weights: ICON_WEIGHTS as readonly IconWeight[],
      source,
      sourceVersion: upstream.version,
      sourceCommit: upstream.commit,
      viewBox: regularAsset.viewBox,
      codepoint: icon.codepoint,
      publishedIn: icon.published_in,
      updatedIn: icon.updated_in,
    });
  }

  if (issues.length > 0) {
    throw new Error(`Catalog validation failed:\n- ${issues.join("\n- ")}`);
  }

  const catalog: IconCatalog = {
    schemaVersion: 1,
    sources: [source],
    icons: definitions,
  };

  return { catalog, assets, upstream };
}

export { kebabToPascal };
