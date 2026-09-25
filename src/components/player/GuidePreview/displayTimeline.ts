import type { CallSection, LyricLine } from "@/types/lyric";

// Add display-only instrumental cards; never write these into shared lyrics.
export function displayTimeline(source: LyricLine[], sections: CallSection[]) {
  const rows = [...source];
  const boundaries = [
    ...new Set([
      ...source.flatMap((line) => [line.start, line.end]),
      ...sections.flatMap((cue) => [cue.start, cue.end]),
    ]),
  ].sort((a, b) => a - b);
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i],
      end = boundaries[i + 1];
    if (
      !source.some((line) => line.start <= start && line.end > start) &&
      sections.some((cue) => cue.start < end && cue.end > start)
    )
      rows.push({
        id: `gap:${start}:${end}`,
        start,
        end,
        jp: "",
        kr: "",
        jpReading: "",
        instrumental: true,
      });
  }
  rows.sort((a, b) => a.start - b.start);
  const mapped = sections.map((cue) => ({
    ...cue,
    selection: cue.selection
      ? { ...cue.selection, line: rows.indexOf(source[cue.selection.line]) }
      : undefined,
  }));
  return { rows, sections: mapped };
}
