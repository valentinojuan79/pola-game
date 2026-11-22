"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, User, Lock, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";
import {
  isSupabaseConfigured,
  signInWithUsername,
  signUpWithUsername,
  type PolaUser,
} from "@/lib/supabase";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (user: PolaUser) => void;
}

export function AuthModal({ open, onClose, onAuthenticated }: AuthModalProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    feedback.click();

    const result =
      mode === "signup"
        ? await signUpWithUsername(username, password)
        : await signInWithUsername(username, password);

    setLoading(false);

    if (result.error || !result.user) {
      feedback.warn();
      setError(result.error ?? "Authentication failed.");
      return;
    }

    feedback.pop();
    setUsername("");
    setPassword("");
    onAuthenticated(result.user);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/35 backdrop-blur-xs dark:bg-black/60"
          />

          <motion.div
            initial={{ y: 48, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 36, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="glass-modal relative z-10 m-4 w-full max-w-[390px] rounded-[28px] p-6"
          >
            <button
              type="button"
              onClick={() => {
                feedback.click();
                onClose();
              }}
              aria-label="Close"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-neutral-600 transition-colors hover:bg-black/[0.1] dark:bg-white/[0.08] dark:text-neutral-300"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-[20px] font-semibold tracking-tight text-neutral-950 dark:text-white">
              {mode === "signup" ? t.auth.titleSignUp : t.auth.titleSignIn}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {t.auth.subtitle}
            </p>

            {!isSupabaseConfigured && (
              <div className="mt-3 rounded-2xl bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                {t.auth.localModeHint}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                  {t.auth.username}
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.auth.usernamePlaceholder}
                    className="w-full rounded-2xl border border-black/10 bg-white/75 py-2.5 pr-4 pl-10 text-[14px] text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-white/12 dark:bg-white/[0.06] dark:text-white dark:focus:border-white/40"
                  />
                </div>
                <p className="mt-1 text-[11px] text-neutral-400">
                  {t.auth.usernameRule}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                  {t.auth.password}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder}
                    className="w-full rounded-2xl border border-black/10 bg-white/75 py-2.5 pr-4 pl-10 text-[14px] text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-white/12 dark:bg-white/[0.06] dark:text-white dark:focus:border-white/40"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-500/10 px-3 py-2 text-[12px] font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 py-3 text-[14px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60 dark:bg-white dark:text-neutral-950"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signup" ? t.auth.submitSignUp : t.auth.submitSignIn}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                feedback.click();
                setError(null);
                setMode(mode === "signup" ? "signin" : "signup");
              }}
              className="mt-4 w-full text-center text-[12px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              {mode === "signup" ? t.auth.switchToSignIn : t.auth.switchToSignUp}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
