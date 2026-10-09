import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Runs `run` over the items a few at a time, keeping their order.
export async function inBatches<T, R>(
  items: T[],
  size: number,
  run: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let start = 0; start < items.length; start += size) {
    results.push(...(await Promise.all(items.slice(start, start + size).map(run))));
  }
  return results;
}

export function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

// Keeps each run in .evals/ so a change can be compared with the run before it.
export async function saveReport(name: string, report: unknown) {
  const dir = join(process.cwd(), ".evals");
  await mkdir(dir, { recursive: true });
  const file = join(dir, `${name}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await writeFile(file, JSON.stringify(report, null, 2));
  return file;
}
