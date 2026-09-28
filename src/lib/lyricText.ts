export const lyricTextFields = [
  "jp",
  "kr",
  "jpReading",
  "en",
  "enReading",
] as const;
export const singalongTextFields = ["jp", "jpReading", "enReading"] as const;
export type LyricTextField = (typeof lyricTextFields)[number];
export const lyricTextLabels: Record<LyricTextField, string> = {
  jp: "일본어 원문",
  kr: "한국어 번역",
  jpReading: "한국어 독음",
  en: "영어 번역",
  enReading: "영어 독음",
};
export const lyricTextLang: Record<LyricTextField, string> = {
  jp: "ja",
  kr: "ko",
  jpReading: "ko",
  en: "en",
  enReading: "en",
};
