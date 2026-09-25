import type { LyricLine } from "@/types/lyric";

export function upperBound(values: readonly number[], time: number) {
  let low = 0,
    high = values.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (values[middle] <= time) low = middle + 1;
    else high = middle;
  }
  return low;
}

// Imported tracks are ordered and non-overlapping. Keep their original indices.
export function activeLineAt(
  lines: readonly LyricLine[],
  starts: readonly number[],
  time: number,
) {
  const index = upperBound(starts, time) - 1;
  return index >= 0 && time < lines[index].end ? index : -1;
}
