import { ImageResponse } from "next/og";

export const alt = "loudasobi — YOASOBI Fan Call Guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#fafafa",
        padding: 80,
        borderLeft: "20px solid #f2285a",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: "#01acc6",
          marginBottom: 28,
        }}
      >
        YOASOBI FAN CALL GUIDE
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 112,
          fontWeight: 700,
          letterSpacing: -6,
        }}
      >
        loudasobi
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 32,
          color: "#c8c8c8",
          marginTop: 36,
        }}
      >
        Clap. Chant. Sing along.
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 48 }}>
        <div style={{ width: 120, height: 8, background: "#f2285a" }} />
        <div style={{ width: 60, height: 8, background: "#01acc6" }} />
      </div>
    </div>,
    size,
  );
}
