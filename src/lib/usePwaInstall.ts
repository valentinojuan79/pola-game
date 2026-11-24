"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export type PwaInstallOutcome = "accepted" | "dismissed" | "ios" | "unavailable";

export interface UsePwaInstallResult {
  /** True when the app is already running in standalone PWA mode. */
  isStandalone: boolean;
  /** True on iPhone, iPad, iPod, or iPadOS desktop-mode Safari/browsers. */
  isIOS: boolean;
  /** True when Chromium's native beforeinstallprompt event is ready. */
  hasNativePrompt: boolean;
  /** True when the Install UI should be shown (regular browser + native prompt or iOS). */
  canInstall: boolean;
  /** Triggers the native OS install dialog on Chromium, or returns "ios" on iOS. */
  promptInstall: () => Promise<PwaInstallOutcome>;
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mediaStandalone =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  const navStandalone =
    (window.navigator as NavigatorWithStandalone).standalone === true;
  return mediaStandalone || navStandalone;
}

function detectIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || "";
  const isClassicIOS = /iPhone|iPad|iPod/i.test(ua);
  // iPadOS 13+ reports Macintosh in UA with touch support
  const isIPadOS =
    window.navigator.platform === "MacIntel" &&
    window.navigator.maxTouchPoints > 1;
  return isClassicIOS || isIPadOS;
}

export function usePwaInstall(): UsePwaInstallResult {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone = detectStandalone();
    setIsStandalone(standalone);

    if (standalone) {
      return;
    }

    setIsIOS(detectIOS());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(display-mode: standalone)")
        : null;

    const handleDisplayModeChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsStandalone(true);
        setDeferredPrompt(null);
      }
    };

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", handleDisplayModeChange);
      }
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<PwaInstallOutcome> => {
    if (isStandalone) return "unavailable";

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (outcome === "accepted") {
          setIsStandalone(true);
        }
        return outcome;
      } catch {
        setDeferredPrompt(null);
        return "unavailable";
      }
    }

    if (isIOS) {
      return "ios";
    }

    return "unavailable";
  }, [deferredPrompt, isIOS, isStandalone]);

  const hasNativePrompt = deferredPrompt !== null;
  const canInstall = !isStandalone && (hasNativePrompt || isIOS);

  return {
    isStandalone,
    isIOS,
    hasNativePrompt,
    canInstall,
    promptInstall,
  };
}
