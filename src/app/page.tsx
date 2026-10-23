"use client";

import { useSyncExternalStore } from "react";
import { Gamepad2 } from "lucide-react";
import { Toaster } from "sonner";
import { Shell } from "@/components/moddeck/shell";
import { LimitDialog } from "@/components/moddeck/limit-dialog";
import { HomeView } from "@/components/moddeck/views/home";
import { LibraryView } from "@/components/moddeck/views/library";
import { TrainerView } from "@/components/moddeck/views/trainer";
import { FavoritesView } from "@/components/moddeck/views/favorites";
import { DashboardView } from "@/components/moddeck/views/dashboard";
import { ProView } from "@/components/moddeck/views/pro";
import { AiView } from "@/components/moddeck/views/ai";
import { SettingsView } from "@/components/moddeck/views/settings";
import { useModDeck } from "@/lib/moddeck-store";

function Splash() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <div className="glow-cyan flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-primary">
        <Gamepad2 className="h-7 w-7 text-primary-foreground" />
      </div>
      <p className="text-sm font-bold tracking-tight text-foreground">
        Mod<span className="text-primary text-glow">Deck</span>
      </p>
    </div>
  );
}

export default function Page() {
  const emptySubscribe = () => () => {};
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const view = useModDeck((s) => s.view);

  if (!mounted) return <Splash />;

  return (
    <>
      <Shell>
        {view === "home" && <HomeView />}
        {view === "library" && <LibraryView />}
        {view === "trainer" && <TrainerView />}
        {view === "favorites" && <FavoritesView />}
        {view === "dashboard" && <DashboardView />}
        {view === "pro" && <ProView />}
        {view === "ai" && <AiView />}
        {view === "settings" && <SettingsView />}
      </Shell>
      <LimitDialog />
      <Toaster theme="dark" position="bottom-right" closeButton />
    </>
  );
}
