"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { feedback } from "@/lib/feedback";

interface TutorialModalFooterProps {
  isAutoTutorial: boolean;
  manualLabel: string;
  accentButtonClass: string;
  onDismiss: () => void;
  onSkipAll: () => void;
}

export function TutorialModalFooter({
  isAutoTutorial,
  manualLabel,
  accentButtonClass,
  onDismiss,
  onSkipAll,
}: TutorialModalFooterProps) {
  const { t } = useI18n();

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => {
          feedback.click();
          onDismiss();
        }}
        className={`w-full rounded-2xl py-3 text-[14px] font-semibold transition-colors active:scale-[0.98] ${accentButtonClass}`}
      >
        {isAutoTutorial ? t.tutorial.gotItPlay : manualLabel}
      </button>

      {isAutoTutorial && (
        <button
          type="button"
          onClick={() => {
            feedback.click();
            onSkipAll();
          }}
          className="mt-2 w-full py-1.5 text-center text-[12px] font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          {t.tutorial.skipAllOthers}
        </button>
      )}
    </div>
  );
}
