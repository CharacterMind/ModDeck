/** Shared between the survey dialog (client) and /api/referral (server). */
export const REFERRAL_SOURCES = [
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "reddit", label: "Reddit" },
  { id: "discord", label: "Discord" },
  { id: "x-twitter", label: "X (Twitter)" },
  { id: "twitch", label: "Twitch" },
  { id: "google", label: "Google search" },
  { id: "friend", label: "Friend / co-player" },
  { id: "other", label: "Something else" },
] as const;

export type ReferralSourceId = (typeof REFERRAL_SOURCES)[number]["id"];

export function isValidSource(id: string): id is ReferralSourceId {
  return REFERRAL_SOURCES.some((s) => s.id === id);
}
