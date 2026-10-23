"use client";

/**
 * Install-prompt singleton (module scope — never persisted, the event object
 * is not serializable). Captures Chrome/Edge's beforeinstallprompt so the
 * Download dialog can trigger the real native install flow later.
 */

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

let deferred: InstallPromptEvent | null = null;
let installed = false;

const CHANGE_EVENT = "moddeck:installstate";

export function captureInstallPrompt(e: Event) {
  e.preventDefault();
  deferred = e as InstallPromptEvent;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function markInstalled() {
  installed = true;
  deferred = null;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getInstallPrompt(): InstallPromptEvent | null {
  return deferred;
}

export function isMarkedInstalled() {
  return installed;
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const e = deferred;
  if (!e) return "unavailable";
  deferred = null;
  /* guard against environments where the native prompt has no UI (headless,
     kiosk) and userChoice never settles — bail to manual instructions */
  const outcome = await Promise.race([
    e.prompt()
      .then(() => e.userChoice)
      .then((c) => c.outcome),
    new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 12000)),
  ]);
  if (outcome === "accepted") installed = true;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
  return outcome === "timeout" ? "unavailable" : outcome;
}

/** true when the page is running as an installed desktop app */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
