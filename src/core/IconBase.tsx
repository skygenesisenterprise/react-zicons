"use client";

import * as React from "react";

import { IconContext } from "./context.js";
import type { IconBaseProps } from "./types.js";
import {
  renderIconPaths,
  resolveIconConfig,
  resolveMirroredStyle,
} from "./utils.js";

/**
 * Client icon renderer. It supports React context, forwarded refs, custom SVG
 * children, and every weight present in the supplied weight data.
 */
export const IconBase = React.forwardRef<SVGSVGElement, IconBaseProps>(
  function IconBase(props, ref) {
    const { alt, children, weights, style, color, size, weight, mirrored, ...restProps } = props;
    const context = React.useContext(IconContext);
    const config = resolveIconConfig({ color, size, weight, mirrored }, context);

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={weights.viewBox}
        width={config.size}
        height={config.size}
        fill={config.color}
        role={alt ? "img" : undefined}
        aria-hidden={alt ? undefined : true}
        focusable={alt ? undefined : "false"}
        style={resolveMirroredStyle(config.mirrored, style)}
        {...restProps}
      >
        {alt ? <title>{alt}</title> : null}
        {children}
        {renderIconPaths(weights, config.weight)}
      </svg>
    );
  },
);

IconBase.displayName = "IconBase";
