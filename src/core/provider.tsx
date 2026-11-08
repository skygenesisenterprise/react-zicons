"use client";

import * as React from "react";

import { IconContext } from "./context.js";
import type { ZIconContextValue } from "./types.js";
import { mergeIconContext } from "./utils.js";

export interface ZIconProviderProps {
  value?: ZIconContextValue | undefined;
  children?: React.ReactNode;
}

/**
 * Optional provider for icon defaults. Nested providers inherit keys from
 * their parent and override only the keys present in `value`.
 */
export const ZIconProvider: React.FunctionComponent<ZIconProviderProps> = ({
  value,
  children,
}) => {
  const parent = React.useContext(IconContext);

  return (
    <IconContext.Provider value={mergeIconContext(parent, value)}>
      {children}
    </IconContext.Provider>
  );
};

ZIconProvider.displayName = "ZIconProvider";
