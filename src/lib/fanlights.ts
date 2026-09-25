// King Blade order and DB keys. Hex values are UI approximations, not calibrated LED colors.
export const fanLights = {
  RED: "#FF2638",
  BLUE: "#245BFF",
  WHITE: "#FAFAFA",
  ORANGE: "#FF851B",
  GREEN: "#00B84A",
  PURPLE: "#9B40D8",
  PINK: "#FF78B6",
  YELLOW: "#FFE033",
  "LIGHT GREEN": "#91E86B",
  "LIGHT BLUE": "#79CEFF",
  "LIGHT PINK": "#FFB8DB",
  VIOLET: "#6546D7",
  LIME: "#C4EF30",
  TURQUOISE: "#24D5C4",
  "HOT PINK": "#FF1493",
} as const;
export type FanLightColor = keyof typeof fanLights;
export const fanLightKeys = Object.keys(fanLights) as [
  FanLightColor,
  ...FanLightColor[],
];
export function normalizeFanLightColor(
  name?: string | null,
): FanLightColor | undefined {
  const key = name?.trim().toUpperCase();
  return key && Object.hasOwn(fanLights, key)
    ? (key as FanLightColor)
    : undefined;
}

// Read-only compatibility: old brand colors are not selectable or silently remapped.
const legacyColors: Record<string, string> = {
  magenta: "#F2285A",
  cyan: "#01ACC6",
  navy: "#023D97",
  black: "#0A0A0A",
  charcoal: "#666666",
  gray: "#C8C8C8",
  "lilas-blue": "#323A62",
  "ayase-green": "#043A40",
};
export function fanLightHex(name?: string | null) {
  const key = normalizeFanLightColor(name);
  return key
    ? fanLights[key]
    : name && Object.hasOwn(legacyColors, name)
      ? legacyColors[name]
      : undefined;
}
