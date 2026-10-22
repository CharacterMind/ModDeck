"use client";

import { useState } from "react";
import { Check, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/lib/currency";
import { buildCancelEmail, NO_REPLY_EMAIL, NO_REPLY_FROM, sendPlatformEmail } from "@/lib/moddeck-email";
import { useModDeck } from "@/lib/moddeck-store";
import { toast } from "sonner";

/**
 * Self-serve subscription cancellation — the whole reason the owner never has
 * to touch a support inbox. The member cancels here, keeps Pro until the end
 * of the paid period, and an automated confirmation email goes out from the
 * platform's no-reply address (queued via /api/email; plug a provider key in
 * to deliver to real inboxes).
 */

export function CancelDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { pro, plan, username, auth, cancelSubscription } = useModDeck();
  const { fmt } = useCurrency();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const yearly = plan === "yearly";
  const usd = yearly ? 75.99 : 9.99;
  const days = yearly ? 365 : 30;
  const until = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  const email = auth.signedIn && auth.email ? auth.email : "your inbox";
  const memberEmail = auth.signedIn && auth.email ? auth.email : "member@moddeck.app";

  const mail = buildCancelEmail({
    username,
    plan: yearly ? "yearly" : "monthly",
    price: fmt(usd),
    until,
  });

  const close = (v: boolean) => {
    if (!v) setDone(false);
    onOpenChange(v);
  };

  const confirm = () => {
    setBusy(true);
    /* automated email from the platform's no-reply address — fire-and-forget */
    sendPlatformEmail({ to: memberEmail, subject: mail.subject, body: mail.body });
    cancelSubscription();
    setBusy(false);
    setDone(true);
    toast.success("Subscription cancelled — confirmation email sent", {
      description: `Pro stays active until ${until}.`,
    });
  };

  if (!pro) return null;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto border-white/10 bg-popover sm:max-w-md">
        {done ? (
          <div className="p-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <Check className="h-6 w-6 text-success" strokeWidth={3} />
            </div>
            <DialogTitle className="mt-3 text-left text-lg font-black text-foreground">
              Subscription cancelled
            </DialogTitle>
            <DialogDescription className="text-left text-[13px]">
              Your Pro benefits keep running until <b className="text-foreground">{until}</b>. Nothing else to do —
              no charges after that date.
            </DialogDescription>

            {/* the automated email the platform just sent */}
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-background">
              <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-3.5 py-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <p className="text-[11px] font-bold text-foreground">Automated email — sent just now</p>
              </div>
              <div className="space-y-1 px-3.5 py-2.5 text-[11px]">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground/70">From:</span> {NO_REPLY_FROM}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground/70">To:</span> {email}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground/70">Subject:</span>{" "}
                  <span className="font-semibold text-foreground">{mail.subject}</span>
                </p>
                <p className="whitespace-pre-line border-t border-white/8 pt-2 leading-relaxed text-muted-foreground">
                  {mail.body}
                </p>
              </div>
            </div>

            <Button
              onClick={() => close(false)}
              className="mt-4 h-9 w-full bg-white/10 font-bold text-foreground hover:bg-white/15"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="p-2">
            <DialogTitle className="text-left text-lg font-black text-foreground">
              Cancel ModDeck Pro?
            </DialogTitle>
            <DialogDescription className="text-left text-[13px]">
              Cancel anytime, self-serve — no support email, no phone call, no retention hoops.
            </DialogDescription>

            <div className="mt-4 space-y-1.5 rounded-xl border border-white/8 bg-white/[0.03] p-3.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-bold text-foreground">Pro — {yearly ? "Yearly" : "Monthly"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold text-foreground">
                  {fmt(usd)}
                  {yearly ? "/year" : "/month"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/8 pt-1.5">
                <span className="font-bold text-foreground">Stays active until</span>
                <span className="font-black text-success">{until}</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              After {until} you drop to the free plan: 5 hours of customization per day, 3 cheat profiles per game,
              no Pro-exclusive cheats, and 1× Boost earning. Your profiles and stats are kept — resubscribe whenever.
            </p>

            <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/8 bg-background/60 px-3 py-2.5">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                We&apos;ll email an automated confirmation from <b className="text-foreground/80">{NO_REPLY_EMAIL}</b>{" "}
                to <b className="text-foreground/80">{email}</b> — no reply needed, nothing to cancel by email.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                onClick={() => close(false)}
                className="h-9 bg-primary font-black text-primary-foreground hover:bg-primary/90"
              >
                Keep my plan
              </Button>
              <Button
                onClick={confirm}
                disabled={busy}
                variant="outline"
                className="h-9 border-red-400/25 bg-red-400/10 font-bold text-red-300 hover:bg-red-400/20 hover:text-red-200"
              >
                Cancel subscription
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
