"use client";

import { useRef, useState } from "react";
import { Camera, ChevronRight, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/moddeck/brand";
import { useModDeck } from "@/lib/moddeck-store";
import { fileToAvatarDataUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Google sign-in flow (runs locally — no real Google endpoint is contacted):
 *  1. account chooser styled after accounts.google.com
 *  2. ModDeck username prompt — free, changeable anytime in Settings
 *     + optional profile-picture upload
 */
export function AuthDialog() {
  const { authOpen, setAuthOpen, auth, signInGoogle, setName, setPicture, username } = useModDeck();
  const [step, setStep] = useState<"choose" | "username">("choose");
  const [otherOpen, setOtherOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [pictureDraft, setPictureDraft] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* reset all step state when the dialog closes, so every reopen starts fresh */
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setStep("choose");
      setOtherOpen(false);
      setEmailDraft("");
      setEmailError("");
      setNameDraft("");
      setPictureDraft(null);
    }
    setAuthOpen(v);
  };

  const pickAccount = (email: string) => {
    const clean = email.trim().toLowerCase();
    signInGoogle(clean);
    /* prefill the username prompt from the email's local part */
    const local = clean.split("@")[0]?.replace(/[^a-z0-9_]/g, "") ?? "";
    setNameDraft((username !== "PlayerOne" ? username : local || "Player").slice(0, 24));
    setStep("username");
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPictureDraft(await fileToAvatarDataUrl(file));
    } catch {
      toast.error("Could not read that image — try a JPG or PNG");
    }
  };

  const finish = () => {
    setName(nameDraft);
    if (pictureDraft) setPicture(pictureDraft);
    handleOpenChange(false);
    toast.success(`Signed in as ${nameDraft.trim().slice(0, 24) || "PlayerOne"}`, {
      description: pictureDraft ? "Profile picture saved" : "Username is free to change anytime in Settings",
    });
    /* first look at Boost — the welcome grant lands with the account */
    toast("⚡ 1,250 Boost — free, on us", {
      description: "Starting points for every new account. Spend them on trainer time, AI-built mods, votes, crates and rewards.",
    });
  };

  const emailInitial = (auth.email || "?")[0].toUpperCase();

  return (
    <Dialog open={authOpen} onOpenChange={handleOpenChange}>
      {step === "choose" ? (
        /* ---------- Google-styled account chooser ---------- */
        <DialogContent className="border-black/10 bg-white p-0 text-neutral-900 sm:max-w-sm">
          <div className="flex flex-col items-center px-7 pt-8 pb-6">
            <GoogleIcon className="h-9 w-9" />
            <DialogTitle className="mt-3 text-center text-[22px] font-normal">Sign in with Google</DialogTitle>
            <DialogDescription className="mt-1 text-center text-[13px] text-neutral-600">
              to continue to <span className="font-semibold text-[#1a73e8]">ModDeck</span>
            </DialogDescription>

            <div className="mt-5 w-full">
              {/* previously used account */}
              {auth.email && (
                <button
                  onClick={() => pickAccount(auth.email)}
                  className="flex w-full items-center gap-3 rounded-lg border border-neutral-300 px-3.5 py-3 text-left transition-colors hover:bg-neutral-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-sm font-bold text-white">
                    {emailInitial}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-neutral-900">{auth.email}</span>
                    <span className="block text-[11px] text-neutral-500">Signed in before on this device</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
                </button>
              )}

              {/* use another account */}
              {!otherOpen ? (
                <button
                  onClick={() => setOtherOpen(true)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border border-neutral-300 px-3.5 py-3 text-left transition-colors hover:bg-neutral-50",
                    auth.email && "mt-2"
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200">
                    <UserIcon className="h-5 w-5 text-neutral-500" />
                  </span>
                  <span className="flex-1 text-[13px] font-semibold text-neutral-900">Use another account</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
                </button>
              ) : (
                <div className={cn("rounded-lg border border-neutral-300 p-3.5", auth.email && "mt-2")}>
                  <label className="text-[11px] font-bold text-neutral-600" htmlFor="auth-email">
                    Your Google email
                  </label>
                  <Input
                    id="auth-email"
                    type="email"
                    value={emailDraft}
                    onChange={(e) => {
                      setEmailDraft(e.target.value);
                      setEmailError("");
                    }}
                    placeholder="you@gmail.com"
                    autoFocus
                    className="mt-1 border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && /^\S+@\S+\.\S+$/.test(emailDraft.trim())) pickAccount(emailDraft);
                    }}
                  />
                  {emailError && (
                    <p className="mt-1.5 text-[11px] font-semibold text-red-600" role="alert">
                      {emailError}
                    </p>
                  )}
                  <Button
                    className="mt-2.5 h-9 w-full bg-[#1a73e8] font-bold text-white hover:bg-[#1765cc]"
                    onClick={() => {
                      if (!/^\S+@\S+\.\S+$/.test(emailDraft.trim())) {
                        setEmailError("Enter a valid email address");
                        return;
                      }
                      pickAccount(emailDraft);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              )}
            </div>

            <p className="mt-5 w-full border-t border-neutral-200 pt-3 text-center text-[10px] leading-relaxed text-neutral-500">
              Sign-in stays on this device — nothing is sent to Google.
            </p>
          </div>
        </DialogContent>
      ) : (
        /* ---------- ModDeck username prompt ---------- */
        <DialogContent className="border-white/10 bg-popover sm:max-w-sm">
          <DialogTitle className="text-left text-lg font-black tracking-tight">Choose your username</DialogTitle>
          <DialogDescription className="text-left text-[12px]">
            This is how you appear across ModDeck — it's free and you can change it anytime in Settings.
          </DialogDescription>

          {/* avatar picker */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative h-20 w-20 overflow-hidden rounded-full border border-white/15 bg-white/5 transition-colors hover:border-primary/60"
              aria-label="Upload a profile picture (optional)"
            >
              {pictureDraft ? (
                <img src={pictureDraft} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <UserIcon className="h-8 w-8 text-muted-foreground" />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 flex h-7 items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-3.5 w-3.5 text-white" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Upload profile picture (optional)
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <Input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={24}
            placeholder="Username"
            aria-label="Username"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") finish();
            }}
          />

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs font-bold text-muted-foreground hover:bg-white/5"
              onClick={() => setAuthOpen(false)}
            >
              Skip for now
            </Button>
            <Button
              className="h-9 bg-primary px-4 font-black text-primary-foreground hover:bg-primary/90"
              onClick={finish}
            >
              Create profile
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
