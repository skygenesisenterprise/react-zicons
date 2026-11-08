import type * as React from "react";

import type { SSRBaseProps } from "./types.js";
import {
  renderIconPaths,
  resolveIconConfig,
  resolveMirroredStyle,
} from "./utils.js";

/**
 * Server renderer. It deliberately does not use React context or refs so that
 * it can be rendered from React Server Components without a client boundary.
 */
export const SSRBase: React.FunctionComponent<SSRBaseProps> = (props) => {
  const { alt, children, weights, style, color, size, weight, mirrored, ...restProps } = props;
  const config = resolveIconConfig({ color, size, weight, mirrored });

  return (
    <svg
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
};

SSRBase.displayName = "SSRBase";
