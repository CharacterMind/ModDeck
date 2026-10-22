"use client";

import { useState } from "react";
import { Check, CloudUpload, Crown, FolderDown, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProDialog } from "@/components/moddeck/pro-dialog";
import type { Game } from "@/data/games";
import { useModDeck, FREE_PROFILE_LIMIT } from "@/lib/moddeck-store";
import { blip } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Cheat Profiles — a real Pro feature: save the current cheat setup
 * (toggles + slider/typed values) as a named one-click preset.
 */
export function CheatProfiles({ game }: { game: Game }) {
  const profiles = useModDeck((s) => s.profiles);
  const pro = useModDeck((s) => s.pro);
  const settings = useModDeck((s) => s.settings);
  const saveProfile = useModDeck((s) => s.saveProfile);
  const loadProfile = useModDeck((s) => s.loadProfile);
  const deleteProfile = useModDeck((s) => s.deleteProfile);

  const [lockOpen, setLockOpen] = useState(false);
  const [naming, setNaming] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");

  const mine = profiles.filter((p) => p.gameId === game.id);
  const atCap = !pro && mine.length >= FREE_PROFILE_LIMIT;

  const requestSave = () => {
    if (!pro) {
      if (atCap) {
        toast.warning(`Free plan holds ${FREE_PROFILE_LIMIT} profiles per game`, {
          description: "Upgrade to ModDeck Pro for unlimited profiles + cloud sync.",
        });
      }
      setLockOpen(true);
      return;
    }
    setNaming(true);
  };

  const commitSave = () => {
    const trimmed = name.trim().slice(0, 32);
    if (!trimmed) {
      setNaming(false);
      return;
    }
    if (settings.hotkeySound) blip(920);
    saveProfile(game.id, trimmed);
    const activeCount = Object.values(useModDeck.getState().cheatStates[game.id] ?? {}).filter(Boolean).length;
    toast.success(`Profile saved — ${trimmed}`, {
      description: `${activeCount} active cheats + slider values captured for ${game.title}.`,
    });
    setName("");
    setNaming(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 900);
  };

  const handleLoad = (id: string, profileName: string) => {
    if (!pro) {
      setLockOpen(true);
      return;
    }
    if (settings.hotkeySound) blip(760);
    loadProfile(id);
    toast(`Profile loaded — ${profileName}`, {
      description: `All cheats and slider values for ${game.title} restored.`,
    });
  };

  return (
    <div className="rounded-xl border border-white/8 bg-panel/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderDown className="h-4 w-4 text-primary" />
          <p className="text-[13px] font-bold text-foreground">Cheat Profiles</p>
          {pro ? (
            <span className="flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-primary">
              <CloudUpload className="h-2.5 w-2.5" /> UNLIMITED · SYNCED
            </span>
          ) : (
            <span className="flex items-center gap-0.5 rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-300">
              <Crown className="h-2.5 w-2.5 fill-amber-300" /> PRO
            </span>
          )}
        </div>

        {naming ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitSave();
                if (e.key === "Escape") setNaming(false);
              }}
              placeholder="Profile name…"
              aria-label="Profile name"
              className="h-8 w-44 text-xs"
              maxLength={32}
            />
            <Button size="sm" className="h-8 gap-1 px-2.5 text-[11px] font-bold" onClick={commitSave}>
              <Save className="h-3.5 w-3.5" /> Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              aria-label="Cancel"
              onClick={() => setNaming(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-8 gap-1.5 px-3 text-[11px] font-bold",
              saved && "border-success/50 bg-success/15 text-success"
            )}
            onClick={requestSave}
          >
            {saved ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved" : atCap ? `Save (${FREE_PROFILE_LIMIT}/${FREE_PROFILE_LIMIT})` : "Save current"}
          </Button>
        )}
      </div>

      {mine.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mine.map((p) => (
            <span
              key={p.id}
              className={cn(
                "group flex items-center gap-1 rounded-lg border py-1 pr-1 pl-2.5 text-[11px] font-semibold transition-colors",
                pro
                  ? "border-white/10 bg-white/5 text-foreground hover:border-primary/50 hover:text-primary"
                  : "border-white/10 bg-white/5 text-muted-foreground"
              )}
            >
              <button
                type="button"
                onClick={() => handleLoad(p.id, p.name)}
                className="max-w-40 truncate"
                title={pro ? `Load "${p.name}"` : "Loading profiles is a Pro feature"}
              >
                {p.name}
              </button>
              {pro && (
                <button
                  type="button"
                  aria-label={`Delete profile ${p.name}`}
                  title="Delete profile"
                  onClick={() => {
                    deleteProfile(p.id);
                    toast("Profile deleted", { description: `"${p.name}" removed.` });
                  }}
                  className="rounded p-0.5 text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/15 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
          {pro
            ? "No profiles yet — set up your cheats, then save them here as one-click presets. Synced to your ModDeck cloud."
            : `Save your cheat setups and reload them anytime — a ModDeck Pro feature. Free plan: ${FREE_PROFILE_LIMIT} profiles per game.`}
        </p>
      )}

      <ProDialog open={lockOpen} onOpenChange={setLockOpen} />
    </div>
  );
}
