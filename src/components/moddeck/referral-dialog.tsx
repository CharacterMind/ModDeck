"use client";

import { useState } from "react";
import {
  Gamepad2,
  Loader2,
  MessageSquare,
  Music2,
  Search,
  Send,
  Twitch,
  Twitter,
  Users,
  Youtube,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { REFERRAL_SOURCES } from "@/lib/referral";
import { useModDeck } from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { blip } from "@/lib/sound";

const SOURCE_ICONS: Record<string, typeof Youtube> = {
  youtube: Youtube,
  tiktok: Music2,
  reddit: MessageSquare,
  discord: MessageCircle,
  "x-twitter": Twitter,
  twitch: Twitch,
  google: Search,
  friend: Users,
  other: HelpCircle,
};

/** "How did you hear about us?" — answers are recorded server-side via /api/referral */
export function ReferralDialog() {
  const open = useModDeck((s) => s.surveyOpen);
  const setOpen = useModDeck((s) => s.setSurveyOpen);
  const setReferral = useModDeck((s) => s.setReferral);
  const skipReferral = useModDeck((s) => s.skipReferral);
  const referral = useModDeck((s) => s.referral);

  const [selected, setSelected] = useState<string | null>(referral.source);
  const [detail, setDetail] = useState(referral.detail);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!selected || sending) return;
    setSending(true);
    const clientId =
      referral.clientId ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, source: selected, detail }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReferral(selected, detail, clientId);
      toast.success("Thanks — answer recorded!", {
        description: "Your feedback helps other players find ModDeck.",
      });
    } catch {
      /* server unreachable — keep the answer locally so it isn't lost */
      setReferral(selected, detail, clientId);
      toast.warning("Saved on this device", {
        description: "We couldn't reach the server just now — your answer was kept locally.",
      });
    } finally {
      setSending(false);
      setOpen(false);
    }
  };

  const skip = () => {
    skipReferral();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !referral.answered) skipReferral();
        setOpen(v);
      }}
    >
      <DialogContent className="max-h-[92vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto border-white/10 bg-popover p-0 scrollbar-slim sm:max-w-lg">
        {/* header */}
        <div className="border-b border-white/8 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Gamepad2 className="h-4.5 w-4.5 text-primary" />
            </span>
            <DialogTitle className="text-left text-lg font-black tracking-tight text-foreground">
              How did you hear about us?
            </DialogTitle>
          </div>
          <DialogDescription className="mt-1.5 text-left text-[12px] leading-relaxed">
            Takes five seconds — it tells us where to spread the word about ModDeck. One answer
            per device, nothing personal is collected.
          </DialogDescription>
        </div>

        {/* options */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Discovery source">
            {REFERRAL_SOURCES.map((s) => {
              const Icon = SOURCE_ICONS[s.id] ?? HelpCircle;
              const active = selected === s.id;
              return (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setSelected(s.id);
                    blip(700);
                  }}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-[11px] font-bold transition-all",
                    active
                      ? "border-primary bg-primary/15 text-foreground shadow-[0_0_16px_-6px_var(--primary)]"
                      : "border-white/10 bg-panel text-muted-foreground hover:border-white/25 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", active ? "text-primary" : "")} />
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* optional detail */}
          <div className="mt-4">
            <Input
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              maxLength={300}
              placeholder={
                selected === "other"
                  ? "Tell us what brought you here…"
                  : selected === "friend"
                    ? "Who should we thank? (optional)"
                    : "Anything else? Which video, subreddit, server… (optional)"
              }
              className="h-10 border-white/10 bg-panel text-[13px]"
              aria-label="Additional details (optional)"
            />
          </div>

          <div className="mt-5 flex items-center gap-2.5">
            <Button
              onClick={submit}
              disabled={!selected || sending}
              className="h-11 flex-1 bg-primary text-sm font-black text-primary-foreground hover:bg-primary/90"
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {referral.answered ? "Update answer" : "Send answer"}
            </Button>
            <Button
              onClick={skip}
              variant="outline"
              className="h-11 border-white/10 bg-transparent px-4 text-[13px] font-bold text-muted-foreground hover:bg-white/5"
            >
              Not now
            </Button>
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            Anonymous — stored as a random ID, no account or IP is tied to your answer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
