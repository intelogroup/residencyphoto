import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D9488",
          borderRadius: 8,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}>
          <rect width="18" height="18" x="3" y="3" rx="5" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="1" fill="#fff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
