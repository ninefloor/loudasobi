import type { CallSection } from "@/types/lyric";

export function groupLyrics(sectionByLine: CallSection[][]) {
  const lastRow = new Map<string, number>();
  sectionByLine.forEach((sections, index) => {
    sections.forEach((section) => lastRow.set(section.id, index));
  });
  const groups: { indices: number[]; sections: CallSection[] }[] = [];
  for (let start = 0; start < sectionByLine.length;) {
    let end = start;
    const sections = new Map<string, CallSection>();
    const indices: number[] = [];
    for (let index = start; index <= end; index++) {
      indices.push(index);
      for (const section of sectionByLine[index]) {
        sections.set(section.id, section);
        end = Math.max(end, lastRow.get(section.id) ?? index);
      }
    }
    groups.push({ indices, sections: [...sections.values()] });
    start = end + 1;
  }
  return groups;
}
