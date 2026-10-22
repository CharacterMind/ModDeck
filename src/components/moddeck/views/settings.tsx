"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Camera, Check, Crown, Database, Download, Globe, KeyRound, Keyboard, Monitor, Palette, Pencil, RefreshCw, Timer, Trash2, Users, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProDialog } from "@/components/moddeck/pro-dialog";
import { CancelDialog } from "@/components/moddeck/cancel-dialog";
import { GoogleIcon } from "@/components/moddeck/brand";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GAMES } from "@/data/games";
import { useModDeck, DEFAULT_ACCENT } from "@/lib/moddeck-store";
import { CURRENCIES, useDetectedCurrency } from "@/lib/currency";
import { fileToAvatarDataUrl } from "@/lib/avatar";
import { REFERRAL_SOURCES } from "@/lib/referral";
import { blip } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function SettingRow({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof Monitor;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 border-b border-white/5 px-4 py-3.5 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* Pro accent themes — recolors the whole app live */
const ACCENTS = [
  { name: "ModDeck Gold", value: DEFAULT_ACCENT },
  { name: "Cyber Cyan", value: "#00c8ff" },
  { name: "Lime Rush", value: "#a3e635" },
  { name: "Arcane Violet", value: "#a78bfa" },
  { name: "Neon Rose", value: "#fb7185" },
  { name: "Solar Orange", value: "#fb923c" },
];

const sourceLabel = (id: string | null) =>
  REFERRAL_SOURCES.find((s) => s.id === id)?.label ?? id ?? "—";

interface ReferralStatsData {
  total: number;
  counts: Record<string, number>;
}

/** Owner-only live view of every "How did you hear about us?" answer (server-side) */
function ReferralStats() {
  const [data, setData] = useState<ReferralStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetch("/api/referral")
      .then((r) => r.json())
      .then((d: ReferralStatsData) => {
        if (live) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const entries = data
    ? Object.entries(data.counts).sort((a, b) => b[1] - a[1])
    : [];
  const max = Math.max(1, ...entries.map(([, n]) => n));

  return (
    <div className="rounded-2xl border border-white/8 bg-panel/60 p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-foreground">Referral stats</p>
          <p className="text-[11px] text-muted-foreground">
            {loading
              ? "Loading answers…"
              : data && data.total > 0
                ? `${data.total} answer${data.total === 1 ? "" : "s"} collected from visitors — live from the server`
                : "No answers yet — they land here the moment a visitor submits one"}
          </p>
        </div>
      </div>
      {!loading && entries.length > 0 && (
        <div className="mt-3.5 space-y-2">
          {entries.map(([source, count]) => (
            <div key={source} className="flex items-center gap-2.5">
              <span className="w-32 shrink-0 truncate text-[11px] font-bold text-muted-foreground">
                {sourceLabel(source)}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-[11px] font-black text-foreground tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SettingsView() {
  const { settings, updateSettings, pro, plan, resetAll, activations, ownerMode, setOwnerMode, installed, setDownloadOpen, referral, setSurveyOpen, username, setName, auth, setPicture, signOut, setAuthOpen, currencyPref, setCurrencyPref, proUntil, resumeSubscription, navigate } = useModDeck();
  const detected = useDetectedCurrency();
  const [accentLock, setAccentLock] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(username);
  const photoRef = useRef<HTMLInputElement>(null);
  const totalActivations = Object.values(activations).reduce((a, b) => a + b, 0);
  const initial = (username.trim()[0] ?? "P").toUpperCase();

  const changePhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPicture(await fileToAvatarDataUrl(file));
      toast.success("Profile picture updated");
    } catch {
      toast.error("Could not read that image — try a JPG or PNG");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Preferences are saved locally on this device</p>

      {/* ownership */}
      <section className="mt-6">
        <h2 className="mb-2.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">Ownership</h2>
        <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.04]">
          <SettingRow
            icon={KeyRound}
            title="Owner mode"
            desc="This device owns the platform — the 5-hour daily limit never applies, and purchases are never charged"
          >
            <Switch
              checked={ownerMode}
              onCheckedChange={(v) => {
                setOwnerMode(v);
                toast.success(
                  v
                    ? "Owner mode on — limits bypassed"
                    : "Owner mode off — you browse like a regular free member (purchases stay free for your account)"
                );
              }}
              aria-label="Owner mode"
              className="data-[state=checked]:bg-primary"
            />
          </SettingRow>
          <SettingRow
            icon={Timer}
            title="Free-member daily limit"
            desc="Regular free accounts get this much customization time per day"
          >
            <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] font-bold text-muted-foreground">
              5H / DAY
            </span>
          </SettingRow>
        </div>
      </section>

      {/* desktop app + referral */}
      <section className="mt-6">
        <h2 className="mb-2.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">Desktop app</h2>
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-panel/60">
          <SettingRow
            icon={Monitor}
            title="ModDeck desktop app"
            desc={
              installed
                ? "Running as the installed desktop app — own window, offline shell"
                : "Install ModDeck in its own window with a Start menu icon — free, no admin rights"
            }
          >
            {installed ? (
              <span className="rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-black text-success">
                INSTALLED
              </span>
            ) : (
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-primary px-3 text-xs font-black text-primary-foreground hover:bg-primary/90"
                onClick={() => setDownloadOpen(true)}
              >
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            )}
          </SettingRow>
          <SettingRow
            icon={Users}
            title="How did you hear about us?"
            desc={
              referral.answered
                ? `You said: ${sourceLabel(referral.source)}${referral.detail ? ` — "${referral.detail}"` : ""}`
                : "Tell us where you found ModDeck — takes five seconds"
            }
          >
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-white/10 bg-white/5 px-3 text-xs font-bold text-foreground hover:bg-white/10"
              onClick={() => setSurveyOpen(true)}
            >
              {referral.answered ? "Change" : "Answer"}
            </Button>
          </SettingRow>
        </div>
        {ownerMode && (
          <div className="mt-3">
            <ReferralStats />
          </div>
        )}
      </section>

      {/* account */}
      <section className="mt-6">
        <h2 className="mb-2.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">Account</h2>
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-panel/60">
          {/* profile row */}
          <div className="flex flex-wrap items-center gap-3.5 border-b border-white/5 p-4">
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/15 transition-colors hover:border-primary/60"
              aria-label="Change profile picture"
            >
              {auth.picture ? (
                <img src={auth.picture} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-amber-500 text-base font-black text-primary-foreground">
                  {initial}
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 flex h-4.5 items-center justify-center bg-black/65 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-2.5 w-2.5 text-white" />
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{username}</p>
              <p className="truncate text-xs text-muted-foreground">
                {auth.signedIn ? auth.email : "Local profile — not signed in"}
              </p>
            </div>
            {auth.picture && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 px-2.5 text-xs font-bold text-muted-foreground hover:bg-white/5 hover:text-red-300"
                onClick={() => {
                  setPicture(null);
                  toast.success("Profile picture removed");
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove photo
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-white/10 bg-white/5 px-3 text-xs font-bold text-foreground hover:bg-white/10"
              onClick={() => {
                setNameDraft(username);
                setNameOpen(true);
              }}
            >
              <Pencil className="h-3 w-3" /> Edit name
            </Button>
            <span
              className={
                pro
                  ? "flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] font-bold text-amber-300"
                  : "rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-muted-foreground"
              }
            >
              {pro && <Crown className="h-3 w-3 fill-amber-300 text-amber-300" />}
              {pro ? (plan === "yearly" ? "PRO YEARLY" : "PRO MONTHLY") : ownerMode ? "FREE · OWNER" : "FREE PLAN"}
            </span>
          </div>
          {/* google row */}
          <div className="flex flex-wrap items-center gap-3.5 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
              <GoogleIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground">
                {auth.signedIn ? "Signed in with Google" : "Sign in with Google"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {auth.signedIn
                  ? "Free — your username and picture stay editable on this device anytime."
                  : "It's free — pick a username and upload a picture right after."}
              </p>
            </div>
            {auth.signedIn ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-white/10 bg-white/5 px-3 text-xs font-bold text-foreground hover:bg-white/10"
                onClick={() => {
                  signOut();
                  toast.success("Signed out", { description: "Your profile and picture stay on this device." });
                }}
              >
                Sign out
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-white px-3 text-xs font-black text-neutral-800 hover:bg-white/90"
                onClick={() => setAuthOpen(true)}
              >
                <GoogleIcon className="h-3.5 w-3.5" /> Sign in
              </Button>
            )}
          </div>
          {/* membership row — self-serve billing, no support emails involved */}
          <div className="flex flex-wrap items-center gap-3.5 border-t border-white/5 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
              <Crown className="h-4 w-4 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground">ModDeck Pro membership</p>
              <p className="text-[11px] text-muted-foreground">
                {proUntil
                  ? `Cancelled — Pro keeps working until ${new Date(proUntil).toISOString().slice(0, 10)}, then back to free automatically`
                  : pro
                    ? `Active — ${plan === "yearly" ? "yearly" : "monthly"} billing · cancel anytime, self-serve${ownerMode ? " · owner accounts are never charged" : ""}`
                    : ownerMode
                      ? "Free plan — your purchases are never charged"
                      : "Free plan — upgrade anytime, cancel anytime"}
              </p>
            </div>
            {proUntil ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-white/10 bg-white/5 px-3 text-xs font-bold text-foreground hover:bg-white/10"
                onClick={() => {
                  resumeSubscription();
                  toast.success("Subscription resumed — no charge made", { description: "Pro continues as before." });
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Resume
              </Button>
            ) : pro ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-red-400/25 bg-red-400/10 px-3 text-xs font-bold text-red-300 hover:bg-red-400/20 hover:text-red-200"
                onClick={() => setCancelOpen(true)}
              >
                Cancel subscription
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-primary px-3 text-xs font-black text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate("pro")}
              >
                <Crown className="h-3.5 w-3.5" /> Upgrade
              </Button>
            )}
          </div>
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            changePhoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </section>

      {/* general */}
      <section className="mt-6">
        <h2 className="mb-2.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">General</h2>
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-panel/60">
          <SettingRow
            icon={Globe}
            title="Currency"
            desc={`Prices across the app are shown in this currency — auto follows your device (${detected})`}
          >
            <Select
              value={currencyPref}
              onValueChange={(v) => {
                setCurrencyPref(v);
                toast.success(v === "auto" ? `Currency set to Auto — showing ${detected}` : `Prices now shown in ${v}`);
              }}
            >
              <SelectTrigger className="h-8 w-[150px] border-white/10 bg-white/5 text-xs" aria-label="Currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto — {detected}</SelectItem>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            icon={Palette}
            title="Accent theme"
            desc={pro ? "Recolors the entire app — pick your signature color" : "A Pro feature — recolors the entire app"}
          >
            <div className="flex items-center gap-1.5">
              {!pro && (
                <span className="flex items-center gap-0.5 rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-300">
                  <Crown className="h-2.5 w-2.5 fill-amber-300" /> PRO
                </span>
              )}
              {ACCENTS.map((a) => {
                const active = (settings.accent ?? DEFAULT_ACCENT) === a.value;
                return (
                  <button
                    key={a.value}
                    aria-label={`${a.name}${pro ? "" : " (Pro)"}`}
                    title={pro ? a.name : `${a.name} — Pro`}
                    disabled={active}
                    onClick={() => {
                      if (!pro) {
                        setAccentLock(true);
                        return;
                      }
                      updateSettings({ accent: a.value });
                      if (settings.hotkeySound) blip(660);
                      toast.success(`Accent set to ${a.name}`);
                    }}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 transition-transform",
                      active ? "scale-110 border-white" : "border-transparent hover:scale-110"
                    )}
                    style={{ background: a.value }}
                  />
                );
              })}
            </div>
          </SettingRow>
          <SettingRow icon={Monitor} title="Start with Windows" desc="Launch ModDeck minimized when you log in">
            <Switch checked={settings.launchOnStartup} onCheckedChange={(v) => updateSettings({ launchOnStartup: v })} aria-label="Start with Windows" />
          </SettingRow>
          <SettingRow icon={RefreshCw} title="Auto-update trainers" desc="Keep every trainer compatible with the latest game patches">
            <Switch checked={settings.autoUpdate} onCheckedChange={(v) => updateSettings({ autoUpdate: v })} aria-label="Auto-update trainers" />
          </SettingRow>
          <SettingRow icon={Crown} title="Notifications" desc="Alert me when a game update breaks a trainer">
            <Switch checked={settings.notifications} onCheckedChange={(v) => updateSettings({ notifications: v })} aria-label="Notifications" />
          </SettingRow>
        </div>
      </section>

      {/* trainer */}
      <section className="mt-6">
        <h2 className="mb-2.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">Trainer</h2>
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-panel/60">
          <SettingRow icon={Volume2} title="Hotkey sound" desc="Play a subtle blip when toggling cheats">
            <Switch
              checked={settings.hotkeySound}
              onCheckedChange={(v) => {
                updateSettings({ hotkeySound: v });
                if (v) blip(880);
              }}
              aria-label="Hotkey sound"
            />
          </SettingRow>
          <SettingRow icon={Keyboard} title="Overlay position" desc="Where the in-game cheat overlay appears">
            <Select value={settings.overlayPosition} onValueChange={(v) => updateSettings({ overlayPosition: v })}>
              <SelectTrigger className="h-8 w-[130px] border-white/10 bg-white/5 text-xs" aria-label="Overlay position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top left</SelectItem>
                <SelectItem value="top-right">Top right</SelectItem>
                <SelectItem value="bottom-left">Bottom left</SelectItem>
                <SelectItem value="bottom-right">Bottom right</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow icon={Monitor} title="UI scale" desc={`Interface size — currently ${settings.uiScale}%`}>
            <div className="flex w-40 items-center gap-2.5">
              <Slider
                value={[settings.uiScale]}
                min={80}
                max={120}
                step={5}
                onValueChange={(v) => updateSettings({ uiScale: v[0] })}
                aria-label="UI scale"
              />
              <span className="w-10 text-right font-mono text-[11px] font-bold text-foreground tabular-nums">
                {settings.uiScale}%
              </span>
            </div>
          </SettingRow>
        </div>
      </section>

      {/* data */}
      <section className="mt-6 pb-8">
        <h2 className="mb-2.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">Data</h2>
        <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.04] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <Database className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground">Reset ModDeck data</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Clears favorites, cheat states, {totalActivations.toLocaleString()} activations and Pro status from this device.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="h-9 gap-1.5 border-red-400/30 px-3 text-xs font-bold text-red-300 hover:bg-red-500/10">
                  <Trash2 className="h-3.5 w-3.5" /> Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-white/10 bg-popover">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset everything?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This wipes your favorites, cheat states, usage history and Pro membership from this device. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent text-foreground hover:bg-white/5">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 font-bold text-white hover:bg-red-600"
                    onClick={() => {
                      resetAll();
                      toast.success("All data has been reset");
                    }}
                  >
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          ModDeck {new Date().getFullYear()} · {GAMES.length} trainers installed · v2.4.1
        </p>
      </section>

      <ProDialog open={accentLock} onOpenChange={setAccentLock} />

      <CancelDialog open={cancelOpen} onOpenChange={setCancelOpen} />

      {/* rename dialog */}
      <Dialog open={nameOpen} onOpenChange={setNameOpen}>
        <DialogContent className="border-white/10 bg-popover sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change your name</DialogTitle>
            <DialogDescription>
              This is how your profile appears across ModDeck — free, change it as often as you like. 2–24 characters.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={24}
            placeholder="Your display name"
            aria-label="Display name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setName(nameDraft);
                setNameOpen(false);
                toast.success(`Name updated to ${nameDraft.trim().slice(0, 24) || "PlayerOne"}`);
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" className="border-white/10 bg-white/5 text-foreground hover:bg-white/10" onClick={() => setNameOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setName(nameDraft);
                setNameOpen(false);
                toast.success(`Name updated to ${nameDraft.trim().slice(0, 24) || "PlayerOne"}`);
              }}
            >
              <Check className="h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
