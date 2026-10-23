"use client";

import { useSyncExternalStore } from "react";
import { useModDeck } from "@/lib/moddeck-store";

/**
 * Presentment currency — every price in ModDeck is defined in USD and shown
 * converted to the visitor's currency. Rates are indicative and updated
 * periodically; the actual charge currency at a real checkout depends on the
 * payment method (Stripe/PayPal decide that, not us — and they also handle any
 * tax, so the app itself never adds tax lines).
 */

export interface CurrencyDef {
  code: string;
  label: string;
  rate: number; // per 1 USD
  region: string;
}

export const CURRENCIES: CurrencyDef[] = [
  { code: "USD", label: "USD — US dollar", rate: 1, region: "🇺🇸 United States" },
  { code: "CAD", label: "CAD — Canadian dollar", rate: 1.37, region: "🇨🇦 Canada" },
  { code: "EUR", label: "EUR — Euro", rate: 0.92, region: "🇪🇺 Eurozone" },
  { code: "GBP", label: "GBP — British pound", rate: 0.79, region: "🇬🇧 United Kingdom" },
  { code: "AUD", label: "AUD — Australian dollar", rate: 1.52, region: "🇦🇺 Australia" },
];

const RATE_BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c.rate]));

/** locale region → currency for the common cases */
const REGION_MAP: Record<string, string> = {
  CA: "CAD",
  US: "USD",
  GB: "GBP",
  AU: "AUD",
  AT: "EUR", BE: "EUR", HR: "EUR", CY: "EUR", EE: "EUR", FI: "EUR",
  FR: "EUR", DE: "EUR", GR: "EUR", IE: "EUR", IT: "EUR", LV: "EUR",
  LT: "EUR", LU: "EUR", MT: "EUR", NL: "EUR", PT: "EUR", SK: "EUR",
  SI: "EUR", ES: "EUR",
};

/** Best-effort locale → currency detection (client only). Defaults to USD. */
export function detectCurrency(): string {
  try {
    const loc = navigator.language || "en-US";
    const region = (Intl.Locale ? new Intl.Locale(loc).region : null) ?? loc.split("-")[1];
    if (region && REGION_MAP[region.toUpperCase()]) return REGION_MAP[region.toUpperCase()];
    /* ask Intl what currency this locale usually formats with */
    const guess = new Intl.NumberFormat(loc, { style: "currency", currency: "XXX" })
      .resolvedOptions().currency;
    if (guess && RATE_BY_CODE.has(guess)) return guess;
  } catch {
    /* older runtimes — fall through */
  }
  return "USD";
}

export function rateOf(code: string): number {
  return RATE_BY_CODE.get(code) ?? 1;
}

export function convert(usd: number, code: string): number {
  return Math.round(usd * rateOf(code) * 100) / 100;
}

/**
 * Format a USD price in the target currency. Symbols are explicit (not ICU
 * lookups — Chromium builds disagree on whether "en-CA" renders "CA$" or "$")
 * and the number itself is pinned to en-US grouping, so server and client
 * always produce identical strings: CA$13.69 / €9.19 / £7.89 / $9.99.
 */
const SYMBOL_BY_CODE: Record<string, string> = {
  USD: "$",
  CAD: "CA$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
};

const NUM = () =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatMoney(usd: number, code: string): string {
  return `${SYMBOL_BY_CODE[code] ?? "$"}${NUM().format(convert(usd, code))}`;
}

const emptySubscribe = () => () => {};

/**
 * Auto-detected currency. Hydration-safe: the server snapshot is always USD,
 * so the first client render matches the HTML, then updates after mount.
 */
export function useDetectedCurrency(): string {
  return useSyncExternalStore(emptySubscribe, detectCurrency, () => "USD");
}

/**
 * The effective currency for prices: the user's manual pick from Settings, or
 * auto-detected from their locale when the preference is "auto".
 */
export function useCurrency(): {
  currency: string;
  auto: boolean;
  fmt: (usd: number) => string;
} {
  const pref = useModDeck((s) => s.currencyPref);
  const detected = useDetectedCurrency();
  const currency = pref === "auto" ? detected : pref;
  return { currency, auto: pref === "auto", fmt: (usd: number) => formatMoney(usd, currency) };
}
