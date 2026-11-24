import { ImageResponse } from "next/og";

export const alt = "Pola — Daily Logic Puzzles";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const GAMES = [
  { name: "Queens", color: "#F59E0B" },
  { name: "Tango", color: "#FB923C" },
  { name: "Zip", color: "#38BDF8" },
  { name: "Mini Sudoku", color: "#34D399" },
  { name: "Patches", color: "#FB7185" },
  { name: "Fold", color: "#818CF8" },
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 68px",
          backgroundColor: "#0B111A",
          backgroundImage:
            "radial-gradient(circle at 14% 18%, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0) 46%), radial-gradient(circle at 86% 82%, rgba(245, 158, 11, 0.20) 0%, rgba(245, 158, 11, 0) 48%), linear-gradient(145deg, #0B111A 0%, #111927 100%)",
          color: "#F8FAFC",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          overflow: "hidden",
        }}
      >
        {/* Subtle inner card border */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            bottom: 24,
            left: 24,
            borderRadius: 28,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
          }}
        />

        {/* Top row: Brand mark + Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          {/* Signature 4-tile Pola squircle mark */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <div
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 5,
                  backgroundImage:
                    "linear-gradient(135deg, #FBBF24 0%, #F97316 100%)",
                }}
              />
              <div
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 5,
                  backgroundImage:
                    "linear-gradient(135deg, #38BDF8 0%, #06B6D4 100%)",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 5,
                  backgroundImage:
                    "linear-gradient(135deg, #34D399 0%, #14B8A6 100%)",
                }}
              />
              <div
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 999,
                  backgroundImage:
                    "linear-gradient(135deg, #FB7185 0%, #EC4899 100%)",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
            }}
          >
            <span>Pola</span>
            <span style={{ color: "#38BDF8" }}>.</span>
          </div>
        </div>

        {/* Center content: Headline, Subtitle & 6 Game Pills */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginTop: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 70,
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: "-0.035em",
              color: "#FFFFFF",
            }}
          >
            Daily Logic Puzzles
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 27,
              fontWeight: 500,
              color: "#94A3B8",
              letterSpacing: "-0.01em",
            }}
          >
            6 bite-sized brain teasers • Daily Challenges & Unlimited Mode
          </div>

          {/* 6 Game pill badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 14,
            }}
          >
            {GAMES.map((game) => (
              <div
                key={game.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 20px",
                  borderRadius: 999,
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#E2E8F0",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: game.color,
                  }}
                />
                <span>{game.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: Domain badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              borderRadius: 999,
              backgroundColor: "rgba(15, 23, 42, 0.72)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              fontSize: 20,
              fontWeight: 600,
              color: "#CBD5E1",
              letterSpacing: "0.01em",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: "#34D399",
              }}
            />
            <span>playpola.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
