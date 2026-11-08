import type { IconWeight } from "../core/types.js";

/** Identity of an icon family. Additional families can use new ids. */
export interface IconSource {
  readonly id: string;
  readonly name: string;
  readonly repository: string;
  readonly website?: string | undefined;
  readonly version: string;
  readonly commit: string;
  readonly license: string;
  readonly copyright: string;
}

/** A fully described icon in the generated catalog. */
export interface IconDefinition {
  /** Stable cross-source identifier, for example `phosphor:heart`. */
  readonly id: string;
  /** Canonical kebab-case name. */
  readonly name: string;
  /** Canonical PascalCase name used by generated components. */
  readonly pascalName: string;
  /** Canonical kebab-case identifier. */
  readonly kebabName: string;
  /** Alternative kebab-case names. */
  readonly aliases: readonly string[];
  /** PascalCase forms of {@link aliases}. */
  readonly aliasPascalNames: readonly string[];
  /** Source categories. Values are source-specific strings. */
  readonly categories: readonly string[];
  /** Search tags. Values are source-specific strings. */
  readonly tags: readonly string[];
  /** Weights available for this icon. */
  readonly weights: readonly IconWeight[];
  /** Icon family metadata. */
  readonly source: IconSource;
  /** Upstream package version. */
  readonly sourceVersion: string;
  /** Upstream commit used for synchronization. */
  readonly sourceCommit: string;
  /** Source view box. */
  readonly viewBox: string;
  /** Unicode private-use codepoint when the source provides one. */
  readonly codepoint: number | undefined;
  /** Source publication version. */
  readonly publishedIn: number | undefined;
  /** Source last-update version. */
  readonly updatedIn: number | undefined;
}

export interface IconCatalog {
  readonly schemaVersion: 1;
  readonly sources: readonly IconSource[];
  readonly icons: readonly IconDefinition[];
}
