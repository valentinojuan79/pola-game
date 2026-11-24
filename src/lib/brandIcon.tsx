import React from "react";

interface BrandIconOptions {
  /** Canvas width & height in pixels */
  size: number;
  /**
   * "favicon"  -> tight framing for small browser tabs (64x64)
   * "standard" -> balanced framing for iOS apple-touch-icon & Android "any"
   * "maskable" -> ~20% outer safe-zone padding for Android adaptive maskable icons
   */
  variant: "favicon" | "standard" | "maskable";
}

/**
 * Renders the exact 4-color Pola logo mark on a solid #0B111A canvas
 * for use inside `next/og` ImageResponse (no external font fetches).
 *
 * Tile colors match HeaderBar.tsx & opengraph-image.tsx:
 * - Top-left:     amber-400 (#FBBF24) -> orange-500 (#F97316) rounded square
 * - Top-right:    sky-400   (#38BDF8) -> cyan-500   (#06B6D4) rounded square
 * - Bottom-left:  emerald-400 (#34D399) -> teal-500 (#14B8A6) rounded square
 * - Bottom-right: rose-400  (#FB7185) -> pink-500   (#EC4899) circle
 */
export function renderPolaBrandIcon({ size, variant }: BrandIconOptions) {
  const isFavicon = variant === "favicon";
  const isMaskable = variant === "maskable";

  // Inner glass squircle badge size relative to canvas
  const badgeScale = isFavicon ? 0.92 : isMaskable ? 0.58 : 0.76;
  const badgeSize = Math.round(size * badgeScale);
  const badgeRadius = Math.round(badgeSize * 0.27);
  const borderWidth = Math.max(1, Math.round(size * 0.012));

  // 2x2 tile grid sizing inside the squircle badge
  const tileSize = Math.round(badgeSize * 0.32);
  const tileGap = Math.round(badgeSize * 0.095);
  const tileRadius = Math.max(3, Math.round(tileSize * 0.29));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0B111A",
        borderRadius: isFavicon ? Math.round(size * 0.22) : 0,
      }}
    >
      <div
        style={{
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeRadius,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          border: `${borderWidth}px solid rgba(255, 255, 255, 0.16)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: tileGap,
        }}
      >
        {/* Top row: Amber/Orange + Sky/Cyan */}
        <div style={{ display: "flex", gap: tileGap }}>
          <div
            style={{
              width: tileSize,
              height: tileSize,
              borderRadius: tileRadius,
              backgroundImage:
                "linear-gradient(135deg, #FBBF24 0%, #F97316 100%)",
            }}
          />
          <div
            style={{
              width: tileSize,
              height: tileSize,
              borderRadius: tileRadius,
              backgroundImage:
                "linear-gradient(135deg, #38BDF8 0%, #06B6D4 100%)",
            }}
          />
        </div>

        {/* Bottom row: Emerald/Teal + Rose/Pink Circle */}
        <div style={{ display: "flex", gap: tileGap }}>
          <div
            style={{
              width: tileSize,
              height: tileSize,
              borderRadius: tileRadius,
              backgroundImage:
                "linear-gradient(135deg, #34D399 0%, #14B8A6 100%)",
            }}
          />
          <div
            style={{
              width: tileSize,
              height: tileSize,
              borderRadius: 999,
              backgroundImage:
                "linear-gradient(135deg, #FB7185 0%, #EC4899 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
