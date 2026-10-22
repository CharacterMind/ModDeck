"use client";

import { Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useModDeck,
  formatUsage,
  dailyCapMinutes,
  limitApplies,
  timePurchaseOutcome,
  BONUS_DAILY_CAP,
  BOOST_HOUR_COST,
} from "@/lib/moddeck-store";

/**
 * Wand-style "Daily Limit" popup — shown once free users hit their
 * 5-hour daily customization limit. Owner mode / Pro never see it.
 * The free escape hatch: spend Boost for +1 hour, or go Pro.
 */
export function LimitDialog() {
  const {
    limitAlert, dismissLimitAlert, usageSeconds, limitMinutes, pro, ownerMode,
    navigate, boosts, spendBoosts, grantTimeMinutes, bonusMinutes, usageDate,
  } = useModDeck();

  const open = limitAlert && limitApplies({ pro, ownerMode });
  const cap = dailyCapMinutes({ limitMinutes, bonusMinutes, usageDate }) * 60;
  const pct = Math.min(100, (usageSeconds / cap) * 100);
  const remainingMin = Math.max(0, Math.ceil((cap - usageSeconds) / 60));
  const canAfford = boosts >= BOOST_HOUR_COST;
  /* +1h quick-buy respects the 5h daily Boost cap — the label says exactly what it adds */
  const todayBonus = usageDate === new Date().toDateString() ? bonusMinutes : 0;
  const hourOutcome = timePurchaseOutcome(todayBonus, 60);
  const quickBuyUsable = canAfford && !hourOutcome.atCap;

  const buyHour = () => {
    if (hourOutcome.atCap) return;
    if (!spendBoosts(BOOST_HOUR_COST, "+1 hour of trainer time")) {
      navigate("home");
      return;
    }
    grantTimeMinutes(hourOutcome.added);
    dismissLimitAlert();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) dismissLimitAlert();
      }}
    >
      <DialogContent className="max-w-sm border-white/10 bg-popover p-0" showCloseButton={false}>
        <div className="p-6">
          <DialogTitle className="text-left text-xl font-black tracking-tight text-foreground">
            Daily Limit
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-left text-[13px] leading-snug text-muted-foreground">
            {remainingMin > 0
              ? `${remainingMin} minutes of free customization available today.`
              : `You've used all ${formatUsage(cap)} of free customization today.`}
          </DialogDescription>

          <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-muted-foreground">
              <span>USED</span>
              <span className="font-mono tracking-normal">
                {formatUsage(usageSeconds)}/{formatUsage(cap)}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-lime-300 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* free escape hatch — spend Boost for +1 hour right now (5h daily cap) */}
          <div className="mt-3 rounded-xl border border-lime-300/25 bg-lime-300/5 p-3.5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1 text-[12px] font-black text-lime-300">
                <Zap className="h-3.5 w-3.5 fill-lime-300" /> Out of time? Boost fixes that.
              </p>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-lime-300">
                <Zap className="h-3 w-3 fill-lime-300" /> {boosts.toLocaleString()}
              </span>
            </div>
            {hourOutcome.atCap ? (
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                You&apos;ve hit today&apos;s 5-hour Boost cap — no more Boost time can be added today. Pro removes limits
                entirely.
              </p>
            ) : (
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Spend {BOOST_HOUR_COST} Boost and keep customizing for another hour today. Boost time caps at 5 hours a
                day — {Math.max(0, Math.round(((BONUS_DAILY_CAP - todayBonus) / 60) * 10) / 10)}h of Boost cap left
                today.
              </p>
            )}
            <Button
              onClick={buyHour}
              disabled={!quickBuyUsable}
              className="mt-2.5 h-9 w-full bg-lime-300 font-black text-neutral-900 hover:bg-lime-300/90 disabled:opacity-40"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5 fill-neutral-900" />
              {hourOutcome.atCap
                ? "Boost time maxed today"
                : hourOutcome.added < 60
                  ? `+${hourOutcome.added}m — ${BOOST_HOUR_COST} Boost (today's cap)`
                  : `+1 hour — ${BOOST_HOUR_COST} Boost`}
            </Button>
            {!canAfford && !hourOutcome.atCap && (
              <button
                onClick={() => {
                  dismissLimitAlert();
                  navigate("home");
                }}
                className="mt-1.5 w-full text-center text-[10px] font-bold text-lime-300 transition-colors hover:underline"
              >
                Earn free Boost on the Mods page →
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-white/8 bg-gradient-to-b from-primary/10 to-transparent p-6">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <p className="text-base font-black tracking-tight text-foreground">
              MOD<span className="text-primary">DECK</span> PRO
            </p>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
            Upgrade for unlimited time, unlimited Mod AI and more — no Boost needed.
          </p>
          <Button
            onClick={() => {
              dismissLimitAlert();
              navigate("pro");
            }}
            className="mt-4 h-11 w-full rounded-full bg-white font-black text-black hover:bg-white/90"
          >
            Upgrade to Pro →
          </Button>
          <button
            onClick={dismissLimitAlert}
            className="mt-2.5 w-full text-center text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
