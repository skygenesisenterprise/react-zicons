import { createElement } from "react";
import type { ReactElement } from "react";

import type {
  IconPath,
  IconProps,
  IconWeight,
  IconWeights,
  ZIconContextValue,
} from "./types.js";

export const DEFAULT_ICON_COLOR = "currentColor";
export const DEFAULT_ICON_SIZE = "1em";
export const DEFAULT_ICON_WEIGHT: IconWeight = "regular";
export const DEFAULT_ICON_MIRRORED = false;

export const DEFAULT_ICON_CONTEXT = Object.freeze({
  color: DEFAULT_ICON_COLOR,
  size: DEFAULT_ICON_SIZE,
  weight: DEFAULT_ICON_WEIGHT,
  mirrored: DEFAULT_ICON_MIRRORED,
} satisfies ZIconContextValue);

export interface ResolvedIconConfig {
  readonly color: string;
  readonly size: number | string;
  readonly weight: IconWeight;
  readonly mirrored: boolean;
}

/**
 * Resolves icon configuration using the documented precedence:
 * explicit icon props, then nearest provider value, then library defaults.
 */
export function resolveIconConfig(
  props: Pick<IconProps, "color" | "size" | "weight" | "mirrored">,
  context: ZIconContextValue = DEFAULT_ICON_CONTEXT,
): ResolvedIconConfig {
  return {
    color: props.color ?? context.color ?? DEFAULT_ICON_COLOR,
    size: props.size ?? context.size ?? DEFAULT_ICON_SIZE,
    weight: props.weight ?? context.weight ?? DEFAULT_ICON_WEIGHT,
    mirrored: props.mirrored ?? context.mirrored ?? DEFAULT_ICON_MIRRORED,
  };
}

/**
 * Merges a provider value with its parent provider value. Keys that are
 * explicitly `undefined` do not override the parent.
 */
export function mergeIconContext(
  parent: ZIconContextValue,
  value?: ZIconContextValue | undefined,
): ZIconContextValue {
  if (!value) return parent;

  const { color, size, weight, mirrored } = value;

  return {
    ...parent,
    ...(color !== undefined ? { color } : {}),
    ...(size !== undefined ? { size } : {}),
    ...(weight !== undefined ? { weight } : {}),
    ...(mirrored !== undefined ? { mirrored } : {}),
  };
}

/** Renders the path data for one weight as React elements. */
export function renderIconPaths(
  weights: IconWeights,
  weight: IconWeight,
): ReactElement[] {
  return weights.paths[weight].map((path: IconPath, index: number) => {
    const attributes: { d: string; opacity?: number } = { d: path.d };
    if (path.opacity !== undefined) attributes.opacity = path.opacity;
    return createElement("path", { key: index, ...attributes });
  });
}

/** Computes the mirrored transform style while preserving caller styles. */
export function resolveMirroredStyle(
  mirrored: boolean,
  style: React.CSSProperties | undefined,
): React.CSSProperties | undefined {
  if (!mirrored) return style;

  return {
    ...style,
    transform: "scaleX(-1)",
    transformOrigin: style?.transformOrigin ?? "center",
  };
}
