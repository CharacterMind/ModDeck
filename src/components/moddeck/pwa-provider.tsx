"use client";

import { useEffect } from "react";
import {
  captureInstallPrompt,
  isStandalone,
  markInstalled,
} from "@/lib/pwa";
import { useModDeck } from "@/lib/moddeck-store";
import { DownloadDialog } from "@/components/moddeck/download-dialog";
import { ReferralDialog } from "@/components/moddeck/referral-dialog";
import { AuthDialog } from "@/components/moddeck/auth-dialog";

/**
 * Desktop-app plumbing:
 *  - registers the service worker (production only, dev HMR stays untouched)
 *  - captures the browser's native install prompt for the Download dialog
 *  - detects when the app runs as an installed desktop app and, on first run,
 *    asks "How did you hear about us?"
 */
export function PwaProvider() {
  useEffect(() => {
    /* SW registration — production only */
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    /* native install prompt capture */
    const onBip = (e: Event) => captureInstallPrompt(e);
    const onInstalled = () => markInstalled();
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    /* installed desktop app detection */
    const store = useModDeck.getState;
    const standalone = isStandalone();
    store().setInstalled(standalone);

    /* first run inside the installed app → referral survey */
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (standalone && !store().asked) {
      let show = true;
      try {
        if (localStorage.getItem("moddeck:standalone-asked")) show = false;
        else localStorage.setItem("moddeck:standalone-asked", "1");
      } catch {
        /* localStorage unavailable — still show once per session */
      }
      if (show) timer = setTimeout(() => store().setSurveyOpen(true), 1200);
    }

    return () => {
      if (typeof timer !== "undefined") clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return (
    <>
      <DownloadDialog />
      <ReferralDialog />
      <AuthDialog />
    </>
  );
}
