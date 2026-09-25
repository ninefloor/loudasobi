export function HighlightedText({text, ranges}: {text: string; ranges: readonly {start: number; end: number}[]}) {
  const valid = ranges.filter(range => range.start >= 0 && range.start < range.end && range.end <= text.length);
  const boundaries = [...new Set([0, text.length, ...valid.flatMap(range => [range.start, range.end])])].sort((a, b) => a - b);
  return boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1];
    return valid.some(range => start >= range.start && end <= range.end)
      ? <mark key={start} className="rounded-sm bg-primary/15 text-primary">{text.slice(start, end)}</mark>
      : <span key={start}>{text.slice(start, end)}</span>;
  });
}
