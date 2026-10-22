"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CheatDef } from "@/data/games";

export type View =
  | "home"
  | "library"
  | "trainer"
  | "favorites"
  | "dashboard"
  | "pro"
  | "ai"
  | "settings";

export type Plan = "free" | "monthly" | "yearly";
export type BillingPeriod = "monthly" | "yearly";

/** the one account that never gets charged — purchases run the real checkout, then complete free */
export const OWNER_EMAIL = "support.charactermind@gmail.com";

/** free-purchase exemption: the owner device flag, or the owner's own account email */
export function isOwnerAccount(s: { ownerMode: boolean; auth: AuthState }) {
  return s.ownerMode || (s.auth.signedIn && s.auth.email.trim().toLowerCase() === OWNER_EMAIL);
}

export interface ActivityEntry {
  id: string;
  gameId: string;
  label: string;
  kind: "activate" | "deactivate" | "launch" | "download" | "purchase";
  time: number;
}

/** a saved cheat setup for one game (Pro feature) */
export interface CheatProfile {
  id: string;
  gameId: string;
  name: string;
  states: Record<string, boolean>;
  sliders: Record<string, number>;
  time: number;
}

export interface ModDeckSettings {
  launchOnStartup: boolean;
  autoUpdate: boolean;
  notifications: boolean;
  hotkeySound: boolean;
  overlayPosition: string;
  uiScale: number;
  /** Pro accent theme — hex for --primary (Pro members only, free stays gold) */
  accent?: string;
}

/** free members can keep 3 cheat profiles; Pro is unlimited */
export const FREE_PROFILE_LIMIT = 3;

/** "How did you hear about us?" — one answer per device, synced to the server */
export interface ReferralState {
  answered: boolean;
  source: string | null;
  detail: string;
  clientId: string;
}

/** Google sign-in profile — picture is a small dataURL (256px JPEG) uploaded by the user */
export interface AuthState {
  signedIn: boolean;
  provider: "google" | null;
  email: string;
  picture: string | null;
}

export const DEFAULT_AUTH: AuthState = { signedIn: false, provider: null, email: "", picture: null };

function makeClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `dev-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** the default ModDeck gold — what free members always see */
export const DEFAULT_ACCENT = "#ffe600";

export function cheatKey(gameId: string, cheatId: string) {
  return `${gameId}:${cheatId}`;
}

/* ------------ daily customization limit (Wand-style) ------------- */

function todayKey() {
  return new Date().toDateString();
}

/* ------------ Boost economy (earn + spend) ------------- */

/** Boost-bought trainer time can never exceed 5 hours per day — warned before buying past it */
export const BONUS_DAILY_CAP = 300;

/** time tiers: 1–5 hours, bulk pricing (per-hour drops from 150 to 116) */
export const TIME_TIERS = [
  { minutes: 60, cost: 150 },
  { minutes: 120, cost: 280 },
  { minutes: 180, cost: 400 },
  { minutes: 240, cost: 500 },
  { minutes: 300, cost: 580 },
] as const;

/** what buying `minutes` today would actually add, given the 5h daily cap */
export function timePurchaseOutcome(bonusMinutes: number, minutes: number) {
  const room = Math.max(0, BONUS_DAILY_CAP - bonusMinutes);
  const added = Math.min(minutes, room);
  return { added, wasted: minutes - added, atCap: room === 0, needsWarning: added < minutes };
}

/** monthly giveaway — every member claims a share of the pool once per calendar month; Pro claims 3× */
export const GIVEAWAY_POOL = 250_000;
export const GIVEAWAY_FREE = 500;
export const GIVEAWAY_PRO = 1_500;

/** spending 150 Boost extends today's free limit by one hour (quick-buy price) */
export const BOOST_HOUR_COST = 150;
/** free members get 3 Mod AI questions a day; after that each question costs Boost */
export const AI_FREE_PER_DAY = 3;
export const AI_QUESTION_COST = 25;

/** the Mod Builder — pay more Boost for better coding and longer requests */
export const AI_BUILD_TIERS = [
  {
    id: "quick",
    name: "Quick build",
    cost: 100,
    blurb: "A compact script for one effect — fast and cheap",
    spec: "~150 words",
  },
  {
    id: "smart",
    name: "Smart build",
    cost: 250,
    blurb: "Cleaner code, edge cases handled, install notes",
    spec: "~350 words",
  },
  {
    id: "deep",
    name: "Deep build",
    cost: 500,
    blurb: "Full trainer plan — the best coding, the longest request",
    spec: "no cap",
  },
] as const;

export type AiBuildTierId = (typeof AI_BUILD_TIERS)[number]["id"];

/** the last mod the builder delivered (persisted so it survives navigation) */
export interface AiBuildResult {
  gameId: string;
  gameTitle: string;
  prompt: string;
  tier: AiBuildTierId;
  cost: number;
  text: string;
  at: number;
}

/** the free daily limit plus any +time bought with Boost today */
export function dailyCapMinutes(s: { limitMinutes: number; bonusMinutes?: number; usageDate: string }) {
  const bonus = s.usageDate === todayKey() ? (s.bonusMinutes ?? 0) : 0;
  return s.limitMinutes + bonus;
}

/** free Mod AI questions left today (Pro/owner handled at the call site) */
export function aiFreeRemaining(s: { aiDate?: string; aiFreeUsed?: number }) {
  const used = s.aiDate === todayKey() ? (s.aiFreeUsed ?? 0) : 0;
  return Math.max(0, AI_FREE_PER_DAY - used);
}

/** The daily limit only applies to regular free users. */
export function limitApplies(s: { pro: boolean; ownerMode: boolean }) {
  return !s.pro && !s.ownerMode;
}

export function isOverLimit(s: {
  pro: boolean;
  ownerMode: boolean;
  usageSeconds: number;
  limitMinutes: number;
  bonusMinutes?: number;
  usageDate: string;
}) {
  return limitApplies(s) && s.usageSeconds >= dailyCapMinutes(s) * 60;
}

/** 5670 -> "1H 34MIN" */
export function formatUsage(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}H ${m.toString().padStart(2, "0")}MIN`;
}

interface ModDeckState {
  /* navigation */
  view: View;
  gameId: string | null;
  search: string;
  platformFilter: string;
  genreFilter: string;
  sort: "popular" | "newest" | "name";

  /* user data */
  username: string;
  auth: AuthState;
  /** display currency: "auto" (detect from locale) or a ISO code from CURRENCIES */
  currencyPref: string;
  favorites: string[];
  recentlyPlayed: string[];
  pro: boolean;
  plan: Plan;
  billingPeriod: BillingPeriod;
  /** epoch ms when a cancelled Pro subscription stops working (null = active) */
  proUntil: number | null;
  activations: Record<string, number>;
  sessions: number;
  activity: ActivityEntry[];
  cheatStates: Record<string, Record<string, boolean>>;
  sliderValues: Record<string, Record<string, number>>;
  profiles: CheatProfile[];
  settings: ModDeckSettings;

  /* daily limit + economy */
  ownerMode: boolean; // the owner of the platform is never limited
  limitMinutes: number; // free-user daily customization limit (5h)
  usageDate: string;
  usageSeconds: number;
  /** extra trainer minutes bought with Boost today (valid only while usageDate is today) */
  bonusMinutes: number;
  boosts: number;
  /** Mod AI free-question tracker for today */
  aiDate: string;
  aiFreeUsed: number;
  /** Mod AI chat history (last 20 messages, survives navigation) */
  aiMessages: { role: "user" | "assistant"; content: string }[];
  /** last delivered builder result (survives navigation) */
  aiBuild: AiBuildResult | null;
  /** which Mod AI tab is open — the home spend card deep-links to the builder */
  aiTab: "ask" | "build";
  /** calendar month ("2026-10") the monthly giveaway was last claimed in */
  giveawayMonth: string;
  bannerDismissed: boolean;

  /* referral survey + desktop app */
  referral: ReferralState;
  asked: boolean; // survey has been shown at least once on this device
  installed: boolean; // transient — running as the installed desktop app
  downloadOpen: boolean; // transient — download dialog
  surveyOpen: boolean; // transient — referral survey dialog
  authOpen: boolean; // transient — Google sign-in dialog

  /* transient */
  runningGameId: string | null;
  launchingGameId: string | null;
  limitAlert: boolean;

  /* actions */
  setName: (name: string) => void;
  setCurrencyPref: (c: string) => void;
  cancelSubscription: () => void;
  resumeSubscription: () => void;
  checkProExpiry: () => void;
  signInGoogle: (email: string) => void;
  signOut: () => void;
  setPicture: (dataUrl: string | null) => void;
  setAuthOpen: (v: boolean) => void;
  navigate: (view: View) => void;
  openTrainer: (gameId: string) => void;
  setSearch: (s: string) => void;
  setPlatformFilter: (p: string) => void;
  setGenreFilter: (g: string) => void;
  setSort: (s: "popular" | "newest" | "name") => void;

  toggleFavorite: (gameId: string) => void;
  isFavorite: (gameId: string) => boolean;

  toggleCheat: (gameId: string, cheat: CheatDef) => boolean;
  setSlider: (gameId: string, cheat: CheatDef, value: number) => void;
  fireAction: (gameId: string, cheat: CheatDef) => void;
  isCheatOn: (gameId: string, cheatId: string) => boolean;

  saveProfile: (gameId: string, name: string) => void;
  loadProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;

  launchGame: (gameId: string) => void;
  finishLaunch: () => void;
  stopGame: () => void;

  tickUsage: () => void;
  flagLimit: () => void;
  dismissLimitAlert: () => void;

  addBoosts: (n: number) => void;
  buyBoosts: (n: number, pack: string) => void;
  /** claim this month's giveaway share — once per calendar month, Pro claims a bigger chunk */
  claimGiveaway: () => void;
  /** deduct Boost for a spend — returns false (and changes nothing) if the balance is too low */
  spendBoosts: (n: number, label: string) => boolean;
  /** extend today's free customization limit with minutes bought via Boost */
  grantTimeMinutes: (n: number) => void;
  /** count one Mod AI question against today's free quota */
  recordAiUse: () => void;
  dismissBanner: () => void;
  setBillingPeriod: (p: BillingPeriod) => void;
  setOwnerMode: (v: boolean) => void;

  upgrade: (plan: Exclude<Plan, "free">) => void;
  updateSettings: (patch: Partial<ModDeckSettings>) => void;
  resetAll: () => void;

  setAiMessages: (msgs: { role: "user" | "assistant"; content: string }[]) => void;
  setAiBuild: (b: AiBuildResult | null) => void;
  setAiTab: (t: "ask" | "build") => void;

  setReferral: (source: string, detail: string, idOverride?: string) => void;
  skipReferral: () => void;
  setSurveyOpen: (v: boolean) => void;
  setDownloadOpen: (v: boolean) => void;
  setInstalled: (v: boolean) => void;
}

const defaultSettings: ModDeckSettings = {
  launchOnStartup: false,
  autoUpdate: true,
  notifications: true,
  hotkeySound: true,
  overlayPosition: "top-left",
  uiScale: 100,
  accent: DEFAULT_ACCENT,
};

let activitySeq = 0;
let profileSeq = 0;
function makeActivity(
  gameId: string,
  label: string,
  kind: ActivityEntry["kind"]
): ActivityEntry {
  return { id: `${Date.now()}-${activitySeq++}`, gameId, label, kind, time: Date.now() };
}

export const useModDeck = create<ModDeckState>()(
  persist(
    (set, get) => ({
      view: "home",
      gameId: null,
      search: "",
      platformFilter: "All",
      genreFilter: "All",
      sort: "popular",

      username: "PlayerOne",
      auth: DEFAULT_AUTH,
      currencyPref: "auto",
      favorites: ["gta-v", "elden-ring"],
      recentlyPlayed: ["supermarket-together"],
      pro: false, // the owner starts free like everyone — and buys Pro through the checkout, uncharged
      plan: "free",
      billingPeriod: "monthly",
      proUntil: null,
      activations: {},
      sessions: 0,
      activity: [],
      cheatStates: {},
      sliderValues: {},
      profiles: [],
      settings: defaultSettings,

      ownerMode: true, // this device owns the platform — no limits
      limitMinutes: 300, // 5 hours / day for regular free users
      usageDate: todayKey(),
      usageSeconds: 0,
      bonusMinutes: 0,
      boosts: 1250,
      aiDate: todayKey(),
      aiFreeUsed: 0,
      aiMessages: [],
      aiBuild: null,
      aiTab: "ask",
      giveawayMonth: "",
      bannerDismissed: false,

      referral: { answered: false, source: null, detail: "", clientId: "" },
      asked: false,
      installed: false,
      downloadOpen: false,
      surveyOpen: false,
      authOpen: false,

      runningGameId: null,
      launchingGameId: null,
      limitAlert: false,

      setName: (name) =>
        set({ username: name.trim().slice(0, 24) || "PlayerOne" }),

      setCurrencyPref: (currencyPref) => set({ currencyPref }),

      /* self-serve cancellation — no support email needed. Pro keeps working
         until the end of the already-paid period, then flips to free. */
      cancelSubscription: () => {
        const s = get();
        if (!s.pro) return;
        const days = s.plan === "yearly" ? 365 : 30;
        const proUntil = Date.now() + days * 86_400_000;
        set({
          proUntil,
          activity: [
            makeActivity(s.gameId ?? "settings", `Cancelled Pro — access until ${new Date(proUntil).toISOString().slice(0, 10)}`, "purchase"),
            ...s.activity,
          ].slice(0, 40),
        });
      },

      resumeSubscription: () => set({ proUntil: null }),

      /* run once on app mount — flips Pro off once a cancelled period ends (owner included) */
      checkProExpiry: () => {
        const s = get();
        if (s.pro && s.proUntil && Date.now() > s.proUntil) {
          set({ pro: false, plan: "free", proUntil: null });
        }
      },

      signInGoogle: (email) =>
        set({ auth: { ...get().auth, signedIn: true, provider: "google", email } }),

      signOut: () =>
        set({ auth: { ...get().auth, signedIn: false, provider: null, email: "" } }),

      setPicture: (picture) => set({ auth: { ...get().auth, picture } }),

      setAuthOpen: (authOpen) => set({ authOpen }),

      navigate: (view) => set({ view }),

      openTrainer: (gameId) => {
        const state = get();
        const recent = [gameId, ...state.recentlyPlayed.filter((g) => g !== gameId)].slice(0, 6);
        set({ view: "trainer", gameId, recentlyPlayed: recent });
      },

      setSearch: (search) => set({ search }),
      setPlatformFilter: (platformFilter) => set({ platformFilter }),
      setGenreFilter: (genreFilter) => set({ genreFilter }),
      setSort: (sort) => set({ sort }),

      toggleFavorite: (gameId) => {
        const state = get();
        const has = state.favorites.includes(gameId);
        set({
          favorites: has
            ? state.favorites.filter((g) => g !== gameId)
            : [...state.favorites, gameId],
        });
      },

      isFavorite: (gameId) => get().favorites.includes(gameId),

      toggleCheat: (gameId, cheat) => {
        const state = get();
        const gameStates = { ...(state.cheatStates[gameId] ?? {}) };
        const next = !gameStates[cheat.id];
        gameStates[cheat.id] = next;

        const key = cheatKey(gameId, cheat.id);
        const activations = { ...state.activations };
        if (next) activations[key] = (activations[key] ?? 0) + 1;

        const activity = [
          makeActivity(gameId, `${next ? "Activated" : "Deactivated"} ${cheat.name}`, next ? "activate" : "deactivate"),
          ...state.activity,
        ].slice(0, 40);

        set({
          cheatStates: { ...state.cheatStates, [gameId]: gameStates },
          activations,
          activity,
        });
        return next;
      },

      setSlider: (gameId, cheat, value) => {
        const state = get();
        const gameSliders = { ...(state.sliderValues[gameId] ?? {}) };
        gameSliders[cheat.id] = value;
        set({ sliderValues: { ...state.sliderValues, [gameId]: gameSliders } });
      },

      fireAction: (gameId, cheat) => {
        const state = get();
        const key = cheatKey(gameId, cheat.id);
        const activations = { ...state.activations };
        activations[key] = (activations[key] ?? 0) + 1;
        const activity = [
          makeActivity(gameId, `Used ${cheat.name}`, "activate"),
          ...state.activity,
        ].slice(0, 40);
        set({ activations, activity });
      },

      isCheatOn: (gameId, cheatId) => !!get().cheatStates[gameId]?.[cheatId],

      saveProfile: (gameId, name) => {
        const s = get();
        const profile: CheatProfile = {
          id: `${Date.now()}-${++profileSeq}`,
          gameId,
          name,
          states: { ...(s.cheatStates[gameId] ?? {}) },
          sliders: { ...(s.sliderValues[gameId] ?? {}) },
          time: Date.now(),
        };
        set({ profiles: [profile, ...s.profiles].slice(0, 60) });
      },

      loadProfile: (profileId) => {
        const s = get();
        const p = s.profiles.find((x) => x.id === profileId);
        if (!p) return;
        set({
          cheatStates: { ...s.cheatStates, [p.gameId]: { ...p.states } },
          sliderValues: { ...s.sliderValues, [p.gameId]: { ...p.sliders } },
          activity: [
            makeActivity(p.gameId, `Loaded cheat profile "${p.name}"`, "activate"),
            ...s.activity,
          ].slice(0, 40),
        });
      },

      deleteProfile: (profileId) =>
        set({ profiles: get().profiles.filter((x) => x.id !== profileId) }),

      launchGame: (gameId) => {
        if (isOverLimit(get())) {
          set({ limitAlert: true });
          return;
        }
        const state = get();
        set({
          launchingGameId: gameId,
          sessions: state.sessions + 1,
          activity: [makeActivity(gameId, "Launched game and attached trainer", "launch"), ...state.activity].slice(0, 40),
        });
      },

      finishLaunch: () => {
        const id = get().launchingGameId;
        if (id) set({ runningGameId: id, launchingGameId: null });
      },

      stopGame: () => {
        const state = get();
        const id = state.runningGameId;
        if (!id) return;
        set({
          runningGameId: null,
          activity: [makeActivity(id, "Stopped game, trainer detached", "launch"), ...state.activity].slice(0, 40),
        });
      },

      /* called once per second while a trainer is attached */
      tickUsage: () => {
        const s = get();
        const today = todayKey();
        if (s.usageDate !== today) {
          set({ usageDate: today, usageSeconds: 0, bonusMinutes: 0 });
          return;
        }
        if (!limitApplies(s)) return;
        const cap = dailyCapMinutes(s) * 60;
        if (s.usageSeconds >= cap) {
          if (!s.limitAlert) set({ limitAlert: true });
          return;
        }
        set({ usageSeconds: s.usageSeconds + 1 });
      },

      flagLimit: () => set({ limitAlert: true }),
      dismissLimitAlert: () => set({ limitAlert: false }),

      /* Pro members earn double Boost from every source */
      addBoosts: (n) =>
        set({ boosts: get().boosts + n * (get().pro ? 2 : 1) }),
      /* purchased packs never get the 2× earn multiplier — that's for free earning */
      buyBoosts: (n, pack) => {
        const s = get();
        set({
          boosts: s.boosts + n,
          activity: [makeActivity(s.gameId ?? "boost-store", `Purchased ${pack} (+${n.toLocaleString()} Boost)`, "purchase"), ...s.activity].slice(0, 40),
        });
      },
      /* monthly giveaway — one claim per calendar month; Pro members get a bigger chunk of the pool */
      claimGiveaway: () => {
        const s = get();
        const month = new Date().toISOString().slice(0, 7);
        if (s.giveawayMonth === month) return;
        const amount = s.pro ? GIVEAWAY_PRO : GIVEAWAY_FREE;
        set({
          giveawayMonth: month,
          boosts: s.boosts + amount,
          activity: [makeActivity(s.gameId ?? "boost-store", `Monthly giveaway claimed (+${amount.toLocaleString()} Boost)`, "purchase"), ...s.activity].slice(0, 40),
        });
      },
      /* spending Boost — the sink side of the economy (trainer time, Mod AI) */
      spendBoosts: (n, label) => {
        const s = get();
        if (s.boosts < n) return false;
        set({
          boosts: s.boosts - n,
          activity: [makeActivity(s.gameId ?? "boost-store", `${label} (−${n} Boost)`, "purchase"), ...s.activity].slice(0, 40),
        });
        return true;
      },
      /* +time bought with Boost extends today's cap (starts a fresh day if the tick hasn't run yet) */
      grantTimeMinutes: (n) => {
        const s = get();
        const today = todayKey();
        if (s.usageDate !== today) set({ usageDate: today, usageSeconds: 0, bonusMinutes: n, limitAlert: false });
        else set({ bonusMinutes: s.bonusMinutes + n, limitAlert: false });
      },
      /* count one Mod AI question against today's free quota */
      recordAiUse: () => {
        const s = get();
        const today = todayKey();
        if (s.aiDate !== today) set({ aiDate: today, aiFreeUsed: 1 });
        else set({ aiFreeUsed: s.aiFreeUsed + 1 });
      },
      setAiMessages: (aiMessages) => set({ aiMessages: aiMessages.slice(-20) }),
      setAiBuild: (aiBuild) => set({ aiBuild }),
      setAiTab: (aiTab) => set({ aiTab }),
      dismissBanner: () => set({ bannerDismissed: true }),
      setBillingPeriod: (billingPeriod) => set({ billingPeriod }),
      /* owner mode is a role switch: owner = never time-limited, never charged.
         Pro status is bought through the checkout like any member — just free. */
      setOwnerMode: (v) => {
        set(v ? { ownerMode: true } : { ownerMode: false, pro: false, plan: "free", proUntil: null });
        if (!v) {
          /* free members revert to the default gold accent */
          document.documentElement.style.removeProperty("--primary");
          document.documentElement.style.removeProperty("--ring");
          document.documentElement.style.removeProperty("--neon");
          document.documentElement.style.removeProperty("--neon-soft");
          document.documentElement.style.removeProperty("--sidebar-primary");
          document.documentElement.style.removeProperty("--sidebar-ring");
        }
      },

      upgrade: (plan) => {
        const state = get();
        set({
          pro: true,
          plan,
          proUntil: null,
          activity: [makeActivity(state.gameId ?? "supermarket-together", `Subscribed to ModDeck Pro (${plan})`, "purchase"), ...state.activity].slice(0, 40),
        });
      },

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      setReferral: (source, detail, idOverride) => {
        const r = get().referral;
        set({
          referral: {
            answered: true,
            source,
            detail,
            clientId: idOverride || r.clientId || makeClientId(),
          },
          asked: true,
          surveyOpen: false,
        });
      },
      skipReferral: () => set({ asked: true, surveyOpen: false }),
      setSurveyOpen: (surveyOpen) => set({ surveyOpen }),
      setDownloadOpen: (downloadOpen) => set({ downloadOpen }),
      setInstalled: (installed) => set({ installed }),

      resetAll: () =>
        set({
          view: "home",
          gameId: null,
          search: "",
          platformFilter: "All",
          genreFilter: "All",
          sort: "popular",
          username: "PlayerOne",
          auth: DEFAULT_AUTH,
          currencyPref: "auto",
          favorites: [],
          recentlyPlayed: [],
          pro: false,
          plan: "free",
          billingPeriod: "monthly",
          proUntil: null,
          activations: {},
          sessions: 0,
          activity: [],
          cheatStates: {},
          sliderValues: {},
          profiles: [],
          runningGameId: null,
          launchingGameId: null,
          limitAlert: false,
          usageDate: todayKey(),
          usageSeconds: 0,
          bonusMinutes: 0,
          boosts: 1250,
          aiDate: todayKey(),
          aiFreeUsed: 0,
          aiMessages: [],
          aiBuild: null,
          aiTab: "ask",
          giveawayMonth: "",
          bannerDismissed: false,
          ownerMode: true,
          settings: defaultSettings,
          referral: { answered: false, source: null, detail: "", clientId: makeClientId() },
          asked: false,
          authOpen: false,
        }),
    }),
    {
      name: "moddeck-store",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        username: state.username,
        auth: state.auth,
        currencyPref: state.currencyPref,
        favorites: state.favorites,
        recentlyPlayed: state.recentlyPlayed,
        pro: state.pro,
        plan: state.plan,
        billingPeriod: state.billingPeriod,
        proUntil: state.proUntil,
        activations: state.activations,
        sessions: state.sessions,
        activity: state.activity,
        cheatStates: state.cheatStates,
        sliderValues: state.sliderValues,
        profiles: state.profiles,
        settings: state.settings,
        view: state.view,
        gameId: state.gameId,
        ownerMode: state.ownerMode,
        limitMinutes: state.limitMinutes,
        usageDate: state.usageDate,
        usageSeconds: state.usageSeconds,
        bonusMinutes: state.bonusMinutes,
        boosts: state.boosts,
        aiDate: state.aiDate,
        aiFreeUsed: state.aiFreeUsed,
        aiMessages: state.aiMessages,
        aiBuild: state.aiBuild,
        giveawayMonth: state.giveawayMonth,
        bannerDismissed: state.bannerDismissed,
        referral: state.referral,
        asked: state.asked,
      }),
      /* v3 — drop every member (including the owner device) to free once, so the
         owner can walk the real checkout themselves; purchases complete uncharged */
      migrate: (persisted: unknown) => {
        const p = (persisted ?? {}) as Partial<ModDeckState>;
        p.pro = false;
        p.plan = "free";
        p.proUntil = null;
        /* v2 — Boost economy defaults for states persisted before it existed */
        p.bonusMinutes ??= 0;
        p.aiDate ??= "";
        p.aiFreeUsed ??= 0;
        p.aiMessages ??= [];
        p.aiBuild ??= null;
        /* v3 — monthly giveaway */
        p.giveawayMonth ??= "";
        return p as ModDeckState;
      },
    }
  )
);
