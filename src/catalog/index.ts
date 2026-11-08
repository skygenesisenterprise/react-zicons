export { PHOSPHOR_SOURCE, catalog, icons, sources } from "./catalog.generated.js";
export type {
  IconCatalog,
  IconDefinition,
  IconSource,
} from "./types.js";

import { catalog } from "./catalog.generated.js";
import type { IconDefinition } from "./types.js";

/** Finds an icon by canonical name, alias, id, or PascalCase name. */
export function findIcon(identifier: string): IconDefinition | undefined {
  const normalized = identifier.trim().toLowerCase();

  return catalog.icons.find(
    (icon) =>
      icon.name === normalized ||
      icon.id.toLowerCase() === normalized ||
      icon.pascalName.toLowerCase() === normalized ||
      icon.aliases.includes(normalized),
  );
}

/** Searches names, aliases, tags, and categories. */
export function searchIcons(query: string): readonly IconDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return catalog.icons;

  return catalog.icons.filter((icon) => {
    const haystack = [
      icon.name,
      icon.pascalName,
      ...icon.aliases,
      ...icon.categories,
      ...icon.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
