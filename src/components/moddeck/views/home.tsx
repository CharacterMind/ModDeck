"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Coins,
  Flame,
  Gift,
  Hammer,
  Heart,
  MonitorPlay,
  Play,
  Timer,
  TrendingUp,
  UserPlus,
  Users,
  Vote,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Timer as TimerIcon } from "lucide-react";
import { GoogleIcon } from "@/components/moddeck/brand";
import { PaymentMethods, PaymentSuccess, makeOrderId, payMethodLabel, type PayMethod } from "@/components/moddeck/payment";
import { useCurrency } from "@/lib/currency";
import { buildBoostReceiptEmail, sendPlatformEmail } from "@/lib/moddeck-email";
import { processorUrl, type CheckoutItem } from "@/lib/moddeck-payments";
import { CoverArt } from "@/components/moddeck/cover-art";
import { GameCard } from "@/components/moddeck/game-card";
import { GAMES, MY_GAMES_ROW_COUNT, bannerOf, coverOf, gameCheatCount, getGame } from "@/data/games";
import {
  AI_BUILD_TIERS,
  AI_FREE_PER_DAY,
  AI_QUESTION_COST,
  BONUS_DAILY_CAP,
  GIVEAWAY_FREE,
  GIVEAWAY_POOL,
  GIVEAWAY_PRO,
  TIME_TIERS,
  aiFreeRemaining,
  isOwnerAccount,
  limitApplies,
  timePurchaseOutcome,
  useModDeck,
} from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

const FEATURED = GAMES.filter((g) => g.featured);

/* ---------- yellow announcement banner (Wand-style) ---------- */
function AnnouncementBanner() {
  const { bannerDismissed, dismissBanner, navigate } = useModDeck();
  if (bannerDismissed) return null;
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-primary p-3.5 text-primary-foreground sm:flex-row sm:items-center">
      <div className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md bg-primary-foreground">
        <span className="text-[13px] font-black tracking-tighter text-primary">M</span>
        <span className="-ml-0.5 text-[13px] font-black tracking-tighter text-primary/70">D</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-black tracking-tight">We got a fresh coat of paint!</p>
        <p className="text-xs leading-snug opacity-85">
          Yes, we went full Wand-style — same ModDeck, yellow glow. Free members get 5 hours of
          customization a day, and Pro removes the limit entirely.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={dismissBanner}
          className="rounded-md border border-primary-foreground/30 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-primary-foreground/10"
        >
          Dismiss
        </button>
        <button
          onClick={() => navigate("pro")}
          className="rounded-md bg-primary-foreground px-3 py-1.5 text-xs font-bold text-primary transition-opacity hover:opacity-90"
        >
          Read more
        </button>
      </div>
    </div>
  );
}

/* ---------- hero carousel ---------- */
function Hero() {
  const { openTrainer, favorites, toggleFavorite } = useModDeck();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % FEATURED.length), 6000);
    return () => clearInterval(id);
  }, []);

  const game = FEATURED[index];
  const Icon = game.icon;
  const fav = favorites.includes(game.id);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8">
      <AnimatePresence mode="wait">
        <motion.div
          key={game.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative min-h-[290px] p-7 md:min-h-[320px] md:p-10"
          style={{
            background: `linear-gradient(115deg, ${game.gradient[0]} 0%, ${game.gradient[1]} 130%)`,
          }}
        >
          {game.cover && (
            <Image
              src={coverOf(game)!}
              alt=""
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-cover"
            />
          )}
          <div className="cover-diagonal absolute inset-0 opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
          <div
            className="absolute -right-10 -bottom-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: game.scene.accent }}
          />
          <Icon className="anim-float absolute right-8 bottom-8 hidden h-32 w-32 text-white/15 md:block" strokeWidth={1} />

          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
              <Flame className="h-3 w-3 text-orange-400" /> Featured trainer
            </span>
            <h1 className="mt-4 text-2xl leading-tight font-extrabold tracking-tight text-white md:text-4xl">
              {game.title}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
              {gameCheatCount(game)} trainer options — edit funds, franchise XP, time speed and more —
              updated for game version {game.version}.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Button
                onClick={() => openTrainer(game.id)}
                className="h-10 gap-2 bg-primary px-5 font-black text-primary-foreground hover:bg-primary/90"
              >
                <Play className="h-4 w-4 fill-current" /> Open trainer
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 border-white/25 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50",
                  fav && "text-red-400"
                )}
                onClick={() => toggleFavorite(game.id)}
                aria-label={fav ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={cn("h-4 w-4", fav && "fill-current")} />
              </Button>
              <div className="hidden items-center gap-4 pl-2 text-[11px] font-medium text-white/75 sm:flex">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {game.players} playing</span>
                <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> {game.downloads} downloads</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-7 flex items-center gap-1.5 md:left-10">
        {FEATURED.map((g, i) => (
          <button
            key={g.id}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Show featured trainer ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- my games thumbnail row (Wand-style) ---------- */
function MyGamesRow() {
  const { openTrainer } = useModDeck();
  const games = GAMES.slice(0, MY_GAMES_ROW_COUNT);
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-[15px] font-bold tracking-tight text-foreground">My Games</h2>
      <div className="scrollbar-slim -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => openTrainer(game.id)}
            className="group relative h-[68px] w-[122px] shrink-0 overflow-hidden rounded-lg border border-white/10 text-left transition-transform hover:scale-[1.04]"
            style={{ background: `linear-gradient(135deg, ${game.gradient[0]}, ${game.gradient[1]})` }}
            aria-label={`Open ${game.title} trainer`}
          >
            {game.cover ? (
              <Image src={bannerOf(game) ?? coverOf(game)!} alt="" fill sizes="122px" className="object-cover" />
            ) : (
              <div className="cover-pattern absolute inset-0 opacity-30" />
            )}
            <game.icon className="absolute top-1.5 right-1.5 h-4 w-4 text-white/70 drop-shadow" />
            <span className="absolute bottom-1.5 left-2 right-2 truncate text-[10px] font-black tracking-tight text-white drop-shadow">
              {game.title.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- Boost hub — what Boost is, earn it free, or buy a pack ---------- */

const BOOST_PACKS = [
  { id: "starter", name: "Starter Pack", boosts: 1000, usd: 4.99, bonus: null as string | null, tint: "text-sky-300" },
  { id: "double", name: "Double Pack", boosts: 5500, usd: 19.99, bonus: "+10% bonus", tint: "text-fuchsia-300" },
  { id: "mega", name: "Mega Pack", boosts: 12000, usd: 34.99, bonus: "+20% bonus", tint: "text-lime-300" },
];

function BoostCards() {
  const addBoosts = useModDeck((s) => s.addBoosts);
  const buyBoosts = useModDeck((s) => s.buyBoosts);
  const boosts = useModDeck((s) => s.boosts);
  const username = useModDeck((s) => s.username);
  const auth = useModDeck((s) => s.auth);
  const setAuthOpen = useModDeck((s) => s.setAuthOpen);
  const ownerMode = useModDeck((s) => s.ownerMode);
  const proFlag = useModDeck((s) => s.pro);
  const bonusMinutes = useModDeck((s) => s.bonusMinutes);
  const usageDate = useModDeck((s) => s.usageDate);
  const aiDate = useModDeck((s) => s.aiDate);
  const aiFreeUsed = useModDeck((s) => s.aiFreeUsed);
  const giveawayMonth = useModDeck((s) => s.giveawayMonth);
  const navigate = useModDeck((s) => s.navigate);
  const { fmt } = useCurrency();
  const [pack, setPack] = useState<(typeof BOOST_PACKS)[number] | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [orderId, setOrderId] = useState(makeOrderId);
  const [pendingTier, setPendingTier] = useState<(typeof TIME_TIERS)[number] | null>(null);

  /* the owner walks the real checkout — and is never charged */
  const owner = isOwnerAccount({ ownerMode, auth });
  const memberEmail = auth.signedIn && auth.email ? auth.email : "member@moddeck.app";

  const openPack = (p: (typeof BOOST_PACKS)[number]) => {
    setPaid(false);
    setOrderId(makeOrderId());
    setPack(p);
  };

  const closePack = () => {
    setPack(null);
    setPaid(false);
  };

  /* spend Boost on trainer time — tiers with bulk pricing, capped at 5h/day.
     Buying past the cap is allowed after an explicit warning — the Boost is spent either way. */
  const todayBoostMin = usageDate === new Date().toDateString() ? bonusMinutes : 0;

  const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`);

  const executeTier = (tier: (typeof TIME_TIERS)[number], added: number, wasted: number) => {
    if (!useModDeck.getState().spendBoosts(tier.cost, `+${fmtMin(tier.minutes)} of trainer time`)) {
      toast.error(`Not enough Boost — this costs ${tier.cost.toLocaleString()}`, {
        description: "Earn Boost free above, or grab a pack below.",
      });
      return;
    }
    if (added > 0) useModDeck.getState().grantTimeMinutes(added);
    toast.success(
      wasted > 0
        ? `+${fmtMin(added)} added — ${fmtMin(wasted)} wasted (5h daily cap)`
        : `+${fmtMin(added)} added to today's limit`,
      { description: `Balance: ${useModDeck.getState().boosts.toLocaleString()} Boost` }
    );
  };

  const buyTier = (tier: (typeof TIME_TIERS)[number]) => {
    const outcome = timePurchaseOutcome(todayBoostMin, tier.minutes);
    if (outcome.needsWarning) {
      setPendingTier(tier);
      return;
    }
    executeTier(tier, outcome.added, 0);
  };

  const confirmPendingTier = () => {
    if (!pendingTier) return;
    const outcome = timePurchaseOutcome(todayBoostMin, pendingTier.minutes);
    executeTier(pendingTier, outcome.added, outcome.wasted);
    setPendingTier(null);
  };

  const timeApplies = limitApplies({ pro: proFlag, ownerMode });
  const freeAiLeft = aiFreeRemaining({ aiDate, aiFreeUsed });
  const thisMonth = new Date().toISOString().slice(0, 7);
  const giveawayClaimed = giveawayMonth === thisMonth;
  /* the giveaway chunk follows paid Pro — the owner on a free plan claims the free share */
  const giveawayAmount = proFlag ? GIVEAWAY_PRO : GIVEAWAY_FREE;
  const pendingOutcome = pendingTier ? timePurchaseOutcome(todayBoostMin, pendingTier.minutes) : null;

  const payForPack = (method: PayMethod) => {
    if (!pack) return;
    /* owner completion — full checkout shown, nothing charged, no receipt */
    if (owner) {
      buyBoosts(pack.boosts, pack.name);
      setPaid(true);
      toast.success(`${pack.name} delivered — no charge (owner account)`, {
        description: `New balance: ${useModDeck.getState().boosts.toLocaleString()} Boost`,
      });
      return;
    }
    if (!auth.signedIn) return; // the sign-in gate below is the only way in
    const bought = pack;
    /* real money path — opens the owner's live hosted checkout when configured
       (see src/lib/moddeck-payments.ts) */
    const url = processorUrl(method, `boost:${bought.id}` as CheckoutItem);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    setPaying(true);
    setTimeout(() => {
      buyBoosts(bought.boosts, bought.name);
      setPaying(false);
      setPaid(true);
      toast.success(`${bought.name} delivered — +${bought.boosts.toLocaleString()} Boost`, {
        description: `Paid ${fmt(bought.usd)} with ${payMethodLabel(method)} · New balance: ${useModDeck.getState().boosts.toLocaleString()} Boost`,
      });
      /* automated receipt from the platform's no-reply address */
      const mail = buildBoostReceiptEmail({
        username,
        pack: bought.name,
        boosts: bought.boosts,
        price: fmt(bought.usd),
        orderId,
      });
      sendPlatformEmail({ to: memberEmail, subject: mail.subject, body: mail.body });
    }, 1500);
  };

  const grant = (n: number, label: string) => {
    const pro = useModDeck.getState().pro;
    addBoosts(n);
    const total = useModDeck.getState().boosts;
    const earned = n * (pro ? 2 : 1);
    toast.success(`${label} +${earned} Boost${pro ? " (2× Pro)" : ""}`, {
      description: `Balance: ${total.toLocaleString()} Boost${pro ? " — Pro members earn double" : ""}`,
    });
  };

  const earnCards = [
    {
      icon: Vote,
      title: "Pick the next mod",
      desc: "Votes decide which trainer we build next. Voting earns Boost.",
      cta: "Vote for Crazy Mall",
      accent: "text-primary",
      onClick: () => grant(10, "Vote recorded —"),
    },
    {
      icon: Timer,
      title: "Reloaded top-up",
      desc: "Top up your daily Boost to receive a random Pro mod.",
      cta: "Top up now",
      accent: "text-sky-300",
      onClick: () => grant(25, "Reloaded —"),
    },
    {
      icon: Gift,
      title: "Free Boosts, every day",
      desc: "Open your free loot crate daily for +50 to +500 Boost.",
      cta: "Open daily crate",
      accent: "text-fuchsia-300",
      onClick: () => grant(50 + Math.floor(Math.random() * 450), "Daily crate —"),
    },
    {
      icon: UserPlus,
      title: "Bring a friend",
      desc: "Invite friends to ModDeck — you both get +100 Boost.",
      cta: "+100 Boost",
      accent: "text-lime-300",
      onClick: () => grant(100, "Friend invited —"),
    },
    {
      icon: MonitorPlay,
      title: "Watch ads, get boosts",
      desc: "Watch up to 5 ads a day for 30 Boosts each.",
      cta: "Start watching",
      accent: "text-orange-300",
      onClick: () => grant(30, "Ad watched —"),
    },
  ];

  return (
    <section className="mt-8">
      {/* header: title + live balance + one-line explainer */}
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="text-[15px] font-bold tracking-tight text-foreground">Boosts</h2>
        <span
          className="inline-flex items-center gap-1 rounded-full border border-lime-300/25 bg-lime-300/10 px-2.5 py-0.5 text-[11px] font-black text-lime-300"
          title="Your current Boost balance"
        >
          <Zap className="h-3 w-3 fill-lime-300" /> {boosts.toLocaleString()}
        </span>
      </div>
      <p className="mb-4 mt-1.5 max-w-2xl text-[11px] leading-relaxed text-muted-foreground">
        Boost is ModDeck's reward currency. New accounts get <span className="font-bold text-lime-300">1,250 starting points — free, on us</span>. Earn more free below, spend it on trainer time, AI-built mods and questions, or grab a pack. Pro members earn 2× from every free source.
      </p>

      {/* earn free */}
      <p className="mb-2 text-[10px] font-black tracking-[0.14em] text-muted-foreground/70 uppercase">Earn free</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {earnCards.map((c) => (
          <div key={c.title} className="card-hover flex flex-col rounded-xl border border-white/8 bg-panel/70 p-4">
            <c.icon className={cn("h-5 w-5", c.accent)} />
            <p className="mt-2.5 text-[13px] font-bold text-foreground">{c.title}</p>
            <p className="mt-1 flex-1 text-[11px] leading-relaxed text-muted-foreground">{c.desc}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 h-8 w-fit border-white/15 bg-white/5 text-[11px] font-bold hover:border-primary/50 hover:text-primary"
              onClick={c.onClick}
            >
              <CheckCircle2 className="mr-1 h-3 w-3" /> {c.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* spend — put Boost to work */}
      <p className="mb-2 mt-6 text-[10px] font-black tracking-[0.14em] text-muted-foreground/70 uppercase">Spend Boost</p>

      {/* monthly giveaway — a pool split across the community; Pro claims a 3× chunk */}
      <div className="relative overflow-hidden rounded-xl border border-lime-300/25 bg-gradient-to-r from-lime-300/10 via-lime-300/5 to-transparent p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lime-300/15">
            <Gift className="h-5 w-5 text-lime-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-black text-foreground">
              Monthly giveaway
              <span className="rounded bg-lime-300/15 px-1 py-px text-[8px] font-black tracking-wide text-lime-300">
                {new Date().toLocaleString("en-US", { month: "long" }).toUpperCase()} POOL: {GIVEAWAY_POOL.toLocaleString()} BOOST
              </span>
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              On top of everything you earn — claim your share free each month.{" "}
              {proFlag
                ? `As a Pro member your share is ${GIVEAWAY_PRO.toLocaleString()} Boost — 3× the free share, because you keep the lights on.`
                : `Pro members claim ${GIVEAWAY_PRO.toLocaleString()} — 3× your ${GIVEAWAY_FREE.toLocaleString()} share.`}
            </p>
          </div>
          {giveawayClaimed ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-[11px] font-black text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-lime-300" /> Claimed — resets{" "}
              {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleString("en-US", { month: "long" })} 1
            </span>
          ) : (
            <Button
              size="sm"
              className="h-8 shrink-0 bg-lime-300 px-3.5 text-[11px] font-black text-neutral-900 hover:bg-lime-300/90"
              onClick={() => {
                useModDeck.getState().claimGiveaway();
                toast.success(`Monthly giveaway claimed — +${giveawayAmount.toLocaleString()} Boost`, {
                  description: `Balance: ${useModDeck.getState().boosts.toLocaleString()} Boost · Next giveaway ${new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                    1
                  ).toLocaleString("en-US", { month: "long" })} 1`,
                });
              }}
            >
              <Gift className="mr-1 h-3 w-3" /> Claim {giveawayAmount.toLocaleString()} Boost
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* trainer time — 1–5h tiers, bulk pricing, hard 5h/day cap */}
        <div className="card-hover flex flex-col rounded-xl border border-white/8 bg-panel/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
              <TimerIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-foreground">Trainer time</p>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {timeApplies
                  ? todayBoostMin > 0
                    ? `Base 5h free + ${fmtMin(todayBoostMin)} Boost time today`
                    : "Base 5h free daily — add more with Boost"
                  : "Unlimited with your plan"}
              </p>
            </div>
            {timeApplies && (
              <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[10px] font-black tabular-nums text-muted-foreground">
                {fmtMin(todayBoostMin)}/{fmtMin(BONUS_DAILY_CAP)}
              </span>
            )}
          </div>
          {timeApplies ? (
            <>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {TIME_TIERS.map((t) => (
                  <button
                    key={t.minutes}
                    onClick={() => buyTier(t)}
                    className="rounded-lg border border-lime-300/25 bg-lime-300/5 px-1 py-1.5 text-center transition-colors hover:border-lime-300/60 hover:bg-lime-300/15"
                    title={`+${t.minutes / 60} hour${t.minutes > 60 ? "s" : ""} of trainer time for ${t.cost} Boost`}
                  >
                    <span className="block text-[11px] font-black text-foreground">{t.minutes / 60}h</span>
                    <span className="block text-[9px] font-bold text-lime-300">{t.cost} ⚡</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[9px] leading-snug text-muted-foreground/70">
                Stacks on top of your free 5h · caps at 5h of Boost time a day · we always warn before a spend that
                would waste Boost.
              </p>
            </>
          ) : (
            <p className="mt-3 rounded-lg bg-white/5 px-2.5 py-1.5 text-center text-[10px] font-black tracking-wide text-muted-foreground">
              INCLUDED — NO LIMITS, NO BOOST NEEDED
            </p>
          )}
        </div>

        {/* Mod AI questions */}
        <div className="card-hover flex items-center gap-3.5 rounded-xl border border-white/8 bg-panel/70 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
            <Bot className="h-5 w-5 text-fuchsia-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-foreground">Ask Mod AI</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {proFlag || ownerMode
                ? "Unlimited questions — included with your plan"
                : freeAiLeft > 0
                  ? `Mods, tables and Lua explained. ${freeAiLeft} of ${AI_FREE_PER_DAY} free today, then ${AI_QUESTION_COST} Boost each`
                  : `Mods, tables and Lua explained. ${AI_QUESTION_COST} Boost per question`}
            </p>
          </div>
          <Button
            size="sm"
            className="h-8 shrink-0 bg-primary px-3 text-[11px] font-black text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate("ai")}
          >
            Open
          </Button>
        </div>
      </div>

      {/* AI mod builder — three tiers, better coding / longer requests cost more Boost */}
      <div className="card-hover mt-3 flex flex-wrap items-center gap-3.5 rounded-xl border border-lime-300/25 bg-gradient-to-r from-lime-300/8 via-lime-300/4 to-transparent p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lime-300/15">
          <Hammer className="h-5 w-5 text-lime-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-foreground">Build a mod</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {proFlag || ownerMode
              ? "The AI writes a finished mod for you — free with your plan, any tier."
              : "The AI writes a finished mod for you — pick how good it should be:"}
          </p>
          {!proFlag && !ownerMode && (
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              {AI_BUILD_TIERS.map((t) => (
                <span
                  key={t.id}
                  className="rounded-md border border-lime-300/25 bg-lime-300/10 px-1.5 py-0.5 text-[9px] font-black text-lime-300"
                >
                  {t.name} {t.cost}⚡
                </span>
              ))}
            </span>
          )}
        </div>
        <Button
          size="sm"
          className="h-8 shrink-0 bg-lime-300 px-3 text-[11px] font-black text-neutral-900 hover:bg-lime-300/90"
          onClick={() => {
            useModDeck.getState().setAiTab("build");
            navigate("ai");
          }}
        >
          Open builder
        </Button>
      </div>

      {/* buy packs */}
      <p className="mb-2 mt-6 text-[10px] font-black tracking-[0.14em] text-muted-foreground/70 uppercase">Or buy a pack</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BOOST_PACKS.map((p) => (
          <div key={p.id} className="card-hover flex items-center gap-3.5 rounded-xl border border-white/8 bg-panel/70 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
              <Coins className={cn("h-5 w-5", p.tint)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-foreground">
                {p.name}
                {p.bonus && (
                  <span className="rounded bg-lime-300/15 px-1 py-px text-[8px] font-black tracking-wide text-lime-300">
                    {p.bonus}
                  </span>
                )}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-lime-300">
                <Zap className="h-3 w-3 fill-lime-300" /> {p.boosts.toLocaleString()} Boost
              </p>
            </div>
            <Button
              size="sm"
              className="h-8 shrink-0 bg-primary px-3.5 text-[11px] font-black text-primary-foreground hover:bg-primary/90"
              onClick={() => openPack(p)}
            >
              {fmt(p.usd)}
            </Button>
          </div>
        ))}
      </div>

      {/* checkout for the selected pack — card / PayPal / Apple Pay / Google Pay */}
      <Dialog open={!!pack} onOpenChange={(v) => !v && closePack()}>
        <DialogContent className="border-white/10 bg-popover sm:max-w-sm">
          {paid && pack ? (
            <PaymentSuccess
              amount={owner ? "Free" : fmt(pack.usd)}
              heading={`${pack.name} delivered`}
              sub={
                owner
                  ? `+${pack.boosts.toLocaleString()} Boost added to your balance — nothing was charged to this account (owner).`
                  : `+${pack.boosts.toLocaleString()} Boost added to your balance. Receipt ${orderId} was emailed from no-reply@moddeck.app to ${memberEmail}.`
              }
              orderId={orderId}
              onDone={closePack}
            />
          ) : !auth.signedIn ? (
            /* -------- sign-in gate — Boost lives on the account, like Pro -------- */
            <div className="px-2 py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_0_40px_rgba(255,230,0,0.18)]">
                <GoogleIcon className="h-6 w-6" />
              </div>
              <DialogTitle className="mt-3 text-center text-lg font-black tracking-tight text-foreground">
                Sign in to get Boost
              </DialogTitle>
              <DialogDescription className="mx-auto mt-1.5 max-w-xs text-center text-[12px] leading-relaxed">
                Boost lives on your account — sign in so your balance, packs and receipts (from{" "}
                <span className="font-bold text-foreground/80">no-reply@moddeck.app</span>) follow you everywhere.
              </DialogDescription>
              <Button
                onClick={() => {
                  closePack();
                  setAuthOpen(true);
                }}
                className="mx-auto mt-4 flex h-10 w-full max-w-xs items-center justify-center bg-white font-bold text-neutral-800 hover:bg-white/90"
              >
                <GoogleIcon className="mr-2 h-4 w-4" /> Sign in with Google
              </Button>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Free — your pack will be right here when you come back.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{pack?.name}</DialogTitle>
                <DialogDescription>Instant delivery — Boost lands in your balance right away.</DialogDescription>
              </DialogHeader>
              {owner && (
                <div className="rounded-lg border border-lime-300/25 bg-lime-300/5 p-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-black text-lime-300">
                    <Zap className="h-3 w-3 fill-lime-300" /> Owner account — nothing is ever charged
                  </p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                    Full checkout at real prices — confirming delivers the Boost instantly, no payment method charged.
                  </p>
                </div>
              )}
              <div className="space-y-1.5 rounded-lg border border-white/8 bg-white/[0.03] p-3 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Boost</span>
                  <span className="flex items-center gap-1 font-bold text-lime-300">
                    <Zap className="h-3 w-3 fill-lime-300" /> {pack?.boosts.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold text-foreground">{pack && fmt(pack.usd)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/8 pt-1.5">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-black text-foreground">{pack && fmt(pack.usd)}</span>
                </div>
              </div>
              <PaymentMethods amount={pack ? fmt(pack.usd) : ""} paying={paying} onPay={payForPack} />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* tier overflow warning — we always warn before a spend that wastes Boost */}
      <Dialog open={!!pendingTier} onOpenChange={(v) => !v && setPendingTier(null)}>
        <DialogContent className="border-white/10 bg-popover sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Boost time is capped at 5 hours a day</DialogTitle>
            <DialogDescription asChild>
              <div className="text-left text-[12px] leading-relaxed">
                You&apos;ve already added {fmtMin(todayBoostMin)} of Boost time today. Buying{" "}
                <span className="font-bold text-foreground">{pendingTier ? `${pendingTier.minutes / 60}h` : ""}</span> adds{" "}
                <span className="font-bold text-foreground">
                  {pendingOutcome && pendingOutcome.added > 0 ? fmtMin(pendingOutcome.added) : "no time"}
                </span>
                {pendingOutcome && pendingOutcome.wasted > 0 && (
                  <>
                    {" "}— the other <span className="font-bold text-foreground">{fmtMin(pendingOutcome.wasted)}</span> would
                    be wasted.
                  </>
                )}{" "}
                Your Boost is spent either way.
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs font-bold text-muted-foreground hover:bg-white/5"
              onClick={() => setPendingTier(null)}
            >
              Never mind
            </Button>
            <Button
              className="h-9 bg-lime-300 px-3 text-xs font-black text-neutral-900 hover:bg-lime-300/90"
              onClick={confirmPendingTier}
            >
              <Zap className="mr-1.5 h-3.5 w-3.5 fill-neutral-900" /> Spend {pendingTier?.cost.toLocaleString()} Boost anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  action,
  onAction,
}: {
  icon: typeof Flame;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-foreground">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h2>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          {action} <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function HomeView() {
  const { navigate } = useModDeck();
  const popular = [...GAMES].sort((a, b) => parseFloat(b.downloads) - parseFloat(a.downloads)).slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-8">
      <AnnouncementBanner />
      <div className="mt-5">
        <Hero />
      </div>

      <MyGamesRow />
      <BoostCards />

      {/* popular */}
      <section className="mt-8 scroll-mt-4 pb-6" id="most-popular">
        <SectionHeader
          icon={Flame}
          title="Most Popular"
          action="View all"
          onAction={() => navigate("library")}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {popular.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
