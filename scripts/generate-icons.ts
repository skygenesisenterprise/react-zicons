import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

import type { IconDefinition } from "../src/catalog/types.js";
import type { IconPath, IconWeight } from "../src/core/types.js";
import type { WeightAssets } from "./lib/assets.js";
import { buildCatalog } from "./lib/catalog.js";
import {
  GENERATED_HEADER,
  GENERATED_ICONS_DIR,
  GENERATED_SSR_DIR,
  ICON_WEIGHTS,
} from "./lib/config.js";
import { quote, resetDirectory, writeGeneratedFile } from "./lib/fs.js";

function renderPath(path: IconPath): string {
  if (path.opacity === undefined) {
    return `      { d: ${quote(path.d)} },`;
  }
  return `      { d: ${quote(path.d)}, opacity: ${String(path.opacity)} },`;
}

function renderWeights(assets: WeightAssets): string {
  const weightBlocks = ICON_WEIGHTS.map((weight: IconWeight) => {
    const paths = assets[weight].paths.map(renderPath).join("\n");
    return `    ${weight}: [\n${paths}\n    ],`;
  });

  return `const weights: IconWeights = {
  viewBox: ${quote(assets.regular.viewBox)},
  paths: {
${weightBlocks.join("\n")}
  },
};`;
}

function renderClientIcon(icon: IconDefinition, assets: WeightAssets): string {
  return `${GENERATED_HEADER}
"use client";

import * as React from "react";

import { IconBase } from "../../core/IconBase.js";
import type { Icon, IconWeights } from "../../core/types.js";

${renderWeights(assets)}

export const ${icon.pascalName}Icon: Icon = React.forwardRef(function ${icon.pascalName}Icon(
  props,
  ref,
) {
  return <IconBase ref={ref} {...props} weights={weights} />;
});

${icon.pascalName}Icon.displayName = "${icon.pascalName}Icon";

/** @deprecated Use {@link ${icon.pascalName}Icon}. */
export const ${icon.pascalName} = ${icon.pascalName}Icon;
export default ${icon.pascalName}Icon;
`;
}

function renderSsrIcon(icon: IconDefinition, assets: WeightAssets): string {
  return `${GENERATED_HEADER}
import { SSRBase } from "../../core/SSRBase.js";
import type { SSRIcon, IconWeights } from "../../core/types.js";

${renderWeights(assets)}

export const ${icon.pascalName}Icon: SSRIcon = (props) => (
  <SSRBase {...props} weights={weights} />
);

${icon.pascalName}Icon.displayName = "${icon.pascalName}Icon";

/** @deprecated Use {@link ${icon.pascalName}Icon}. */
export const ${icon.pascalName} = ${icon.pascalName}Icon;
export default ${icon.pascalName}Icon;
`;
}

function renderClientAlias(alias: string, target: string): string {
  return `${GENERATED_HEADER}
export {
  ${target} as ${alias},
  ${target}Icon as ${alias}Icon,
  ${target}Icon as default,
} from "./${target}.js";
`;
}

function renderSsrAlias(alias: string, target: string): string {
  return `${GENERATED_HEADER}
export {
  ${target} as ${alias},
  ${target}Icon as ${alias}Icon,
  ${target}Icon as default,
} from "./${target}.js";
`;
}

export async function generateIcons(): Promise<void> {
  const { catalog, assets } = await buildCatalog();

  resetDirectory(GENERATED_ICONS_DIR);
  resetDirectory(GENERATED_SSR_DIR);

  let generated = 0;
  let aliases = 0;

  for (const icon of catalog.icons) {
    const weightAssets = assets.icons.get(icon.name);
    if (!weightAssets) {
      throw new Error(`Missing assets for "${icon.name}"`);
    }

    writeGeneratedFile(
      join(GENERATED_ICONS_DIR, `${icon.pascalName}.tsx`),
      renderClientIcon(icon, weightAssets),
    );
    writeGeneratedFile(
      join(GENERATED_SSR_DIR, `${icon.pascalName}.tsx`),
      renderSsrIcon(icon, weightAssets),
    );
    generated += 1;

    icon.aliasPascalNames.forEach((alias) => {
      writeGeneratedFile(
        join(GENERATED_ICONS_DIR, `${alias}.tsx`),
        renderClientAlias(alias, icon.pascalName),
      );
      writeGeneratedFile(
        join(GENERATED_SSR_DIR, `${alias}.tsx`),
        renderSsrAlias(alias, icon.pascalName),
      );
      aliases += 1;
    });
  }

  console.log(
    `Generated ${generated} client icons, ${generated} SSR icons, and ${aliases} aliases.`,
  );
}

function isEntrypoint(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return pathToFileURL(resolve(entry)).href === import.meta.url;
}

if (isEntrypoint()) {
  generateIcons().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
