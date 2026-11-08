import { describe, expect, it } from "vitest";

import {
  DEFAULT_ICON_CONTEXT,
  mergeIconContext,
  resolveIconConfig,
  resolveMirroredStyle,
} from "../../src/core/utils.js";
import type { ZIconContextValue } from "../../src/core/types.js";

describe("resolveIconConfig", () => {
  it("uses library defaults when nothing is provided", () => {
    expect(resolveIconConfig({})).toEqual({
      color: "currentColor",
      size: "1em",
      weight: "regular",
      mirrored: false,
    });
  });

  it("prefers explicit props over provider values", () => {
    const context: ZIconContextValue = {
      color: "red",
      size: 32,
      weight: "bold",
      mirrored: true,
    };

    expect(
      resolveIconConfig(
        { color: "blue", size: 12, weight: "thin", mirrored: false },
        context,
      ),
    ).toEqual({
      color: "blue",
      size: 12,
      weight: "thin",
      mirrored: false,
    });
  });

  it("uses partial provider values and fills the rest from defaults", () => {
    expect(resolveIconConfig({}, { weight: "fill" })).toEqual({
      color: "currentColor",
      size: "1em",
      weight: "fill",
      mirrored: false,
    });
  });

  it("keeps explicit false for mirrored", () => {
    expect(resolveIconConfig({ mirrored: false }, { mirrored: true }).mirrored).toBe(false);
  });
});

describe("mergeIconContext", () => {
  it("returns the parent when no value is supplied", () => {
    expect(mergeIconContext(DEFAULT_ICON_CONTEXT)).toBe(DEFAULT_ICON_CONTEXT);
  });

  it("inherits unspecified keys and overrides supplied keys", () => {
    expect(
      mergeIconContext(
        { color: "red", size: 24, weight: "regular", mirrored: false },
        { weight: "bold", mirrored: true },
      ),
    ).toEqual({
      color: "red",
      size: 24,
      weight: "bold",
      mirrored: true,
    });
  });

  it("ignores explicitly undefined keys", () => {
    expect(
      mergeIconContext(
        { color: "red", size: 24, weight: "regular", mirrored: false },
        { color: undefined, size: undefined },
      ),
    ).toEqual({
      color: "red",
      size: 24,
      weight: "regular",
      mirrored: false,
    });
  });
});

describe("resolveMirroredStyle", () => {
  it("returns the original style when mirroring is disabled", () => {
    const style = { color: "red" };
    expect(resolveMirroredStyle(false, style)).toBe(style);
  });

  it("preserves existing styles while mirroring", () => {
    expect(resolveMirroredStyle(true, { color: "red", transformOrigin: "left center" })).toEqual({
      color: "red",
      transform: "scaleX(-1)",
      transformOrigin: "left center",
    });
  });

  it("defaults the transform origin to center", () => {
    expect(resolveMirroredStyle(true, undefined)).toEqual({
      transform: "scaleX(-1)",
      transformOrigin: "center",
    });
  });
});
