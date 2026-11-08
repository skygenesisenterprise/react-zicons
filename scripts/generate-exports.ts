import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

import { buildCatalog } from "./lib/catalog.js";
import {
  GENERATED_HEADER,
  ICONS_INDEX_PATH,
  ROOT_INDEX_PATH,
  SSR_GENERATED_INDEX_PATH,
  SSR_INDEX_PATH,
} from "./lib/config.js";
import { writeGeneratedFile } from "./lib/fs.js";

interface ExportModule {
  readonly pascal: string;
  readonly path: string;
}

function collectModules(
  icons: readonly {
    readonly pascalName: string;
    readonly aliasPascalNames: readonly string[];
  }[],
): readonly ExportModule[] {
  const modules: ExportModule[] = [];

  for (const icon of icons) {
    modules.push({ pascal: icon.pascalName, path: icon.pascalName });
    for (const alias of icon.aliasPascalNames) {
      modules.push({ pascal: alias, path: alias });
    }
  }

  return modules.sort((a, b) => a.pascal.localeCompare(b.pascal));
}

function renderIconExports(
  modules: readonly ExportModule[],
  directory: string,
): string {
  return modules
    .map(
      (module) =>
        `export { ${module.pascal}, ${module.pascal}Icon } from "./${directory}${module.path}.js";`,
    )
    .join("\n");
}

function renderRootExports(modules: readonly ExportModule[]): string {
  return modules
    .map(
      (module) =>
        `export { ${module.pascal}, ${module.pascal}Icon } from "./icons/generated/${module.path}.js";`,
    )
    .join("\n");
}

function renderSsrRootExports(modules: readonly ExportModule[]): string {
  return modules
    .map(
      (module) =>
        `export { ${module.pascal}, ${module.pascal}Icon } from "./generated/${module.path}.js";`,
    )
    .join("\n");
}

export async function generateExports(): Promise<void> {
  const { catalog } = await buildCatalog();
  const modules = collectModules(catalog.icons);

  const iconsIndex = `${GENERATED_HEADER}
export type { IconName, IconComponentName } from "./types.js";
${renderIconExports(modules, "")}
`;

  const rootIndex = `${GENERATED_HEADER}
"use client";

export * from "./core/index.js";
export type { IconName, IconComponentName } from "./icons/generated/types.js";

${renderRootExports(modules)}
`;

  const ssrGeneratedIndex = `${GENERATED_HEADER}
${renderIconExports(modules, "")}
`;

  const ssrIndex = `${GENERATED_HEADER.replace("/* eslint-disable */\n", "")}
export { SSRBase } from "../core/SSRBase.js";
export type {
  Icon,
  IconProps,
  IconWeight,
  IconWeights,
  SSRIcon,
  SSRBaseProps,
  ZIconContextValue,
} from "../core/types.js";
export { ICON_WEIGHTS } from "../core/types.js";
export {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_CONTEXT,
  DEFAULT_ICON_MIRRORED,
  DEFAULT_ICON_SIZE,
  DEFAULT_ICON_WEIGHT,
  renderIconPaths,
  resolveIconConfig,
  resolveMirroredStyle,
} from "../core/utils.js";
export type { IconName, IconComponentName } from "../icons/generated/types.js";

${renderSsrRootExports(modules)}
`;

  writeGeneratedFile(ICONS_INDEX_PATH, iconsIndex);
  writeGeneratedFile(ROOT_INDEX_PATH, rootIndex);
  writeGeneratedFile(SSR_GENERATED_INDEX_PATH, ssrGeneratedIndex);
  writeGeneratedFile(SSR_INDEX_PATH, ssrIndex);

  console.log(`Generated entry points for ${modules.length} component modules.`);
}

function isEntrypoint(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return pathToFileURL(resolve(entry)).href === import.meta.url;
}

if (isEntrypoint()) {
  generateExports().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
