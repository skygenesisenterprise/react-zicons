import * as React from "react";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HeartIcon } from "../../src/icons/generated/Heart.js";
import { HouseIcon } from "../../src/icons/generated/House.js";
import { SSRBase } from "../../src/core/SSRBase.js";
import { ZIconProvider } from "../../src/core/provider.js";
import type { IconWeights } from "../../src/core/types.js";
import { HeartIcon as SSRHeartIcon } from "../../src/ssr/generated/Heart.js";

const weights: IconWeights = {
  viewBox: "0 0 256 256",
  paths: {
    thin: [{ d: "M0 0h1" }],
    light: [{ d: "M0 0h2" }],
    regular: [{ d: "M0 0h3" }],
    bold: [{ d: "M0 0h4" }],
    fill: [{ d: "M0 0h5" }],
    duotone: [{ d: "M0 0h6", opacity: 0.2 }, { d: "M0 0h7" }],
  },
};

function getSvg(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector("svg");
  if (!(svg instanceof SVGSVGElement)) {
    throw new Error("Expected an SVG element");
  }
  return svg;
}

describe("client icon rendering", () => {
  it("renders the regular weight with accessible defaults", () => {
    const { container } = render(<HeartIcon />);
    const svg = getSvg(container);

    expect(svg.getAttribute("viewBox")).toBe("0 0 256 256");
    expect(svg.getAttribute("width")).toBe("1em");
    expect(svg.getAttribute("height")).toBe("1em");
    expect(svg.getAttribute("fill")).toBe("currentColor");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("focusable")).toBe("false");
    expect(svg.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("renders a title and image role when alt is supplied", () => {
    render(<HeartIcon alt="Favourite" />);

    expect(screen.getByRole("img", { name: "Favourite" })).toBeInTheDocument();
    expect(screen.getByTitle("Favourite")).toBeInTheDocument();
  });

  it("switches weights", () => {
    const { container: regularContainer } = render(<HeartIcon />);
    const { container: boldContainer } = render(<HeartIcon weight="bold" />);

    const regularPath = getSvg(regularContainer).querySelector("path")?.getAttribute("d");
    const boldPath = getSvg(boldContainer).querySelector("path")?.getAttribute("d");

    expect(regularPath).toBeTruthy();
    expect(boldPath).toBeTruthy();
    expect(boldPath).not.toBe(regularPath);
  });

  it("renders additional duotone paths with opacity", () => {
    const { container } = render(<HeartIcon weight="duotone" />);
    const paths = Array.from(getSvg(container).querySelectorAll("path"));

    expect(paths.length).toBeGreaterThanOrEqual(2);
    expect(paths.some((path) => path.getAttribute("opacity") !== null)).toBe(true);
  });

  it("applies size, color, and mirrored styles", () => {
    const { container } = render(<HeartIcon size={32} color="rebeccapurple" mirrored />);
    const svg = getSvg(container);

    expect(svg.getAttribute("width")).toBe("32");
    expect(svg.getAttribute("height")).toBe("32");
    expect(svg.getAttribute("fill")).toBe("rebeccapurple");
    expect(svg.style.transform).toBe("scaleX(-1)");
    expect(svg.style.transformOrigin).toBe("center");
  });

  it("forwards refs to the SVG element", () => {
    const ref = React.createRef<SVGSVGElement>();
    render(<HeartIcon ref={ref} />);

    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });

  it("lets native SVG props override library defaults", () => {
    const { container } = render(
      <HeartIcon width={64} height={48} fill="blue" aria-label="Custom heart" />,
    );
    const svg = getSvg(container);

    expect(svg.getAttribute("width")).toBe("64");
    expect(svg.getAttribute("height")).toBe("48");
    expect(svg.getAttribute("fill")).toBe("blue");
    expect(svg.getAttribute("aria-label")).toBe("Custom heart");
  });

  it("renders custom children before the weight paths", () => {
    const { container } = render(
      <HeartIcon>
        <circle data-testid="custom-child" cx="128" cy="128" r="8" />
      </HeartIcon>,
    );

    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(getSvg(container).firstElementChild?.tagName.toLowerCase()).toBe("circle");
  });
});

describe("provider", () => {
  it("applies provider defaults", () => {
    const { container } = render(
      <ZIconProvider value={{ size: 40, color: "tomato", weight: "light" }}>
        <HeartIcon />
      </ZIconProvider>,
    );
    const svg = getSvg(container);

    expect(svg.getAttribute("width")).toBe("40");
    expect(svg.getAttribute("fill")).toBe("tomato");
  });

  it("lets explicit props win over provider values", () => {
    const { container } = render(
      <ZIconProvider value={{ size: 40 }}>
        <HeartIcon size={12} />
      </ZIconProvider>,
    );

    expect(getSvg(container).getAttribute("width")).toBe("12");
  });

  it("merges nested providers and only overrides supplied keys", () => {
    const { container } = render(
      <ZIconProvider value={{ size: 30, color: "red", weight: "regular" }}>
        <ZIconProvider value={{ weight: "bold" }}>
          <HeartIcon />
        </ZIconProvider>
      </ZIconProvider>,
    );
    const svg = getSvg(container);

    expect(svg.getAttribute("width")).toBe("30");
    expect(svg.getAttribute("fill")).toBe("red");
  });

  it("renders sibling icons independently", () => {
    const { container } = render(
      <>
        <HouseIcon />
        <HeartIcon />
      </>,
    );

    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });
});

describe("server rendering", () => {
  it("renders a generated SSR icon without context", () => {
    const markup = renderToStaticMarkup(<SSRHeartIcon weight="fill" size={24} alt="Heart" />);

    expect(markup).toContain("<svg");
    expect(markup).toContain('viewBox="0 0 256 256"');
    expect(markup).toContain('width="24"');
    expect(markup).toContain("<title>Heart</title>");
    expect(markup).toContain("<path");
  });

  it("renders SSRBase weights as static markup", () => {
    const markup = renderToStaticMarkup(<SSRBase weights={weights} weight="duotone" />);

    expect(markup).toContain('viewBox="0 0 256 256"');
    expect(markup).toContain('opacity="0.2"');
    expect(markup.match(/<path/g)).toHaveLength(2);
  });
});
