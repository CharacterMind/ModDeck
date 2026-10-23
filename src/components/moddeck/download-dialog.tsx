"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Download,
  FolderDown,
  Info,
  Monitor,
  MousePointerClick,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { promptInstall } from "@/lib/pwa";
import { useModDeck } from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Step = "main" | "downloading" | "manual" | "done";
type Platform = "Windows" | "macOS" | "Linux";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "Windows";
  const ua = navigator.userAgent;
  if (/Mac|iPhone|iPad/i.test(ua)) return "macOS";
  if (/Linux|X11/i.test(ua) && !/Android/i.test(ua)) return "Linux";
  return "Windows";
}

/**
 * "Get the desktop app" flow. On Chromium browsers it triggers the REAL native
 * install prompt (beforeinstallprompt); everywhere else it walks the user
 * through their browser's built-in install action. ModDeck installs as a PWA —
 * its own window, Start menu / dock icon, offline shell.
 */
export function DownloadDialog() {
  const open = useModDeck((s) => s.downloadOpen);
  const setOpen = useModDeck((s) => s.setDownloadOpen);
  const installed = useModDeck((s) => s.installed);
  const setInstalled = useModDeck((s) => s.setInstalled);
  const setSurveyOpen = useModDeck((s) => s.setSurveyOpen);
  const referralAnswered = useModDeck((s) => s.referral.answered);

  const [step, setStep] = useState<Step>("main");
  const [platform] = useState<Platform>(detectPlatform);
  const [started, setStarted] = useState(false); // drives the CSS progress bar

  const close = (v: boolean) => {
    setOpen(v);
    if (!v) {
      /* reset transient step state so reopening starts fresh */
      setTimeout(() => {
        setStep("main");
        setStarted(false);
      }, 250);
    }
  };

  const download = async () => {
    setStep("downloading");
    setStarted(true); // progress bar runs immediately on every path
    const outcome = await promptInstall();
    if (outcome === "accepted") {
      setInstalled(true);
      setStep("done");
      toast.success("ModDeck installed!", {
        description: `Find it in your ${platform === "macOS" ? "Applications folder / Launchpad" : "Start menu"} — it runs in its own window.`,
      });
    } else {
      /* dismissed, unsupported, or headless — let the bar finish, then manual steps */
      setTimeout(() => setStep("manual"), 2400);
    }
  };

  const afterInstall = () => {
    close(false);
    if (!referralAnswered) {
      toast("One quick question…", {
        description: "How did you hear about ModDeck?",
      });
      setTimeout(() => setSurveyOpen(true), 350);
    } else {
      toast.success("You're all set — welcome to the ModDeck desktop app");
    }
  };

  const browserSteps =
    platform === "macOS"
      ? [
          "Click the Share icon in Safari's toolbar",
          'Choose "Add to Dock"',
          "Click Add — ModDeck appears in your Dock",
        ]
      : [
          "Click the ⋮ menu (or the install icon in the address bar)",
          'Choose "Install app" / "Install ModDeck"',
          "Confirm — ModDeck lands in your Start menu",
        ];

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto border-white/10 bg-popover p-0 scrollbar-slim sm:max-w-md">
        {/* header */}
        <div className="border-b border-white/8 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Monitor className="h-4.5 w-4.5 text-primary" />
            </span>
            <div>
              <DialogTitle className="text-left text-lg font-black tracking-tight text-foreground">
                Get the ModDeck desktop app
              </DialogTitle>
              <DialogDescription className="text-left text-[11px]">
                Own window · Start menu icon · works offline · auto-updates
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ---------------- main ---------------- */}
        {step === "main" && (
          <div className="px-6 py-5">
            {installed ? (
              <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                <p className="text-[13px] font-semibold text-foreground">
                  ModDeck is installed — you&apos;re running the desktop app right now.
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={download}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/20 to-primary/5 p-4 text-left transition-all",
                    "hover:border-primary hover:shadow-[0_0_28px_-8px_var(--primary)]"
                  )}
                  aria-label={`Download ModDeck for ${platform}`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_20px_-4px_var(--primary)] transition-transform group-hover:scale-105">
                    <Download className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-black text-foreground">
                      Download for {platform}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      Free · ~2 MB · Windows, macOS &amp; Linux
                    </span>
                  </span>
                  <Rocket className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                </button>

                {/* Real Windows companion — detects running games */}
                <a
                  href="/companion/ModDeck-Companion.zip"
                  download
                  className="group mt-3 flex w-full items-center gap-4 rounded-xl border border-white/10 bg-panel/60 p-4 text-left transition-all hover:border-primary/50 hover:bg-panel"
                  aria-label="Download ModDeck Companion for Windows"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                    <Monitor className="h-6 w-6 text-primary" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-black text-foreground">
                      ModDeck Companion{" "}
                      <span className="ml-1 rounded bg-primary/15 px-1.5 py-0.5 align-middle text-[9px] font-black tracking-wider text-primary">
                        WINDOWS
                      </span>
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      Detects your running game — press Play, get the trainer. 3 KB.
                    </span>
                  </span>
                  <Rocket className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-y-0.5" />
                </a>

                <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground">
                  <Info className="mt-px h-3 w-3 shrink-0" />
                  ModDeck installs as a real desktop app (PWA): your browser handles the install
                  — no antivirus dance, no admin rights — and it opens in its own window like any
                  native program.
                </p>
              </>
            )}
          </div>
        )}

        {/* ---------------- downloading ---------------- */}
        {step === "downloading" && (
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <FolderDown className="h-5 w-5 animate-pulse text-primary" />
              </span>
              <div>
                <p className="text-[14px] font-bold text-foreground">Preparing ModDeck…</p>
                <p className="text-[11px] text-muted-foreground">
                  Your browser is about to ask for permission to install.
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full bg-primary",
                  started ? "w-full transition-[width] duration-[2400ms] ease-in-out" : "w-0"
                )}
              />
            </div>
            {started && (
              <p className="mt-2.5 text-[11px] text-muted-foreground">
                No install prompt appeared? Your browser can still install it — see the steps
                below.
              </p>
            )}
          </div>
        )}

        {/* ---------------- manual instructions ---------------- */}
        {step === "manual" && (
          <div className="px-6 py-5">
            <div className="flex items-center gap-2.5">
              <MousePointerClick className="h-4.5 w-4.5 text-primary" />
              <p className="text-[14px] font-black text-foreground">
                Install it from your browser — 3 clicks
              </p>
            </div>
            <ol className="mt-3.5 space-y-2.5">
              {browserSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-black text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-snug">{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3.5 rounded-lg border border-white/10 bg-panel px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              {platform === "macOS"
                ? "Works in Safari, Chrome and Edge. Once added to the Dock, ModDeck opens in its own window."
                : "Works in Chrome, Edge, Brave and Opera. Firefox users: look for the install icon on the right side of the address bar."}
            </p>
            <Button
              onClick={afterInstall}
              className="mt-4 h-11 w-full bg-primary text-sm font-black text-primary-foreground hover:bg-primary/90"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> I&apos;ve installed it
            </Button>
          </div>
        )}

        {/* ---------------- done ---------------- */}
        {step === "done" && (
          <div className="px-6 py-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </span>
            <p className="mt-3 text-[15px] font-black text-foreground">ModDeck is installed</p>
            <p className="mx-auto mt-1 max-w-[300px] text-[12px] leading-relaxed text-muted-foreground">
              Launch it any time from your{" "}
              {platform === "macOS" ? "Dock or Launchpad" : "Start menu"} — it runs in its own
              window, keeps trainers offline-ready and updates itself.
            </p>
            <Button
              onClick={afterInstall}
              className="mt-4 h-11 w-full bg-primary text-sm font-black text-primary-foreground hover:bg-primary/90"
            >
              Finish
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
