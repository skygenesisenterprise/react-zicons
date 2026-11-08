import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import * as rootEntry from "../../src/index.js";
import * as iconsEntry from "../../src/icons/generated/index.js";
import * as catalogEntry from "../../src/catalog/index.js";
import * as coreEntry from "../../src/core/index.js";
import * as providerEntry from "../../src/provider/index.js";
import * as ssrEntry from "../../src/ssr/index.js";
import HeartDefault, { Heart, HeartIcon } from "../../src/icons/generated/Heart.js";
import SSRHeartDefault, { HeartIcon as SSRHeartIcon } from "../../src/ssr/generated/Heart.js";

describe("package entry points", () => {
  it("exports client icons and core APIs from the root", () => {
    expect(rootEntry.HeartIcon).toBeTypeOf("object");
    expect(rootEntry.ZIconProvider).toBeTypeOf("function");
    expect(rootEntry.IconBase).toBeTypeOf("object");
    expect(rootEntry.ICON_WEIGHTS).toEqual([
      "thin",
      "light",
      "regular",
      "bold",
      "fill",
      "duotone",
    ]);
  });

  it("exports every generated client icon from the icons entry", () => {
    expect(iconsEntry.HeartIcon).toBe(HeartIcon);
    expect(iconsEntry.HouseIcon).toBeTypeOf("object");
  });

  it("exports server icons from the SSR entry", () => {
    expect(ssrEntry.HeartIcon).toBe(SSRHeartDefault);
    expect(ssrEntry.HouseIcon).toBeTypeOf("function");
    expect(ssrEntry.SSRBase).toBeTypeOf("function");
  });

  it("exports catalog helpers from the catalog entry", () => {
    expect(catalogEntry.findIcon("heart")?.name).toBe("heart");
    expect(catalogEntry.icons).toHaveLength(1512);
  });

  it("exports the provider through the provider-only entry", () => {
    expect(providerEntry.ZIconProvider).toBe(coreEntry.ZIconProvider);
    expect(providerEntry.mergeIconContext).toBe(coreEntry.mergeIconContext);
  });

  it("keeps direct client imports compatible with default and alias exports", () => {
    expect(HeartDefault).toBe(HeartIcon);
    expect(Heart).toBe(HeartIcon);
    expect(SSRHeartDefault).toBe(SSRHeartIcon);
  });

  it("renders icons imported from each entry surface", () => {
    render(
      <providerEntry.ZIconProvider value={{ size: 20 }}>
        <rootEntry.HeartIcon />
        <iconsEntry.HouseIcon />
      </providerEntry.ZIconProvider>,
    );

    expect(document.querySelectorAll("svg")).toHaveLength(2);
  });
});
