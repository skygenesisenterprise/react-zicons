import type { IconPath } from "../../src/core/types.js";

export interface ParsedSvg {
  readonly viewBox: string;
  readonly fill: string;
  readonly paths: readonly IconPath[];
}

const ROOT_ATTRIBUTES = new Set(["xmlns", "viewBox", "fill"]);
const PATH_ATTRIBUTES = new Set(["d", "opacity"]);
const ATTRIBUTE_PATTERN = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;

function parseAttributes(raw: string, context: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  let cursor = 0;
  let match: RegExpExecArray | null;

  ATTRIBUTE_PATTERN.lastIndex = 0;
  while ((match = ATTRIBUTE_PATTERN.exec(raw)) !== null) {
    const between = raw.slice(cursor, match.index);
    if (between.trim() !== "") {
      throw new Error(`${context}: malformed attribute list near "${between.trim()}"`);
    }

    const name = match[1];
    const value = match[2];
    if (name === undefined || value === undefined) {
      throw new Error(`${context}: malformed attribute`);
    }
    if (Object.hasOwn(attributes, name)) {
      throw new Error(`${context}: duplicate attribute "${name}"`);
    }

    attributes[name] = value;
    cursor = ATTRIBUTE_PATTERN.lastIndex;
  }

  if (raw.slice(cursor).trim() !== "") {
    throw new Error(`${context}: malformed attribute list near "${raw.slice(cursor).trim()}"`);
  }

  return attributes;
}

export function parseSvg(source: string, context: string): ParsedSvg {
  const normalized = source.replace(/\r\n/g, "\n").trim();
  const svgMatch = /^<svg\b([^>]*)>([\s\S]*)<\/svg>$/.exec(normalized);

  if (!svgMatch) {
    throw new Error(`${context}: not a single well-formed <svg> document`);
  }

  const rawRootAttributes = svgMatch[1];
  const children = svgMatch[2];
  if (rawRootAttributes === undefined || children === undefined) {
    throw new Error(`${context}: invalid <svg> document`);
  }

  const rootAttributes = parseAttributes(rawRootAttributes, context);
  for (const attribute of Object.keys(rootAttributes)) {
    if (!ROOT_ATTRIBUTES.has(attribute)) {
      throw new Error(`${context}: unsupported <svg> attribute "${attribute}"`);
    }
  }

  const viewBox = rootAttributes.viewBox;
  const fill = rootAttributes.fill;
  if (!viewBox) throw new Error(`${context}: missing viewBox`);
  if (fill !== "currentColor") {
    throw new Error(`${context}: expected fill="currentColor", found "${fill ?? ""}"`);
  }

  const xmlns = rootAttributes.xmlns;
  if (xmlns !== undefined && xmlns !== "http://www.w3.org/2000/svg") {
    throw new Error(`${context}: unsupported xmlns "${xmlns}"`);
  }

  const paths: IconPath[] = [];
  const pathPattern = /<path\b([^>]*)\/>/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pathPattern.exec(children)) !== null) {
    const between = children.slice(cursor, match.index);
    if (between.trim() !== "") {
      throw new Error(`${context}: unexpected content between paths`);
    }

    const rawAttributes = match[1];
    if (rawAttributes === undefined) {
      throw new Error(`${context}: malformed path`);
    }

    const attributes = parseAttributes(rawAttributes, context);
    for (const attribute of Object.keys(attributes)) {
      if (!PATH_ATTRIBUTES.has(attribute)) {
        throw new Error(`${context}: unsupported <path> attribute "${attribute}"`);
      }
    }

    const d = attributes.d;
    if (!d || d.trim() === "") {
      throw new Error(`${context}: path is missing a non-empty "d" attribute`);
    }

    const rawOpacity = attributes.opacity;
    if (rawOpacity === undefined) {
      paths.push({ d });
    } else {
      const opacity = Number(rawOpacity);
      if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
        throw new Error(`${context}: invalid path opacity "${rawOpacity}"`);
      }
      paths.push({ d, opacity });
    }

    cursor = pathPattern.lastIndex;
  }

  if (children.slice(cursor).trim() !== "") {
    throw new Error(`${context}: unexpected trailing content or unsupported element`);
  }

  if (paths.length === 0) {
    throw new Error(`${context}: SVG contains no <path> elements`);
  }

  return { viewBox, fill, paths };
}
