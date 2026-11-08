import { buildCatalog } from "./lib/catalog.js";
import { ICON_WEIGHTS } from "./lib/config.js";

async function main(): Promise<void> {
  const { catalog, assets, upstream } = await buildCatalog();
  const aliasCount = catalog.icons.reduce(
    (total, icon) => total + icon.aliases.length,
    0,
  );

  console.log(
    [
      `Validated Phosphor Icons Core ${upstream.version} (${upstream.commit}).`,
      `${assets.fileCount} SVG files, ${ICON_WEIGHTS.length} weights, ${catalog.icons.length} icons, ${aliasCount} aliases.`,
      "All icons have complete weights, valid SVG documents, consistent viewBox values, and valid metadata.",
    ].join("\n"),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
