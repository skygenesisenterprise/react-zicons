import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

import { buildCatalog } from "./lib/catalog.js";
import { GENERATED_HEADER, ICON_TYPES_PATH } from "./lib/config.js";
import { writeGeneratedFile } from "./lib/fs.js";

export async function generateTypes(): Promise<void> {
  const { catalog } = await buildCatalog();
  const names = new Set<string>();

  for (const icon of catalog.icons) {
    names.add(icon.pascalName);
    for (const alias of icon.aliasPascalNames) names.add(alias);
  }

  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  const union = sorted.map((name) => `  | "${name}"`).join("\n");

  const contents = `${GENERATED_HEADER}
/** All canonical and alias icon base names. */
export type IconName =
${union};

/** All generated component names, including the \`Icon\` suffix. */
export type IconComponentName = \`\${IconName}Icon\`;
`;

  writeGeneratedFile(ICON_TYPES_PATH, contents);
  console.log(`Generated types for ${sorted.length} icon names.`);
}

function isEntrypoint(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return pathToFileURL(resolve(entry)).href === import.meta.url;
}

if (isEntrypoint()) {
  generateTypes().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
