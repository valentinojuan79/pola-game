import { dictionary, type Locale } from "@/lib/i18n";
import type { PolaGameType } from "@/lib/storage";
import type { Theme } from "@/lib/theme";

export type ShareCardFormat = "compact" | "story";

export type ShareDifficulty = "easy" | "medium" | "hard" | "expert";

export interface SingleGameSharePayload {
  kind: "single";
  game: PolaGameType;
  mode: "daily" | "unlimited";
  dateStr: string; // YYYY-MM-DD
  difficulty?: ShareDifficulty;
  gridSize?: number;
  totalSeconds: number;
  hintsUsed: number;
  streak: number;
  dailyRank?: number | null;
  username?: string | null;
}

export interface DailyRecapGameItem {
  game: PolaGameType;
  totalSeconds: number;
  hintsUsed: number;
  difficulty?: ShareDifficulty;
}

export interface DailyRecapSharePayload {
  kind: "recap";
  dateStr: string; // YYYY-MM-DD
  totalSeconds: number;
  totalHintsUsed?: number;
  streak: number;
  username?: string | null;
  games: DailyRecapGameItem[];
}

export type ShareCardPayload = SingleGameSharePayload | DailyRecapSharePayload;

export interface RenderShareCardOptions {
  payload: ShareCardPayload;
  format: ShareCardFormat;
  theme: Theme;
  locale: Locale;
}

export const SHARE_APP_URL = "playpola.vercel.app";

export const SHARE_CARD_DIMENSIONS: Record<
  ShareCardFormat,
  { width: number; height: number }
> = {
  compact: { width: 1080, height: 1350 }, // 4:5 card — crisp for WhatsApp, chats & feeds
  story: { width: 1080, height: 1920 }, // 9:16 vertical story — Instagram & WhatsApp Stories
};

const FONT_DISPLAY =
  '"Outfit", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
const FONT_SANS =
  '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif';

const CANONICAL_GAME_ORDER: PolaGameType[] = [
  "queens",
  "zip",
  "tango",
  "mini-sudoku",
  "patches",
  "fold",
];

type DayKey = keyof (typeof dictionary)["en"]["share"]["days"];

const WEEKDAY_KEYS: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

interface GameAccentPalette {
  light: {
    primary: string;
    softBg: string;
    pillBg: string;
    pillText: string;
    border: string;
    orb: string;
  };
  dark: {
    primary: string;
    softBg: string;
    pillBg: string;
    pillText: string;
    border: string;
    orb: string;
  };
}

const GAME_ACCENTS: Record<PolaGameType, GameAccentPalette> = {
  queens: {
    light: {
      primary: "#D97706",
      softBg: "rgba(245, 158, 11, 0.14)",
      pillBg: "rgba(245, 158, 11, 0.12)",
      pillText: "#92400E",
      border: "rgba(217, 119, 6, 0.28)",
      orb: "rgba(251, 191, 36, 0.34)",
    },
    dark: {
      primary: "#FBBF24",
      softBg: "rgba(251, 191, 36, 0.16)",
      pillBg: "rgba(251, 191, 36, 0.16)",
      pillText: "#FDE68A",
      border: "rgba(251, 191, 36, 0.28)",
      orb: "rgba(245, 158, 11, 0.22)",
    },
  },
  zip: {
    light: {
      primary: "#0369A1",
      softBg: "rgba(14, 165, 233, 0.14)",
      pillBg: "rgba(14, 165, 233, 0.12)",
      pillText: "#0C4A6E",
      border: "rgba(3, 105, 161, 0.26)",
      orb: "rgba(56, 189, 248, 0.34)",
    },
    dark: {
      primary: "#38BDF8",
      softBg: "rgba(56, 189, 248, 0.16)",
      pillBg: "rgba(56, 189, 248, 0.16)",
      pillText: "#BAE6FD",
      border: "rgba(56, 189, 248, 0.28)",
      orb: "rgba(14, 165, 233, 0.22)",
    },
  },
  tango: {
    light: {
      primary: "#EA580C",
      softBg: "rgba(249, 115, 22, 0.14)",
      pillBg: "rgba(249, 115, 22, 0.12)",
      pillText: "#9A3412",
      border: "rgba(234, 88, 12, 0.26)",
      orb: "rgba(251, 146, 60, 0.34)",
    },
    dark: {
      primary: "#FB923C",
      softBg: "rgba(251, 146, 60, 0.16)",
      pillBg: "rgba(251, 146, 60, 0.16)",
      pillText: "#FED7AA",
      border: "rgba(251, 146, 60, 0.28)",
      orb: "rgba(234, 88, 12, 0.22)",
    },
  },
  "mini-sudoku": {
    light: {
      primary: "#059669",
      softBg: "rgba(16, 185, 129, 0.14)",
      pillBg: "rgba(16, 185, 129, 0.12)",
      pillText: "#065F46",
      border: "rgba(5, 150, 105, 0.26)",
      orb: "rgba(52, 211, 153, 0.34)",
    },
    dark: {
      primary: "#34D399",
      softBg: "rgba(52, 211, 153, 0.16)",
      pillBg: "rgba(52, 211, 153, 0.16)",
      pillText: "#A7F3D0",
      border: "rgba(52, 211, 153, 0.28)",
      orb: "rgba(16, 185, 129, 0.22)",
    },
  },
  patches: {
    light: {
      primary: "#E11D48",
      softBg: "rgba(244, 63, 94, 0.14)",
      pillBg: "rgba(244, 63, 94, 0.12)",
      pillText: "#881337",
      border: "rgba(225, 29, 72, 0.26)",
      orb: "rgba(251, 113, 133, 0.34)",
    },
    dark: {
      primary: "#FB7185",
      softBg: "rgba(251, 113, 133, 0.16)",
      pillBg: "rgba(251, 113, 133, 0.16)",
      pillText: "#FECDD3",
      border: "rgba(251, 113, 133, 0.28)",
      orb: "rgba(225, 29, 72, 0.22)",
    },
  },
  fold: {
    light: {
      primary: "#4F46E5",
      softBg: "rgba(99, 102, 241, 0.14)",
      pillBg: "rgba(99, 102, 241, 0.12)",
      pillText: "#312E81",
      border: "rgba(79, 70, 229, 0.26)",
      orb: "rgba(129, 140, 248, 0.34)",
    },
    dark: {
      primary: "#818CF8",
      softBg: "rgba(129, 140, 248, 0.16)",
      pillBg: "rgba(129, 140, 248, 0.16)",
      pillText: "#C7D2FE",
      border: "rgba(129, 140, 248, 0.28)",
      orb: "rgba(79, 70, 229, 0.22)",
    },
  },
};

const RECAP_ACCENT: GameAccentPalette = {
  light: {
    primary: "#059669",
    softBg: "rgba(16, 185, 129, 0.14)",
    pillBg: "rgba(16, 185, 129, 0.12)",
    pillText: "#065F46",
    border: "rgba(5, 150, 105, 0.26)",
    orb: "rgba(52, 211, 153, 0.32)",
  },
  dark: {
    primary: "#34D399",
    softBg: "rgba(52, 211, 153, 0.16)",
    pillBg: "rgba(52, 211, 153, 0.16)",
    pillText: "#A7F3D0",
    border: "rgba(52, 211, 153, 0.28)",
    orb: "rgba(16, 185, 129, 0.22)",
  },
};

interface ThemePalette {
  bg: string;
  cardTop: string;
  cardBottom: string;
  cardBorder: string;
  cardSheen: string;
  cardShadow: string;
  innerSurface: string;
  innerBorder: string;
  pillBg: string;
  pillBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  divider: string;
  dotColor: string;
  brandDot: string;
  successBg: string;
  successText: string;
  successBorder: string;
  flameColor: string;
  flameMuted: string;
  orbs: { x: number; y: number; r: number; color: string }[];
}

function getThemePalette(theme: Theme, accentOrb: string): ThemePalette {
  if (theme === "dark") {
    return {
      bg: "#090B10",
      cardTop: "rgba(26, 31, 43, 0.84)",
      cardBottom: "rgba(17, 21, 30, 0.86)",
      cardBorder: "rgba(255, 255, 255, 0.13)",
      cardSheen: "rgba(255, 255, 255, 0.22)",
      cardShadow: "rgba(0, 0, 0, 0.58)",
      innerSurface: "rgba(255, 255, 255, 0.055)",
      innerBorder: "rgba(255, 255, 255, 0.095)",
      pillBg: "rgba(24, 29, 39, 0.78)",
      pillBorder: "rgba(255, 255, 255, 0.14)",
      textPrimary: "#FFFFFF",
      textSecondary: "#B4BAC6",
      textMuted: "#7E8696",
      divider: "rgba(255, 255, 255, 0.09)",
      dotColor: "rgba(255, 255, 255, 0.04)",
      brandDot: "#38BDF8",
      successBg: "rgba(16, 185, 129, 0.16)",
      successText: "#6EE7B7",
      successBorder: "rgba(52, 211, 153, 0.26)",
      flameColor: "#FBBF24",
      flameMuted: "#6B7280",
      orbs: [
        { x: 0.12, y: 0.08, r: 0.52, color: "rgba(14, 165, 233, 0.22)" },
        { x: 0.92, y: 0.18, r: 0.48, color: accentOrb },
        { x: 0.1, y: 0.62, r: 0.46, color: "rgba(16, 185, 129, 0.16)" },
        { x: 0.88, y: 0.88, r: 0.5, color: "rgba(8, 145, 178, 0.18)" },
      ],
    };
  }

  return {
    bg: "#F4F6FA",
    cardTop: "rgba(255, 255, 255, 0.86)",
    cardBottom: "rgba(255, 255, 255, 0.72)",
    cardBorder: "rgba(255, 255, 255, 0.92)",
    cardSheen: "rgba(255, 255, 255, 0.98)",
    cardShadow: "rgba(15, 23, 42, 0.09)",
    innerSurface: "rgba(15, 23, 42, 0.038)",
    innerBorder: "rgba(15, 23, 42, 0.065)",
    pillBg: "rgba(255, 255, 255, 0.82)",
    pillBorder: "rgba(255, 255, 255, 0.92)",
    textPrimary: "#0A0A0A",
    textSecondary: "#525252",
    textMuted: "#737373",
    divider: "rgba(15, 23, 42, 0.075)",
    dotColor: "rgba(15, 23, 42, 0.04)",
    brandDot: "#0EA5E9",
    successBg: "rgba(5, 150, 105, 0.12)",
    successText: "#047857",
    successBorder: "rgba(5, 150, 105, 0.22)",
    flameColor: "#F59E0B",
    flameMuted: "#A3A3A3",
    orbs: [
      { x: 0.12, y: 0.08, r: 0.52, color: "rgba(125, 211, 252, 0.42)" },
      { x: 0.92, y: 0.18, r: 0.48, color: accentOrb },
      { x: 0.08, y: 0.62, r: 0.46, color: "rgba(167, 243, 208, 0.40)" },
      { x: 0.88, y: 0.88, r: 0.5, color: "rgba(254, 205, 211, 0.38)" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Date, Formatting & Localization Helpers
// ---------------------------------------------------------------------------

function parseLocalDate(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return new Date(year, month - 1, day);
    }
  }
  const fallback = new Date(dateStr);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
}

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatShortDate(date: Date, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function getLocalizedGameName(game: PolaGameType, locale: Locale): string {
  const g = dictionary[locale].games;
  switch (game) {
    case "queens":
      return g.queens.name;
    case "zip":
      return g.zip.name;
    case "tango":
      return g.tango.name;
    case "mini-sudoku":
      return g.miniSudoku.name;
    case "patches":
      return g.patches.name;
    case "fold":
      return g.fold.name;
  }
}

function getLocalizedWeekday(date: Date, locale: Locale): string {
  const key = WEEKDAY_KEYS[date.getDay()] ?? "monday";
  return dictionary[locale].share.days[key];
}

function formatStreakValue(streak: number, locale: Locale): string {
  const s = dictionary[locale].share;
  const unit = streak === 1 ? s.dayUnit : s.daysUnit;
  return `${streak} ${unit}`;
}

export function getShareCardFilename(
  payload: ShareCardPayload,
  format: ShareCardFormat
): string {
  const suffix = format === "story" ? "story" : "card";
  const safeDate = payload.dateStr.replace(/[^0-9-]/g, "") || "today";
  if (payload.kind === "recap") {
    return `pola-daily-recap-${safeDate}-${suffix}.png`;
  }
  const modeSlug = payload.mode === "daily" ? safeDate : "unlimited";
  return `pola-${payload.game}-${modeSlug}-${suffix}.png`;
}

// ---------------------------------------------------------------------------
// Canvas Geometry & Drawing Primitives
// ---------------------------------------------------------------------------

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: ThemePalette
): void {
  // Base canvas fill
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);

  // Ambient iOS Liquid Glass refraction orbs
  for (const orb of palette.orbs) {
    const cx = orb.x * w;
    const cy = orb.y * h;
    const radius = orb.r * Math.max(w, h);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, orb.color);
    grad.addColorStop(0.55, orb.color.replace(/[\d.]+\)$/, "0.08)"));
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Subtle geometric dot matrix texture
  ctx.fillStyle = palette.dotColor;
  const spacing = 44;
  for (let y = spacing; y < h; y += spacing) {
    for (let x = spacing; x < w; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGlassCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  palette: ThemePalette,
  accentTint?: string
): void {
  // Soft elevation shadow
  ctx.save();
  ctx.shadowColor = palette.cardShadow;
  ctx.shadowBlur = 54;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 22;

  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, palette.cardTop);
  grad.addColorStop(1, palette.cardBottom);
  roundedRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Optional delicate top accent tint wash clipped inside the card
  if (accentTint) {
    ctx.save();
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.clip();
    const wash = ctx.createRadialGradient(
      x + w * 0.5,
      y - h * 0.05,
      0,
      x + w * 0.5,
      y + h * 0.15,
      w * 0.78
    );
    wash.addColorStop(0, accentTint);
    wash.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  // Outer crisp glass border
  ctx.save();
  roundedRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = palette.cardBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top inner specular highlight line
  ctx.beginPath();
  ctx.moveTo(x + r, y + 1.5);
  ctx.lineTo(x + w - r, y + 1.5);
  ctx.strokeStyle = palette.cardSheen;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  border: string
): void {
  ctx.save();
  roundedRectPath(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.75;
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Brand Mark & Vector Icon Renderers (Zero Spoilers)
// ---------------------------------------------------------------------------

function drawPolaLogoMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  theme: Theme
): void {
  const r = size * 0.32;
  ctx.save();
  ctx.shadowColor =
    theme === "dark" ? "rgba(0, 0, 0, 0.55)" : "rgba(14, 165, 233, 0.22)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;

  roundedRectPath(ctx, x, y, size, size, r);
  ctx.fillStyle =
    theme === "dark" ? "rgba(255, 255, 255, 0.10)" : "rgba(255, 255, 255, 0.92)";
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRectPath(ctx, x, y, size, size, r);
  ctx.strokeStyle =
    theme === "dark" ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.96)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const pad = size * 0.21;
  const gap = size * 0.1;
  const tile = (size - pad * 2 - gap) / 2;
  const tileR = tile * 0.34;

  // Top-left: Amber -> Orange
  const g1 = ctx.createLinearGradient(x + pad, y + pad, x + pad + tile, y + pad + tile);
  g1.addColorStop(0, "#FBBF24");
  g1.addColorStop(1, "#F97316");
  roundedRectPath(ctx, x + pad, y + pad, tile, tile, tileR);
  ctx.fillStyle = g1;
  ctx.fill();

  // Top-right: Sky -> Cyan
  const x2 = x + pad + tile + gap;
  const g2 = ctx.createLinearGradient(x2, y + pad, x2 + tile, y + pad + tile);
  g2.addColorStop(0, "#38BDF8");
  g2.addColorStop(1, "#06B6D4");
  roundedRectPath(ctx, x2, y + pad, tile, tile, tileR);
  ctx.fillStyle = g2;
  ctx.fill();

  // Bottom-left: Emerald -> Teal
  const y2 = y + pad + tile + gap;
  const g3 = ctx.createLinearGradient(x + pad, y2, x + pad + tile, y2 + tile);
  g3.addColorStop(0, "#34D399");
  g3.addColorStop(1, "#14B8A6");
  roundedRectPath(ctx, x + pad, y2, tile, tile, tileR);
  ctx.fillStyle = g3;
  ctx.fill();

  // Bottom-right: Rose -> Pink circle
  const g4 = ctx.createLinearGradient(x2, y2, x2 + tile, y2 + tile);
  g4.addColorStop(0, "#FB7185");
  g4.addColorStop(1, "#EC4899");
  ctx.beginPath();
  ctx.arc(x2 + tile / 2, y2 + tile / 2, tile / 2, 0, Math.PI * 2);
  ctx.fillStyle = g4;
  ctx.fill();

  ctx.restore();
}

function drawGameIcon(
  ctx: CanvasRenderingContext2D,
  game: PolaGameType,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2.6, size * 0.088);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const s = size / 2;

  switch (game) {
    case "queens": {
      // Crown silhouette
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.72, cy + s * 0.5);
      ctx.lineTo(cx - s * 0.85, cy - s * 0.32);
      ctx.lineTo(cx - s * 0.34, cy + s * 0.04);
      ctx.lineTo(cx, cy - s * 0.56);
      ctx.lineTo(cx + s * 0.34, cy + s * 0.04);
      ctx.lineTo(cx + s * 0.85, cy - s * 0.32);
      ctx.lineTo(cx + s * 0.72, cy + s * 0.5);
      ctx.closePath();
      ctx.globalAlpha = 0.18;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - s * 0.72, cy + s * 0.74);
      ctx.lineTo(cx + s * 0.72, cy + s * 0.74);
      ctx.stroke();
      break;
    }

    case "zip": {
      // Continuous winding path with start & end circles
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.62, cy - s * 0.55);
      ctx.lineTo(cx + s * 0.35, cy - s * 0.55);
      ctx.arc(cx + s * 0.35, cy - s * 0.27, s * 0.28, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(cx - s * 0.35, cy + s * 0.01);
      ctx.arc(cx - s * 0.35, cy + s * 0.29, s * 0.28, -Math.PI / 2, Math.PI / 2, true);
      ctx.lineTo(cx + s * 0.62, cy + s * 0.57);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx - s * 0.62, cy - s * 0.55, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + s * 0.62, cy + s * 0.57, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "tango": {
      // Sun (top-left) & Crescent Moon (bottom-right)
      const sunX = cx - s * 0.3;
      const sunY = cy - s * 0.26;
      const sunR = s * 0.26;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(
          sunX + Math.cos(angle) * (sunR + s * 0.12),
          sunY + Math.sin(angle) * (sunR + s * 0.12)
        );
        ctx.lineTo(
          sunX + Math.cos(angle) * (sunR + s * 0.23),
          sunY + Math.sin(angle) * (sunR + s * 0.23)
        );
        ctx.stroke();
      }

      // Crescent moon
      const moonX = cx + s * 0.34;
      const moonY = cy + s * 0.32;
      const moonR = s * 0.34;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0.35 * Math.PI, 1.85 * Math.PI);
      ctx.arc(
        moonX + moonR * 0.38,
        moonY - moonR * 0.22,
        moonR * 0.78,
        1.55 * Math.PI,
        0.65 * Math.PI,
        true
      );
      ctx.closePath();
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      break;
    }

    case "mini-sudoku": {
      // Crisp 3x3 geometric grid emblem
      const box = s * 1.48;
      const x0 = cx - box / 2;
      const y0 = cy - box / 2;
      roundedRectPath(ctx, x0, y0, box, box, s * 0.26);
      ctx.stroke();

      const step = box / 3;
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x0 + step * i, y0);
        ctx.lineTo(x0 + step * i, y0 + box);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x0, y0 + step * i);
        ctx.lineTo(x0 + box, y0 + step * i);
        ctx.stroke();
      }
      break;
    }

    case "patches": {
      // Asymmetric interlocking rectangles
      const gap = s * 0.16;
      const leftW = s * 0.64;
      const rightW = s * 0.68;
      const xL = cx - (leftW + gap + rightW) / 2;
      const xR = xL + leftW + gap;
      const yT = cy - s * 0.74;

      roundedRectPath(ctx, xL, yT, leftW, s * 0.88, s * 0.18);
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();

      roundedRectPath(ctx, xL, yT + s * 0.88 + gap, leftW, s * 0.44, s * 0.16);
      ctx.stroke();

      roundedRectPath(ctx, xR, yT, rightW, s * 0.44, s * 0.16);
      ctx.stroke();

      roundedRectPath(ctx, xR, yT + s * 0.44 + gap, rightW, s * 0.88, s * 0.18);
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      break;
    }

    case "fold": {
      // Stacked translucent glass layers (diamond chevron stack)
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.72);
      ctx.lineTo(cx + s * 0.78, cy - s * 0.28);
      ctx.lineTo(cx, cy + s * 0.16);
      ctx.lineTo(cx - s * 0.78, cy - s * 0.28);
      ctx.closePath();
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - s * 0.78, cy + s * 0.12);
      ctx.lineTo(cx, cy + s * 0.56);
      ctx.lineTo(cx + s * 0.78, cy + s * 0.12);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - s * 0.78, cy + s * 0.48);
      ctx.lineTo(cx, cy + s * 0.92);
      ctx.lineTo(cx + s * 0.78, cy + s * 0.48);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

function drawTrophyIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2.6, size * 0.085);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const s = size / 2;

  // Cup bowl
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.5, cy - s * 0.62);
  ctx.lineTo(cx + s * 0.5, cy - s * 0.62);
  ctx.lineTo(cx + s * 0.42, cy + s * 0.04);
  ctx.quadraticCurveTo(cx + s * 0.36, cy + s * 0.36, cx, cy + s * 0.38);
  ctx.quadraticCurveTo(cx - s * 0.36, cy + s * 0.36, cx - s * 0.42, cy + s * 0.04);
  ctx.closePath();
  ctx.globalAlpha = 0.18;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();

  // Handles
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.5, cy - s * 0.44);
  ctx.quadraticCurveTo(cx - s * 0.88, cy - s * 0.42, cx - s * 0.82, cy - s * 0.08);
  ctx.quadraticCurveTo(cx - s * 0.76, cy + s * 0.16, cx - s * 0.42, cy + s * 0.12);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + s * 0.5, cy - s * 0.44);
  ctx.quadraticCurveTo(cx + s * 0.88, cy - s * 0.42, cx + s * 0.82, cy - s * 0.08);
  ctx.quadraticCurveTo(cx + s * 0.76, cy + s * 0.16, cx + s * 0.42, cy + s * 0.12);
  ctx.stroke();

  // Stem & base
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.38);
  ctx.lineTo(cx, cy + s * 0.72);
  ctx.moveTo(cx - s * 0.42, cy + s * 0.74);
  ctx.lineTo(cx + s * 0.42, cy + s * 0.74);
  ctx.stroke();

  ctx.restore();
}

function drawCheckIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  const r = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2.2, size * 0.13);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.55, cy + r * 0.04);
  ctx.lineTo(cx - r * 0.14, cy + r * 0.45);
  ctx.lineTo(cx + r * 0.58, cy - r * 0.4);
  ctx.stroke();
  ctx.restore();
}

function drawFlameIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  filled: boolean
): void {
  const s = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2.2, size * 0.1);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.84);
  ctx.bezierCurveTo(
    cx + s * 0.58,
    cy - s * 0.26,
    cx + s * 0.74,
    cy + s * 0.32,
    cx + s * 0.32,
    cy + s * 0.74
  );
  ctx.quadraticCurveTo(cx, cy + s * 0.92, cx - s * 0.32, cy + s * 0.74);
  ctx.bezierCurveTo(
    cx - s * 0.74,
    cy + s * 0.32,
    cx - s * 0.58,
    cy - s * 0.26,
    cx,
    cy - s * 0.84
  );
  ctx.closePath();

  if (filled) {
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.stroke();
  ctx.restore();
}

function drawClockIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  const r = size * 0.44;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2.2, size * 0.1);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.52);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + r * 0.38, cy + r * 0.24);
  ctx.stroke();
  ctx.restore();
}

function drawSparkleIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  const r = size * 0.46;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + r * 0.14, cy - r * 0.14, cx + r, cy);
  ctx.quadraticCurveTo(cx + r * 0.14, cy + r * 0.14, cx, cy + r);
  ctx.quadraticCurveTo(cx - r * 0.14, cy + r * 0.14, cx - r, cy);
  ctx.quadraticCurveTo(cx - r * 0.14, cy - r * 0.14, cx, cy - r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLightbulbIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  const s = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2.2, size * 0.1);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.18, s * 0.52, Math.PI * 0.72, Math.PI * 2.28);
  ctx.lineTo(cx + s * 0.24, cy + s * 0.44);
  ctx.lineTo(cx - s * 0.24, cy + s * 0.44);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.2, cy + s * 0.74);
  ctx.lineTo(cx + s * 0.2, cy + s * 0.74);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Shared Header & Footer Sections
// ---------------------------------------------------------------------------

function drawTopHeader(
  ctx: CanvasRenderingContext2D,
  w: number,
  topY: number,
  padX: number,
  dateLabel: string,
  theme: Theme,
  locale: Locale,
  palette: ThemePalette
): void {
  const t = dictionary[locale];
  const logoSize = 66;

  // Brand mark
  drawPolaLogoMark(ctx, padX, topY, logoSize, theme);

  // Wordmark: Pola.
  const wordX = padX + logoSize + 20;
  ctx.save();
  ctx.font = `800 40px ${FONT_DISPLAY}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = palette.textPrimary;
  ctx.fillText(t.appName, wordX, topY + 37);

  const nameWidth = ctx.measureText(t.appName).width;
  ctx.fillStyle = palette.brandDot;
  ctx.fillText(".", wordX + nameWidth + 1, topY + 37);

  // Tagline underneath
  ctx.font = `600 18px ${FONT_SANS}`;
  ctx.fillStyle = palette.textMuted;
  ctx.fillText(t.tagline, wordX, topY + 61);

  // Right date glass pill
  ctx.font = `600 22px ${FONT_SANS}`;
  const dateTextW = ctx.measureText(dateLabel).width;
  const pillW = dateTextW + 44;
  const pillH = 52;
  const pillX = w - padX - pillW;
  const pillY = topY + (logoSize - pillH) / 2;

  drawPill(ctx, pillX, pillY, pillW, pillH, palette.pillBg, palette.pillBorder);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.textSecondary;
  ctx.fillText(dateLabel, pillX + pillW / 2, pillY + pillH / 2 + 1);
  ctx.restore();
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  w: number,
  footerCenterY: number,
  isStory: boolean,
  locale: Locale,
  palette: ThemePalette
): void {
  const s = dictionary[locale].share;
  ctx.save();

  ctx.font = `600 23px ${FONT_SANS}`;
  const prefix = `${s.playAt}  `;
  const prefixW = ctx.measureText(prefix).width;

  ctx.font = `700 25px ${FONT_DISPLAY}`;
  const urlW = ctx.measureText(SHARE_APP_URL).width;

  const pillW = Math.min(w - 112, prefixW + urlW + 76);
  const pillH = 68;
  const pillX = (w - pillW) / 2;
  const pillY = footerCenterY - pillH / 2;

  drawPill(ctx, pillX, pillY, pillW, pillH, palette.pillBg, palette.pillBorder);

  const startX = (w - (prefixW + urlW)) / 2;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  ctx.font = `600 23px ${FONT_SANS}`;
  ctx.fillStyle = palette.textMuted;
  ctx.fillText(prefix, startX, footerCenterY + 1);

  ctx.font = `700 25px ${FONT_DISPLAY}`;
  ctx.fillStyle = palette.textPrimary;
  ctx.fillText(SHARE_APP_URL, startX + prefixW, footerCenterY + 1);

  if (isStory) {
    ctx.font = `500 20px ${FONT_SANS}`;
    ctx.textAlign = "center";
    ctx.fillStyle = palette.textMuted;
    ctx.fillText(s.antiSpoilerNote, w / 2, footerCenterY + 64);
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Single-Game Card Layout
// ---------------------------------------------------------------------------

function drawSingleGameCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  payload: SingleGameSharePayload,
  format: ShareCardFormat,
  theme: Theme,
  locale: Locale
): void {
  const isStory = format === "story";
  const accent = GAME_ACCENTS[payload.game][theme];
  const palette = getThemePalette(theme, accent.orb);
  const t = dictionary[locale];
  const s = t.share;
  const parsedDate = parseLocalDate(payload.dateStr);
  const dateLabel = formatShortDate(parsedDate, locale);
  const weekdayLabel = getLocalizedWeekday(parsedDate, locale);

  drawBackground(ctx, w, h, palette);

  const padX = 72;
  const headerY = isStory ? 136 : 68;
  drawTopHeader(ctx, w, headerY, padX, dateLabel, theme, locale, palette);

  // Main glass card bounds
  const cardX = padX;
  const cardW = w - padX * 2;
  const cardY = isStory ? 286 : 182;
  const cardH = isStory ? 1348 : 986;

  drawGlassCard(ctx, cardX, cardY, cardW, cardH, 48, palette, accent.softBg);

  const cx = w / 2;
  let cursorY = cardY + (isStory ? 104 : 68);

  // 1. Centered glowing emblem squircle
  const emblemSize = isStory ? 148 : 124;
  const emblemX = cx - emblemSize / 2;
  ctx.save();
  roundedRectPath(ctx, emblemX, cursorY, emblemSize, emblemSize, emblemSize * 0.3);
  ctx.fillStyle = accent.softBg;
  ctx.fill();
  ctx.strokeStyle = accent.border;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  drawGameIcon(
    ctx,
    payload.game,
    cx,
    cursorY + emblemSize / 2,
    emblemSize * 0.56,
    accent.primary
  );

  cursorY += emblemSize + (isStory ? 44 : 32);

  // 2. Solved status badge
  ctx.save();
  ctx.font = `700 21px ${FONT_SANS}`;
  const solvedText = s.solvedBadge;
  const solvedW = ctx.measureText(solvedText).width + 64;
  const solvedH = 44;
  const solvedX = cx - solvedW / 2;
  drawPill(
    ctx,
    solvedX,
    cursorY,
    solvedW,
    solvedH,
    palette.successBg,
    palette.successBorder
  );
  drawCheckIcon(ctx, solvedX + 24, cursorY + solvedH / 2, 18, palette.successText);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.successText;
  ctx.fillText(solvedText, solvedX + 42, cursorY + solvedH / 2 + 1);
  ctx.restore();

  cursorY += solvedH + (isStory ? 34 : 24);

  // 3. Game Title
  const gameTitle = getLocalizedGameName(payload.game, locale);
  ctx.save();
  ctx.font = `800 ${isStory ? 84 : 74}px ${FONT_DISPLAY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.textPrimary;
  ctx.fillText(gameTitle, cx, cursorY);
  ctx.restore();

  cursorY += isStory ? 104 : 90;

  // 4. Day / Difficulty Badge
  const badgeParts: string[] = [];
  if (payload.mode === "daily") {
    badgeParts.push(s.dailyDrop);
    badgeParts.push(weekdayLabel);
  } else {
    badgeParts.push(s.unlimitedPlay);
  }
  if (payload.difficulty) {
    badgeParts.push(s.difficulties[payload.difficulty]);
  }
  if (payload.gridSize && payload.gridSize > 0) {
    badgeParts.push(`${payload.gridSize}×${payload.gridSize}`);
  }
  const badgeLabel = badgeParts.join("  ·  ");

  ctx.save();
  ctx.font = `600 24px ${FONT_SANS}`;
  const badgeW = Math.min(cardW - 88, ctx.measureText(badgeLabel).width + 58);
  const badgeH = 52;
  const badgeX = cx - badgeW / 2;
  drawPill(ctx, badgeX, cursorY, badgeW, badgeH, accent.pillBg, accent.border);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = accent.pillText;
  ctx.fillText(badgeLabel, cx, cursorY + badgeH / 2 + 1);
  ctx.restore();

  cursorY += badgeH + (isStory ? 54 : 38);

  // Subtle horizontal divider
  ctx.save();
  ctx.strokeStyle = palette.divider;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX + 72, cursorY);
  ctx.lineTo(cardX + cardW - 72, cursorY);
  ctx.stroke();
  ctx.restore();

  cursorY += isStory ? 56 : 38;

  // 5. Hero Completion Time Block
  ctx.save();
  ctx.font = `700 22px ${FONT_SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.textMuted;
  ctx.fillText(s.completionTime.toUpperCase(), cx, cursorY);
  ctx.restore();

  cursorY += isStory ? 38 : 30;

  const formattedTime = formatDuration(payload.totalSeconds);
  ctx.save();
  ctx.font = `800 ${isStory ? 136 : 118}px ${FONT_DISPLAY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.textPrimary;
  ctx.fillText(formattedTime, cx, cursorY);
  ctx.restore();

  cursorY += isStory ? 176 : 146;

  // 6. Stat Pills Row (Hints, Streak, and optional Rank)
  const hasRank =
    payload.mode === "daily" &&
    typeof payload.dailyRank === "number" &&
    payload.dailyRank > 0;
  const colCount = hasRank ? 3 : 2;
  const innerPadX = 64;
  const colGap = 22;
  const pillW = (cardW - innerPadX * 2 - colGap * (colCount - 1)) / colCount;
  const pillH = isStory ? 180 : 158;
  const rowStartX = cardX + innerPadX;

  interface StatPillSpec {
    label: string;
    value: string;
    valueColor: string;
    icon: "hints" | "clean" | "streak" | "rank";
  }

  const isClean = payload.hintsUsed === 0;
  const stats: StatPillSpec[] = [
    {
      label: s.hintsUsed,
      value: isClean ? s.noHints : String(payload.hintsUsed),
      valueColor: isClean ? palette.successText : palette.textPrimary,
      icon: isClean ? "clean" : "hints",
    },
    {
      label: s.dailyStreak,
      value: formatStreakValue(Math.max(0, payload.streak), locale),
      valueColor: palette.textPrimary,
      icon: "streak",
    },
  ];

  if (hasRank) {
    stats.push({
      label: s.rankLabel,
      value: `#${payload.dailyRank}`,
      valueColor: accent.primary,
      icon: "rank",
    });
  }

  stats.forEach((stat, idx) => {
    const px = rowStartX + idx * (pillW + colGap);
    const py = cursorY;

    ctx.save();
    roundedRectPath(ctx, px, py, pillW, pillH, 28);
    ctx.fillStyle = palette.innerSurface;
    ctx.fill();
    ctx.strokeStyle = palette.innerBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const iconCx = px + pillW / 2;
    const iconCy = py + (isStory ? 44 : 38);

    if (stat.icon === "clean") {
      drawSparkleIcon(ctx, iconCx, iconCy, 28, palette.successText);
    } else if (stat.icon === "hints") {
      drawLightbulbIcon(ctx, iconCx, iconCy, 28, palette.textSecondary);
    } else if (stat.icon === "streak") {
      drawFlameIcon(
        ctx,
        iconCx,
        iconCy,
        28,
        payload.streak > 0 ? palette.flameColor : palette.flameMuted,
        payload.streak > 0
      );
    } else {
      drawTrophyIcon(ctx, iconCx, iconCy, 28, accent.primary);
    }

    ctx.font = `800 ${colCount === 3 ? 36 : 42}px ${FONT_DISPLAY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = stat.valueColor;
    ctx.fillText(stat.value, iconCx, py + (isStory ? 102 : 88));

    ctx.font = `600 20px ${FONT_SANS}`;
    ctx.fillStyle = palette.textMuted;
    ctx.fillText(stat.label, iconCx, py + (isStory ? 144 : 128));
    ctx.restore();
  });

  cursorY += pillH + (isStory ? 54 : 38);

  // 7. Optional @username + Challenge CTA
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (payload.username) {
    ctx.font = `600 23px ${FONT_SANS}`;
    ctx.fillStyle = palette.textSecondary;
    ctx.fillText(`@${payload.username}`, cx, cursorY);
    cursorY += 40;
  }

  ctx.font = `700 ${isStory ? 30 : 27}px ${FONT_DISPLAY}`;
  ctx.fillStyle = accent.primary;
  ctx.fillText(s.beatMyTime, cx, cursorY + 8);
  ctx.restore();

  // Footer
  const footerY = isStory ? h - 152 : h - 88;
  drawFooter(ctx, w, footerY, isStory, locale, palette);
}

// ---------------------------------------------------------------------------
// 6-Game Daily Recap Layout
// ---------------------------------------------------------------------------

function drawDailyRecapCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  payload: DailyRecapSharePayload,
  format: ShareCardFormat,
  theme: Theme,
  locale: Locale
): void {
  const isStory = format === "story";
  const accent = RECAP_ACCENT[theme];
  const palette = getThemePalette(theme, accent.orb);
  const t = dictionary[locale];
  const s = t.share;
  const parsedDate = parseLocalDate(payload.dateStr);
  const dateLabel = formatShortDate(parsedDate, locale);
  const weekdayLabel = getLocalizedWeekday(parsedDate, locale);

  drawBackground(ctx, w, h, palette);

  const padX = 72;
  const headerY = isStory ? 120 : 62;
  drawTopHeader(ctx, w, headerY, padX, dateLabel, theme, locale, palette);

  // Main glass card bounds
  const cardX = padX;
  const cardW = w - padX * 2;
  const cardY = isStory ? 250 : 168;
  const cardH = isStory ? 1404 : 1018;

  drawGlassCard(ctx, cardX, cardY, cardW, cardH, 48, palette, accent.softBg);

  const innerPadX = 56;
  const contentX = cardX + innerPadX;
  const contentW = cardW - innerPadX * 2;
  let cursorY = cardY + (isStory ? 68 : 50);

  // 1. Recap Hero Row (Trophy Emblem + 6/6 Badge + Title + Weekday Subtitle)
  const emblemSize = isStory ? 108 : 96;
  ctx.save();
  roundedRectPath(ctx, contentX, cursorY, emblemSize, emblemSize, 28);
  ctx.fillStyle = accent.softBg;
  ctx.fill();
  ctx.strokeStyle = accent.border;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  drawTrophyIcon(
    ctx,
    contentX + emblemSize / 2,
    cursorY + emblemSize / 2,
    emblemSize * 0.56,
    accent.primary
  );

  const titleX = contentX + emblemSize + 28;
  ctx.save();
  // 6 / 6 CLEARED pill
  ctx.font = `700 19px ${FONT_SANS}`;
  const badgeText = s.allSixBadge;
  const badgeW = ctx.measureText(badgeText).width + 52;
  const badgeH = 36;
  drawPill(
    ctx,
    titleX,
    cursorY + 2,
    badgeW,
    badgeH,
    palette.successBg,
    palette.successBorder
  );
  drawSparkleIcon(ctx, titleX + 20, cursorY + 2 + badgeH / 2, 16, palette.flameColor);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.successText;
  ctx.fillText(badgeText, titleX + 36, cursorY + 2 + badgeH / 2 + 1);

  // Title
  ctx.font = `800 ${isStory ? 54 : 48}px ${FONT_DISPLAY}`;
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.textPrimary;
  ctx.fillText(s.dailyRecapTitle, titleX, cursorY + 46);

  // Weekday + Subtitle (plus optional @username)
  const subtitleText = payload.username
    ? `${weekdayLabel} · @${payload.username}`
    : `${weekdayLabel} · ${s.dailyRecapSubtitle}`;
  ctx.font = `600 22px ${FONT_SANS}`;
  ctx.fillStyle = palette.textSecondary;
  ctx.fillText(subtitleText, titleX, cursorY + (isStory ? 106 : 98));
  ctx.restore();

  cursorY += emblemSize + (isStory ? 56 : 44);

  // 2. Summary Stats Bar (Total Time, Streak, Total Hints)
  const totalHints =
    typeof payload.totalHintsUsed === "number"
      ? payload.totalHintsUsed
      : payload.games.reduce((acc, g) => acc + Math.max(0, g.hintsUsed), 0);

  const summaryGap = 18;
  const summaryW = (contentW - summaryGap * 2) / 3;
  const summaryH = isStory ? 156 : 136;

  const summaryItems = [
    {
      icon: "clock" as const,
      value: formatDuration(payload.totalSeconds),
      label: s.totalTime,
      valueColor: palette.textPrimary,
    },
    {
      icon: "flame" as const,
      value: formatStreakValue(Math.max(0, payload.streak), locale),
      label: s.dailyStreak,
      valueColor: palette.textPrimary,
    },
    {
      icon: totalHints === 0 ? ("clean" as const) : ("hints" as const),
      value: totalHints === 0 ? s.noHints : String(totalHints),
      label: s.hintsUsed,
      valueColor: totalHints === 0 ? palette.successText : palette.textPrimary,
    },
  ];

  summaryItems.forEach((item, idx) => {
    const sx = contentX + idx * (summaryW + summaryGap);
    const sy = cursorY;

    ctx.save();
    roundedRectPath(ctx, sx, sy, summaryW, summaryH, 26);
    ctx.fillStyle = palette.innerSurface;
    ctx.fill();
    ctx.strokeStyle = palette.innerBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const icx = sx + summaryW / 2;
    const icy = sy + (isStory ? 38 : 32);

    if (item.icon === "clock") {
      drawClockIcon(ctx, icx, icy, 26, palette.textSecondary);
    } else if (item.icon === "flame") {
      drawFlameIcon(
        ctx,
        icx,
        icy,
        26,
        payload.streak > 0 ? palette.flameColor : palette.flameMuted,
        payload.streak > 0
      );
    } else if (item.icon === "clean") {
      drawSparkleIcon(ctx, icx, icy, 26, palette.successText);
    } else {
      drawLightbulbIcon(ctx, icx, icy, 26, palette.textSecondary);
    }

    ctx.font = `800 ${isStory ? 38 : 34}px ${FONT_DISPLAY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = item.valueColor;
    ctx.fillText(item.value, icx, sy + (isStory ? 88 : 76));

    ctx.font = `600 18px ${FONT_SANS}`;
    ctx.fillStyle = palette.textMuted;
    ctx.fillText(item.label, icx, sy + (isStory ? 126 : 112));
    ctx.restore();
  });

  cursorY += summaryH + (isStory ? 44 : 34);

  // 3. 6-Game Breakdown (1×6 rows in Story, 2×3 grid in Compact)
  const sortedGames = [...payload.games]
    .sort(
      (a, b) =>
        CANONICAL_GAME_ORDER.indexOf(a.game) - CANONICAL_GAME_ORDER.indexOf(b.game)
    )
    .slice(0, 6);

  if (isStory) {
    // 1 column × 6 spacious rows
    const rowGap = 20;
    const rowH = 122;

    sortedGames.forEach((item, idx) => {
      const ry = cursorY + idx * (rowH + rowGap);
      const gameAccent = GAME_ACCENTS[item.game][theme];

      ctx.save();
      roundedRectPath(ctx, contentX, ry, contentW, rowH, 28);
      ctx.fillStyle = palette.innerSurface;
      ctx.fill();
      ctx.strokeStyle = gameAccent.border;
      ctx.lineWidth = 1.75;
      ctx.stroke();

      // Left icon box
      const iconBox = 76;
      const iconX = contentX + 24;
      const iconY = ry + (rowH - iconBox) / 2;
      roundedRectPath(ctx, iconX, iconY, iconBox, iconBox, 20);
      ctx.fillStyle = gameAccent.softBg;
      ctx.fill();
      drawGameIcon(
        ctx,
        item.game,
        iconX + iconBox / 2,
        iconY + iconBox / 2,
        iconBox * 0.56,
        gameAccent.primary
      );

      // Game name + meta (difficulty / hints)
      const textX = iconX + iconBox + 24;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = `700 32px ${FONT_DISPLAY}`;
      ctx.fillStyle = palette.textPrimary;
      ctx.fillText(getLocalizedGameName(item.game, locale), textX, ry + rowH * 0.38);

      const metaParts: string[] = [];
      if (item.difficulty) {
        metaParts.push(s.difficulties[item.difficulty]);
      }
      metaParts.push(
        item.hintsUsed === 0 ? s.noHints : `${item.hintsUsed} ${s.hintsUsed}`
      );
      ctx.font = `600 20px ${FONT_SANS}`;
      ctx.fillStyle = palette.textMuted;
      ctx.fillText(metaParts.join(" · "), textX, ry + rowH * 0.7);

      // Right completion time + solved check pill
      const rightX = contentX + contentW - 28;
      ctx.textAlign = "right";
      ctx.font = `800 34px ${FONT_DISPLAY}`;
      ctx.fillStyle = palette.textPrimary;
      ctx.fillText(formatDuration(item.totalSeconds), rightX - 42, ry + rowH / 2 + 1);

      // Check badge circle
      const checkCx = rightX - 14;
      const checkCy = ry + rowH / 2;
      ctx.beginPath();
      ctx.arc(checkCx, checkCy, 16, 0, Math.PI * 2);
      ctx.fillStyle = palette.successBg;
      ctx.fill();
      drawCheckIcon(ctx, checkCx, checkCy, 16, palette.successText);

      ctx.restore();
    });

    cursorY += sortedGames.length * (rowH + rowGap) + 28;
  } else {
    // 2 columns × 3 rows for 4:5 compact card
    const colGap = 20;
    const rowGap = 20;
    const tileW = (contentW - colGap) / 2;
    const tileH = 166;

    sortedGames.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const tx = contentX + col * (tileW + colGap);
      const ty = cursorY + row * (tileH + rowGap);
      const gameAccent = GAME_ACCENTS[item.game][theme];

      ctx.save();
      roundedRectPath(ctx, tx, ty, tileW, tileH, 28);
      ctx.fillStyle = palette.innerSurface;
      ctx.fill();
      ctx.strokeStyle = gameAccent.border;
      ctx.lineWidth = 1.75;
      ctx.stroke();

      // Top row: Icon box + Game name + check circle
      const iconBox = 56;
      const iconX = tx + 22;
      const iconY = ty + 22;
      roundedRectPath(ctx, iconX, iconY, iconBox, iconBox, 16);
      ctx.fillStyle = gameAccent.softBg;
      ctx.fill();
      drawGameIcon(
        ctx,
        item.game,
        iconX + iconBox / 2,
        iconY + iconBox / 2,
        iconBox * 0.56,
        gameAccent.primary
      );

      // Check circle top-right
      const checkCx = tx + tileW - 34;
      const checkCy = iconY + iconBox / 2;
      ctx.beginPath();
      ctx.arc(checkCx, checkCy, 15, 0, Math.PI * 2);
      ctx.fillStyle = palette.successBg;
      ctx.fill();
      drawCheckIcon(ctx, checkCx, checkCy, 15, palette.successText);

      // Game name
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = `700 26px ${FONT_DISPLAY}`;
      ctx.fillStyle = palette.textPrimary;
      ctx.fillText(
        getLocalizedGameName(item.game, locale),
        iconX + iconBox + 16,
        iconY + iconBox / 2 + 1
      );

      // Bottom row: Time + hint/difficulty micro label
      ctx.font = `800 36px ${FONT_DISPLAY}`;
      ctx.fillStyle = palette.textPrimary;
      ctx.fillText(formatDuration(item.totalSeconds), tx + 24, ty + tileH - 38);

      const microText =
        item.hintsUsed === 0
          ? s.noHints
          : `${item.hintsUsed} ${s.hintsUsed}`;
      ctx.textAlign = "right";
      ctx.font = `600 19px ${FONT_SANS}`;
      ctx.fillStyle =
        item.hintsUsed === 0 ? palette.successText : palette.textMuted;
      ctx.fillText(microText, tx + tileW - 24, ty + tileH - 36);

      ctx.restore();
    });

    const rows = Math.ceil(sortedGames.length / 2);
    cursorY += rows * (tileH + rowGap) + 18;
  }

  // 4. Playful challenge line at bottom of card
  ctx.save();
  ctx.font = `700 ${isStory ? 30 : 26}px ${FONT_DISPLAY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = accent.primary;
  ctx.fillText(s.beatMyRecap, w / 2, Math.min(cursorY + 12, cardY + cardH - 42));
  ctx.restore();

  // Footer
  const footerY = isStory ? h - 140 : h - 82;
  drawFooter(ctx, w, footerY, isStory, locale, palette);
}

// ---------------------------------------------------------------------------
// Public Render & Export Helpers
// ---------------------------------------------------------------------------

async function ensureFontsReady(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await document.fonts.ready;
  } catch {
    // Proceed with fallback system fonts if font loading API fails
  }
}

export async function renderShareCardToCanvas(
  options: RenderShareCardOptions
): Promise<HTMLCanvasElement> {
  if (typeof document === "undefined") {
    throw new Error("renderShareCardToCanvas can only run in a browser environment.");
  }

  await ensureFontsReady();

  const { width, height } = SHARE_CARD_DIMENSIONS[options.format];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to acquire 2D canvas context.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (options.payload.kind === "recap") {
    drawDailyRecapCard(
      ctx,
      width,
      height,
      options.payload,
      options.format,
      options.theme,
      options.locale
    );
  } else {
    drawSingleGameCard(
      ctx,
      width,
      height,
      options.payload,
      options.format,
      options.theme,
      options.locale
    );
  }

  return canvas;
}

export async function renderShareCardBlob(
  options: RenderShareCardOptions
): Promise<Blob> {
  const canvas = await renderShareCardToCanvas(options);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to encode share card canvas to PNG Blob."));
        }
      },
      "image/png",
      1
    );
  });
}

export async function renderShareCardFile(
  options: RenderShareCardOptions
): Promise<File> {
  const blob = await renderShareCardBlob(options);
  const filename = getShareCardFilename(options.payload, options.format);
  return new File([blob], filename, { type: "image/png" });
}

export async function renderShareCardDataUrl(
  options: RenderShareCardOptions
): Promise<string> {
  const canvas = await renderShareCardToCanvas(options);
  return canvas.toDataURL("image/png");
}
