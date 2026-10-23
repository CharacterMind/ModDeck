"use client";

import { useState } from "react";
import { Loader2, Lock, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { GoogleIcon, VisaMark } from "@/components/moddeck/brand";
import { PaymentMethods, PaymentSuccess, makeOrderId, payMethodLabel, type PayMethod } from "@/components/moddeck/payment";
import { useCurrency } from "@/lib/currency";
import { buildProReceiptEmail, sendPlatformEmail } from "@/lib/moddeck-email";
import { processorUrl } from "@/lib/moddeck-payments";
import { TOTAL_TRAINERS } from "@/data/games";
import { isOwnerAccount, useModDeck, type BillingPeriod } from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* no tax lines — taxes at a real checkout are calculated by the payment
   processor based on the member's location, never by ModDeck */
const USD = { yearlyList: 119.88, yearlyDiscount: 43.89, yearly: 75.99, monthly: 9.99, perMonthYearly: 6.33 };

export function ProDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { upgrade, pro, billingPeriod, setBillingPeriod, auth, setAuthOpen, username, ownerMode } = useModDeck();
  const { currency, fmt } = useCurrency();
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [orderId, setOrderId] = useState(makeOrderId);

  const memberEmail = auth.signedIn && auth.email ? auth.email : "member@moddeck.app";

  const period: BillingPeriod = billingPeriod;
  const y = period === "yearly";
  const total = y ? fmt(USD.yearly) : fmt(USD.monthly);

  /* the owner walks the real checkout — and is never charged */
  const owner = isOwnerAccount({ ownerMode, auth });

  /* reset the checkout when the dialog closes, so a reopen starts at the payment step */
  const handleOpenChange = (v: boolean) => {
    if (!v) setPaid(false);
    if (v) setOrderId(makeOrderId());
    onOpenChange(v);
  };

  /* owner completion — the checkout ran at full price, nothing was charged */
  const activateFree = () => {
    upgrade(period);
    setPaid(true);
    toast.success(`Pro (${y ? "yearly" : "monthly"}) activated — no charge (owner account)`, {
      description: "Owner accounts are never charged.",
    });
  };

  const purchase = (method: PayMethod) => {
    if (pro) {
      toast.info("You're already a Pro member");
      onOpenChange(false);
      return;
    }
    if (owner) {
      activateFree();
      return;
    }
    if (!auth.signedIn) return; // the gate above is the only way in
    /* real money path — when the owner has configured their processor links
       (src/lib/moddeck-payments.ts) this opens the live hosted checkout, where
       Stripe handles cards + Apple Pay + Google Pay and PayPal handles PayPal */
    const url = processorUrl(method, y ? "proYearly" : "proMonthly");
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    setPaying(true);
    setTimeout(() => {
      upgrade(period);
      setPaying(false);
      setPaid(true);
      toast.success(`Payment successful — paid ${total} with ${payMethodLabel(method)}`, {
        description: "Welcome to ModDeck Pro — no more daily limits.",
      });
      /* automated receipt from the platform's no-reply address */
      const mail = buildProReceiptEmail({
        username,
        plan: period,
        price: total,
        currency,
        method: payMethodLabel(method),
        orderId,
      });
      sendPlatformEmail({ to: memberEmail, subject: mail.subject, body: mail.body });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-[calc(100%-2rem)] sm:max-w-3xl overflow-y-auto border-white/10 bg-popover p-0 scrollbar-slim">
        {!auth.signedIn ? (
          /* -------- sign-in gate — subscriptions live on the account -------- */
          <div className="px-8 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_0_40px_rgba(255,230,0,0.18)]">
              <GoogleIcon className="h-7 w-7" />
            </div>
            <DialogTitle className="mt-4 text-center text-xl font-black tracking-tight text-foreground">
              Sign in to get Pro
            </DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-sm text-center text-[13px] leading-relaxed">
              Your subscription lives on your account — that&apos;s what lets you cancel it yourself anytime, with an
              automated confirmation from{" "}
              <span className="font-bold text-foreground/80">no-reply@moddeck.app</span>. No support emails, ever.
            </DialogDescription>
            <Button
              onClick={() => setAuthOpen(true)}
              className="mx-auto mt-5 flex h-10 w-full max-w-xs items-center justify-center bg-white font-bold text-neutral-800 hover:bg-white/90"
            >
              <GoogleIcon className="mr-2 h-4 w-4" /> Sign in with Google
            </Button>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Free — keep or pick your username right after, and checkout picks up where you left off.
            </p>
          </div>
        ) : paid ? (
          <div className="p-6">
            <PaymentSuccess
              amount={owner ? "Free" : total}
              heading={`Welcome to ModDeck Pro (${y ? "yearly" : "monthly"})`}
              sub={
                owner
                  ? "Your membership is active — nothing was charged to this account (owner). Cancel anytime in Settings."
                  : `Your membership is active. Receipt ${orderId} was emailed from no-reply@moddeck.app to ${memberEmail} — cancel anytime in Settings.`
              }
              orderId={orderId}
              onDone={() => onOpenChange(false)}
            />
          </div>
        ) : (
          <>
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <DialogTitle className="text-left text-lg font-black tracking-tight text-foreground">
                  Review your order
                </DialogTitle>
                <DialogDescription className="text-left text-[11px]">
                  Instant activation — cancel anytime, self-serve, in Settings.
                </DialogDescription>
              </div>
              <span className="hidden items-center gap-1 text-[10px] font-semibold text-muted-foreground sm:flex">
                <Lock className="h-3 w-3" /> SSL-secured checkout
              </span>
            </div>

            <div className="grid md:grid-cols-[1.25fr_1fr]">
              {/* ---------- left: payment ---------- */}
              <div className="p-6">
                {owner && (
                  <div className="mb-4 rounded-xl border border-lime-300/25 bg-lime-300/5 p-3">
                    <p className="flex items-center gap-1.5 text-[12px] font-black text-lime-300">
                      <Zap className="h-3.5 w-3.5 fill-lime-300" /> Owner account — nothing is ever charged
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      This is the full checkout at real prices. Confirming activates Pro instantly — no payment method
                      is charged, no receipt is sent.
                    </p>
                  </div>
                )}
                <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Pay with a saved method
                </p>
                <div className="mt-2.5 flex items-center justify-between rounded-xl border border-white/10 bg-panel p-4">
                  <div className="flex items-center gap-3">
                    <VisaMark />
                    <div className="min-w-0">
                      <p className="whitespace-nowrap text-[13px] font-bold text-foreground">•••• •••• •••• 2323</p>
                      <p className="text-[11px] text-muted-foreground">Expires 04/2028</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => purchase("card")}
                    disabled={paying}
                    className="h-9 bg-success font-bold text-white hover:bg-success/90"
                  >
                    {paying && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                    Pay {total}
                  </Button>
                </div>

                <div className="mt-5 mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/8" />
                  <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Or pay with</p>
                  <div className="h-px flex-1 bg-white/8" />
                </div>

                <PaymentMethods amount={total} paying={paying} onPay={purchase} />
              </div>

              {/* ---------- right: order summary ---------- */}
              <div className="border-t border-white/8 bg-panel/60 p-6 md:border-t-0 md:border-l">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-black text-foreground">ModDeck Pro</p>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  No time limits · priority injection · unlimited cloud profiles · accent themes
                </p>

                {/* period toggle — per-month prices make the yearly saving obvious */}
                <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-background p-1">
                  {(
                    [
                      { id: "yearly" as const, label: "Yearly", note: `Save 37% — ${fmt(USD.perMonthYearly)}/mo` },
                      { id: "monthly" as const, label: "Monthly", note: `${fmt(USD.monthly)}/mo` },
                    ]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setBillingPeriod(opt.id)}
                      disabled={paying}
                      className={cn(
                        "rounded-lg px-2 py-1.5 transition-colors",
                        period === opt.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                      aria-pressed={period === opt.id}
                    >
                      <span className="block text-xs font-black">{opt.label}</span>
                      {opt.note && (
                        <span className="block text-[9px] font-bold opacity-75">{opt.note}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* breakdown */}
                <div className="mt-4 space-y-2 text-[13px]">
                  {y ? (
                    <>
                      <Row label="ModDeck Pro — list price" value={fmt(USD.yearlyList)} muted />
                      <Row label="Yearly discount (37% off)" value={`-${fmt(USD.yearlyDiscount)}`} green />
                    </>
                  ) : (
                    <Row label="ModDeck Pro — monthly" value={fmt(USD.monthly)} />
                  )}
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-xs font-bold text-muted-foreground">Total due today</span>
                    <span className="text-xl font-black text-success">{total}</span>
                  </div>
                  {y && (
                    <p className="mt-1 text-right text-[10px] font-semibold text-muted-foreground">
                      That's {fmt(USD.perMonthYearly)}/month — vs {fmt(USD.monthly)} month-to-month
                    </p>
                  )}
                  {owner && (
                    <p className="mt-1 text-right text-[10px] font-semibold text-lime-300">
                      Confirming charges this account nothing.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toast("Coupon code", { description: "Enter your code at the payment step." })}
                  className="mt-3 text-[11px] font-bold text-primary hover:underline"
                >
                  + Add coupon code
                </button>

                <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
                  Prices are shown in {currency}
                  {currency !== "USD" ? " — converted from USD; the final charge depends on your payment method" : ""}.
                  Applicable taxes, if any, are calculated at checkout by the payment processor based on your location.
                  By confirming your subscription, you allow ModDeck to charge your payment method for this payment and
                  future payments in accordance with its terms. You can always cancel or turn off auto-renewal.
                </p>
              </div>
            </div>

            {/* footer thank-you strip */}
            <div className="flex items-center justify-center gap-2 border-t border-white/8 bg-panel/40 px-6 py-3 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              Your membership keeps {TOTAL_TRAINERS.toLocaleString()}+ trainers updated — thank you!
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, muted, green }: { label: string; value: string; muted?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-muted-foreground", muted && "text-muted-foreground/70")}>{label}</span>
      <span className={cn("font-bold tabular-nums", green ? "text-success" : "text-foreground")}>{value}</span>
    </div>
  );
}
