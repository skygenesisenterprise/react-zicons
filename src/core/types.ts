import type {
  ComponentPropsWithoutRef,
  ForwardRefExoticComponent,
  FunctionComponent,
  RefAttributes,
} from "react";

/**
 * The six icon weights supported by the bundled Phosphor source.
 *
 * Additional icon sources may expose different weight sets through their own
 * catalog entries, but the public React API for the bundled source uses this
 * union.
 */
export type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

/** Canonical weight order used by the generator and catalog. */
export const ICON_WEIGHTS: readonly IconWeight[] = [
  "thin",
  "light",
  "regular",
  "bold",
  "fill",
  "duotone",
] as const;

/** A single SVG `<path>` element in an icon weight. */
export interface IconPath {
  readonly d: string;
  readonly opacity?: number | undefined;
}

/** Renderable data for one icon, independent of any React context. */
export interface IconWeights {
  readonly viewBox: string;
  readonly paths: Readonly<Record<IconWeight, readonly IconPath[]>>;
}

/** Values that can be supplied by {@link ZIconProvider}. */
export interface ZIconContextValue {
  color?: string | undefined;
  size?: number | string | undefined;
  weight?: IconWeight | undefined;
  mirrored?: boolean | undefined;
}

/** Public properties accepted by every generated icon component. */
export interface IconProps extends Omit<ComponentPropsWithoutRef<"svg">, "color"> {
  /** Accessible label. When provided, a `<title>` element is rendered. */
  alt?: string | undefined;
  /** SVG fill color. Defaults to `currentColor`. */
  color?: string | undefined;
  /** Width and height. Defaults to `1em`. */
  size?: number | string | undefined;
  /** Icon weight. Defaults to `regular`. */
  weight?: IconWeight | undefined;
  /** Horizontally mirrors the icon. */
  mirrored?: boolean | undefined;
}

export interface IconBaseProps extends IconProps {
  readonly weights: IconWeights;
}

export type SSRBaseProps = IconBaseProps;

/** Type of a context-aware, ref-forwarding client icon component. */
export type Icon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

/** Type of a server-renderable icon component. Refs are not forwarded. */
export type SSRIcon = FunctionComponent<IconProps>;
