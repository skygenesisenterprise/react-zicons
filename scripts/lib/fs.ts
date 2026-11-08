import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function writeGeneratedFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const normalized = contents.replace(/\r\n/g, "\n").replace(/\n*$/, "\n");
  writeFileSync(path, normalized, "utf8");
}

export function resetDirectory(path: string): void {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
}

export function quote(value: string): string {
  return JSON.stringify(value);
}

export function formatStringArray(values: readonly string[], indent = ""): string {
  if (values.length === 0) return "[]";
  const inner = values.map((value) => `${indent}  ${quote(value)},`).join("\n");
  return `[\n${inner}\n${indent}]`;
}
