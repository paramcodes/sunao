import { ImageResponse } from "next/og";

export const alt = "sunao, a Spotify-like music player";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#121212",
      }}
    >
      <div style={{ display: "flex", color: "#ffffff", fontSize: 160, fontWeight: 700 }}>sunao</div>
      <div style={{ display: "flex", color: "#b3b3b3", fontSize: 48, marginTop: 24 }}>
        A Spotify-like music player
      </div>
    </div>,
    { ...size },
  );
}
