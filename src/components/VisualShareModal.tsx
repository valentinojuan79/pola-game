"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Download,
  Loader2,
  RectangleVertical,
  Share2,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { dictionary, type Locale } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import type { PolaGameType } from "@/lib/storage";
import type { Theme } from "@/lib/theme";
import {
  SHARE_APP_URL,
  getShareCardFilename,
  renderShareCardBlob,
  renderShareCardDataUrl,
  renderShareCardFile,
  type ShareCardFormat,
  type ShareCardPayload,
} from "@/lib/shareCardRenderer";

export interface VisualShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: ShareCardPayload;
  theme: Theme;
  lang: Locale;
  /** Optional custom share caption; defaults to a localized spoiler-free message. */
  shareText?: string;
}

const PRIMARY_BUTTON_CLASSES: Record<PolaGameType | "recap", string> = {
  queens:
    "bg-[#D97706] shadow-[0_6px_18px_-4px_rgba(180,83,9,0.34)] hover:bg-[#B45309] dark:bg-amber-400/95 dark:text-neutral-950 dark:hover:bg-amber-300",
  zip:
    "bg-[#0369A1] shadow-[0_6px_18px_-4px_rgba(3,105,161,0.34)] hover:bg-[#075985] dark:bg-sky-400/95 dark:text-neutral-950 dark:hover:bg-sky-300",
  tango:
    "bg-[#EA580C] shadow-[0_6px_18px_-4px_rgba(234,88,12,0.34)] hover:bg-[#C2410C] dark:bg-orange-400/95 dark:text-neutral-950 dark:hover:bg-orange-300",
  "mini-sudoku":
    "bg-[#059669] shadow-[0_6px_18px_-4px_rgba(5,150,105,0.34)] hover:bg-[#047857] dark:bg-emerald-400/95 dark:text-neutral-950 dark:hover:bg-emerald-300",
  patches:
    "bg-[#E11D48] shadow-[0_6px_18px_-4px_rgba(225,29,72,0.34)] hover:bg-[#BE123C] dark:bg-rose-400/95 dark:text-neutral-950 dark:hover:bg-rose-300",
  fold:
    "bg-[#4F46E5] shadow-[0_6px_18px_-4px_rgba(79,70,229,0.34)] hover:bg-[#4338CA] dark:bg-indigo-400/95 dark:text-neutral-950 dark:hover:bg-indigo-300",
  recap:
    "bg-[#059669] shadow-[0_6px_18px_-4px_rgba(5,150,105,0.34)] hover:bg-[#047857] dark:bg-emerald-400/95 dark:text-neutral-950 dark:hover:bg-emerald-300",
};

function getGameDisplayName(game: PolaGameType, lang: Locale): string {
  const g = dictionary[lang].games;
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

function triggerPngDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1500);
}

export function VisualShareModal({
  isOpen,
  onClose,
  payload,
  theme,
  lang,
  shareText,
}: VisualShareModalProps) {
  const t = dictionary[lang];
  const s = t.share;

  const [format, setFormat] = useState<ShareCardFormat>("compact");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Reset to compact format when modal opens fresh
  useEffect(() => {
    if (isOpen) {
      setFormat("compact");
      setSavedNotice(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Render live PNG preview whenever modal opens or inputs change
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsRendering(true);

    renderShareCardDataUrl({
      payload,
      format,
      theme,
      locale: lang,
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setPreviewUrl(dataUrl);
          setIsRendering(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsRendering(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, payload, format, theme, lang]);

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;
    feedback.pop();
    setIsDownloading(true);
    try {
      const blob = await renderShareCardBlob({
        payload,
        format,
        theme,
        locale: lang,
      });
      const filename = getShareCardFilename(payload, format);
      triggerPngDownload(blob, filename);
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 2200);
    } finally {
      setIsDownloading(false);
    }
  }, [format, isDownloading, lang, payload, theme]);

  const handleNativeShare = useCallback(async () => {
    if (isSharing) return;
    feedback.pop();
    setIsSharing(true);

    try {
      const file = await renderShareCardFile({
        payload,
        format,
        theme,
        locale: lang,
      });

      const title =
        payload.kind === "recap"
          ? `${t.appName} · ${s.dailyRecapTitle}`
          : `${t.appName} · ${getGameDisplayName(payload.game, lang)}`;

      const defaultCaption =
        payload.kind === "recap"
          ? `${s.beatMyRecap} https://${SHARE_APP_URL}`
          : `${s.beatMyTime} https://${SHARE_APP_URL}`;

      const text = shareText ?? defaultCaption;

      const canShareFiles =
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({
            files: [file],
            title,
            text,
          });
          return;
        } catch (err) {
          // Gracefully ignore user dismissing the iOS/OS Share Sheet
          if (err instanceof Error && err.name === "AbortError") {
            return;
          }
          // Fall through to direct download on unexpected share failure
        }
      }

      // Automatic fallback when native file sharing isn't supported
      const filename = getShareCardFilename(payload, format);
      triggerPngDownload(file, filename);
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 2200);
    } finally {
      setIsSharing(false);
    }
  }, [format, isSharing, lang, payload, s, shareText, t.appName, theme]);

  const accentKey: PolaGameType | "recap" =
    payload.kind === "recap" ? "recap" : payload.game;
  const primaryBtnTone = PRIMARY_BUTTON_CLASSES[accentKey];

  const modalTitle =
    payload.kind === "recap" ? s.recapModalTitle : s.modalTitle;
  const formatHint =
    format === "story" ? s.formatStoryHint : s.formatCompactHint;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="visual-share-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:items-center sm:p-5"
        >
          {/* Frosted backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              feedback.click();
              onClose();
            }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/65"
          />

          {/* iOS Liquid Glass Sheet / Modal */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.85,
            }}
            className="glass-modal relative z-10 flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.5rem)] w-full max-w-[400px] flex-col overflow-hidden rounded-[30px] p-5"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="visual-share-modal-title"
                  className="font-display truncate text-[20px] font-bold tracking-tight text-neutral-950 dark:text-white"
                >
                  {modalTitle}
                </h2>
                <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-400">
                  {formatHint}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  feedback.click();
                  onClose();
                }}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-neutral-600 transition-colors hover:bg-black/[0.1] active:scale-95 dark:bg-white/[0.09] dark:text-neutral-300 dark:hover:bg-white/[0.14]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Aspect Ratio Segmented Control */}
            <div className="mt-3.5 shrink-0">
              <div className="relative grid grid-cols-2 gap-1 rounded-2xl bg-black/[0.05] p-1 dark:bg-white/[0.07]">
                {(
                  [
                    {
                      id: "compact" as const,
                      label: s.formatCompact,
                      icon: RectangleVertical,
                    },
                    {
                      id: "story" as const,
                      label: s.formatStory,
                      icon: Smartphone,
                    },
                  ] as const
                ).map((option) => {
                  const active = format === option.id;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (format !== option.id) {
                          feedback.click();
                          setFormat(option.id);
                        }
                      }}
                      className={`relative z-10 flex items-center justify-center gap-1.5 rounded-[13px] py-2 text-[13px] font-semibold transition-colors ${
                        active
                          ? "text-neutral-950 dark:text-white"
                          : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="visual-share-format-pill"
                          transition={{
                            type: "spring",
                            stiffness: 460,
                            damping: 32,
                          }}
                          className="absolute inset-0 -z-10 rounded-[13px] bg-white shadow-[0_2px_10px_-2px_rgba(15,23,42,0.12)] dark:bg-white/[0.14] dark:shadow-[0_2px_10px_-2px_rgba(0,0,0,0.45)]"
                        />
                      )}
                      <Icon className="h-3.5 w-3.5" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live PNG Preview Stage — height-capped so 9:16 fits iOS Safari without overflow */}
            <div className="mt-3.5 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[22px] border border-black/[0.06] bg-black/[0.03] p-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
              <div
                className={`relative flex max-h-[44dvh] items-center justify-center overflow-hidden rounded-[18px] shadow-[0_14px_34px_-10px_rgba(15,23,42,0.22)] ring-1 ring-black/[0.07] transition-all duration-200 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.7)] dark:ring-white/[0.12] ${
                  format === "story"
                    ? "aspect-[9/16] h-[44dvh] max-w-full"
                    : "aspect-[4/5] h-[42dvh] max-w-full"
                }`}
              >
                {previewUrl && (
                  <motion.img
                    key={`${format}-${theme}-${lang}`}
                    src={previewUrl}
                    alt={modalTitle}
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: isRendering ? 0.45 : 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="h-full w-full object-contain select-none"
                    draggable={false}
                  />
                )}

                {(isRendering || !previewUrl) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 backdrop-blur-xs dark:bg-neutral-950/60">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-700 dark:text-neutral-200" />
                    <span className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
                      {s.generating}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Anti-spoiler assurance note */}
            <div className="mt-2.5 flex shrink-0 items-center justify-center gap-1.5 text-center text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{s.antiSpoilerNote}</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-3.5 shrink-0 space-y-2">
              <button
                type="button"
                onClick={handleNativeShare}
                disabled={isRendering || isSharing}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 ${primaryBtnTone}`}
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                <span>{s.shareNow}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isRendering || isDownloading}
                className="glass-card flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13.5px] font-semibold text-neutral-900 transition-all hover:bg-white/85 active:scale-[0.98] disabled:opacity-60 dark:text-white dark:hover:bg-white/[0.1]"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : savedNotice ? (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{savedNotice ? s.saved : s.saveImage}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
