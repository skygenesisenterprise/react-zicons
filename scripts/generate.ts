import { generateCatalog } from "./generate-catalog.js";
import { generateExports } from "./generate-exports.js";
import { generateIcons } from "./generate-icons.js";
import { generateTypes } from "./generate-types.js";

async function main(): Promise<void> {
  const startedAt = Date.now();

  await generateCatalog();
  await generateIcons();
  await generateExports();
  await generateTypes();

  console.log(`Generation completed in ${Date.now() - startedAt}ms.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
