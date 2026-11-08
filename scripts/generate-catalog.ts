import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

import type { IconDefinition } from "../src/catalog/types.js";
import { buildCatalog } from "./lib/catalog.js";
import { CATALOG_PATH, GENERATED_HEADER } from "./lib/config.js";
import { quote, writeGeneratedFile } from "./lib/fs.js";

function renderSource(): string {
  return `export const PHOSPHOR_SOURCE = {
  id: "phosphor",
  name: "Phosphor Icons",
  repository: "https://github.com/phosphor-icons/core",
  website: "https://phosphoricons.com",
  version: "2.1.1",
  commit: "2b75f3ad12b420c9504ef05df8d2564a28f8500e",
  license: "MIT",
  copyright: "Copyright (c) 2023 Phosphor Icons",
} as const satisfies IconSource;`;
}

function renderDefinition(icon: IconDefinition): string {
  const lines = [
    "  {",
    `    id: ${quote(icon.id)},`,
    `    name: ${quote(icon.name)},`,
    `    pascalName: ${quote(icon.pascalName)},`,
    `    kebabName: ${quote(icon.kebabName)},`,
    `    aliases: ${JSON.stringify(icon.aliases)},`,
    `    aliasPascalNames: ${JSON.stringify(icon.aliasPascalNames)},`,
    `    categories: ${JSON.stringify(icon.categories)},`,
    `    tags: ${JSON.stringify(icon.tags)},`,
    "    weights: ICON_WEIGHTS,",
    "    source: PHOSPHOR_SOURCE,",
    `    sourceVersion: ${quote(icon.sourceVersion)},`,
    `    sourceCommit: ${quote(icon.sourceCommit)},`,
    `    viewBox: ${quote(icon.viewBox)},`,
    `    codepoint: ${icon.codepoint === undefined ? "undefined" : String(icon.codepoint)},`,
    `    publishedIn: ${icon.publishedIn === undefined ? "undefined" : String(icon.publishedIn)},`,
    `    updatedIn: ${icon.updatedIn === undefined ? "undefined" : String(icon.updatedIn)},`,
    "  },",
  ];

  return lines.join("\n");
}

export async function generateCatalog(): Promise<void> {
  const { catalog } = await buildCatalog();

  const contents = `${GENERATED_HEADER}
import type { IconCatalog, IconDefinition, IconSource } from "./types.js";
import { ICON_WEIGHTS } from "../core/types.js";

${renderSource()}

const catalogIcons: readonly IconDefinition[] = [
${catalog.icons.map(renderDefinition).join("\n")}
];

export const catalog: IconCatalog = {
  schemaVersion: 1,
  sources: [PHOSPHOR_SOURCE],
  icons: catalogIcons,
};

export const icons = catalog.icons;
export const sources = catalog.sources;
`;

  writeGeneratedFile(CATALOG_PATH, contents);
  console.log(`Generated catalog with ${catalog.icons.length} icons -> ${CATALOG_PATH}`);
}

function isEntrypoint(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return pathToFileURL(resolve(entry)).href === import.meta.url;
}

if (isEntrypoint()) {
  generateCatalog().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
