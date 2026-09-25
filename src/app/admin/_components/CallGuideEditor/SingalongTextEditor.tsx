"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { HighlightedText } from "@/components/player/HighlightedText";
import { cueTextSelections, type CallCue } from "@/lib/callGuide";
import { lyricTextFields, lyricTextLabels, lyricTextLang, type LyricTextField } from "@/lib/lyricText";
import type { LyricLine } from "@/types/lyric";

export function SingalongTextEditor({cue, lines, disabled, onChange}: {cue: CallCue; lines: LyricLine[]; disabled: boolean; onChange: (cue: CallCue) => void}) {
  const selections = cueTextSelections(cue);
  function change(lineId: string, field: LyricTextField, range?: {start: number; end: number; text: string}) {
    if (disabled) return;
    const next = selections.filter(item => item.lineId !== lineId || item.field !== field);
    if (range) next.push({lineId, field, ...range});
    onChange({...cue, selection: undefined, textSelections: next.length ? next : undefined});
  }
  return <div className="space-y-4">
    <p className="text-xs text-muted-foreground">연결된 가사의 각 번역·독음에서 떼창할 부분을 드래그하세요. 언어별 범위는 독립적이며 자동 번역하지 않습니다. 가사 내용은 MONOASOBI에서 수정합니다.</p>
    {!cue.lines.length && <p className="text-sm">왼쪽 가사를 선택하고 ‘선택 블록에 가사 연결’을 눌러 주세요.</p>}
    {cue.lines.map((snapshot, index) => {
      const line = lines.find(line => line.id === snapshot.id);
      return <section key={snapshot.id} className="space-y-3 rounded-lg border p-3">
        <h3 className="text-sm font-medium">연결 가사 {index + 1}</h3>
        {!line && <p className="text-xs text-destructive">원본 줄이 없습니다. 가사를 다시 연결해 주세요.</p>}
        {lyricTextFields.map(field => <TextSelectionField key={field} field={field} text={line?.[field] ?? ""} disabled={disabled}
          selection={selections.find(range => range.lineId === snapshot.id && range.field === field)}
          onChange={range => change(snapshot.id, field, range)} />)}
      </section>;
    })}
  </div>;
}

function TextSelectionField({field, text, selection, disabled, onChange}: {
  field: LyricTextField; text: string; selection?: {start: number; end: number; text: string}; disabled: boolean;
  onChange: (range?: {start: number; end: number; text: string}) => void;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const stale = !!selection && selection.text !== text;
  function selectText() {
    if (disabled || !text) return;
    const selected = window.getSelection();
    if (!selected?.rangeCount || selected.isCollapsed || !textRef.current) return;
    const range = selected.getRangeAt(0);
    if (!textRef.current.contains(range.startContainer) || !textRef.current.contains(range.endContainer)) return;
    const prefix = range.cloneRange();
    prefix.selectNodeContents(textRef.current);
    prefix.setEnd(range.startContainer, range.startOffset);
    const start = prefix.toString().length, end = start + range.toString().length;
    if (end <= text.length && start < end) onChange({start, end, text});
  }
  return <div className="space-y-1">
    <h4 className="text-xs font-medium">{lyricTextLabels[field]}</h4>
    <p ref={textRef} lang={lyricTextLang[field]} tabIndex={text ? 0 : undefined} data-text-selection
      onPointerUp={selectText} onKeyUp={selectText}
      aria-label={`${lyricTextLabels[field]} 떼창 범위 선택`}
      className="cursor-text select-text whitespace-pre-wrap break-words rounded border p-2 text-sm focus-visible:outline-2 focus-visible:outline-ring">
      {text ? <HighlightedText text={text} ranges={selection && !stale ? [selection] : []} /> : "자료 없음"}
    </p>
    {stale && <p role="alert" className="text-xs text-destructive">내용이 변경되었습니다. 다시 선택하거나 강조를 해제해 주세요.</p>}
    <p className="text-xs text-muted-foreground">{selection && !stale ? `선택: ${text.slice(selection.start, selection.end)}` : "선택된 강조 없음"}</p>
    <div className="flex flex-wrap gap-1">
      <Button size="xs" variant="outline" disabled={disabled || !text} onClick={selectText}>선택 범위 사용</Button>
      <Button size="xs" variant="ghost" disabled={disabled || !text} onClick={() => onChange({start: 0, end: text.length, text})}>전체 강조</Button>
      <Button size="xs" variant="ghost" disabled={disabled || !selection} onClick={() => onChange()}>강조 해제</Button>
    </div>
  </div>;
}
