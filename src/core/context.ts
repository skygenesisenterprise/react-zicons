import { createContext } from "react";

import type { ZIconContextValue } from "./types.js";
import { DEFAULT_ICON_CONTEXT } from "./utils.js";

/** Internal context backing {@link ZIconProvider}. */
export const IconContext = createContext<ZIconContextValue>(DEFAULT_ICON_CONTEXT);

IconContext.displayName = "ZIconContext";
