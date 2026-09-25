import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          color: "#f2285a",
          fontSize: 120,
          fontWeight: 700,
          display: "flex",
        }}
      >
        L
      </div>
      <div
        style={{
          background: "#01acc6",
          width: 14,
          height: 70,
          borderRadius: 7,
        }}
      />
      <div
        style={{
          background: "#01acc6",
          width: 14,
          height: 100,
          borderRadius: 7,
        }}
      />
    </div>,
    size,
  );
}
