"use client";

import { useState } from "react";
import { ONBOARDING_STEPS } from "./onboarding-steps";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/lib/ui-classes";

export function OnboardingWizard({
  initialOpen,
  onFinishAction,
}: {
  initialOpen: boolean;
  onFinishAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [stepIndex, setStepIndex] = useState(0);

  if (!open) return null;

  const step = ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  function close() {
    setOpen(false);
    onFinishAction();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <p className="text-xs font-medium text-slate-400">
            Langkah {stepIndex + 1} dari {ONBOARDING_STEPS.length}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Tutup panduan"
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {step.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={step.image}
              alt=""
              className="mb-4 w-full rounded-md border border-slate-200"
            />
          )}
          <h2 className="mb-2 text-lg font-semibold text-slate-900">{step.title}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-5 py-3">
          <button type="button" onClick={close} className={BUTTON_SECONDARY}>
            Lewati
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((index) => index - 1)}
                className={BUTTON_SECONDARY}
              >
                Sebelumnya
              </button>
            )}
            {isLastStep ? (
              <button type="button" onClick={close} className={BUTTON_PRIMARY}>
                Selesai
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepIndex((index) => index + 1)}
                className={BUTTON_PRIMARY}
              >
                Selanjutnya
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
