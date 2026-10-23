import type { PayMethod } from "@/components/moddeck/payment";

/**
 * Real-money wiring — the one file the owner edits to take LIVE payments.
 *
 * A browser can't move money by itself; a payment processor has to stand
 * behind every charge. The zero-backend way to go live:
 *
 *  1. STRIPE PAYMENT LINKS (dashboard.stripe.com → Payments → Payment links)
 *     - create one link each for Pro Yearly, Pro Monthly and every Boost pack
 *     - the hosted Stripe page automatically offers CARDS, APPLE PAY,
 *       GOOGLE PAY and Link — Apple/Google pay need no extra code here
 *     - supports recurring subscriptions + one-time payments
 *     - paste each URL below (e.g. "https://buy.stripe.com/xxxx")
 *  2. PAYPAL (paypal.me or a hosted button link from your PayPal profile)
 *     - paste it into `paypal` below
 *
 * While a URL is empty, its Pay button completes the checkout inside the app
 * instead (useful while testing the full flow end-to-end). Once filled in,
 * the Pay button opens YOUR real hosted checkout in a new tab — real money,
 * real Apple Pay / Google Pay / cards / PayPal — and ModDeck logs the order
 * and emails the automated no-reply receipt. (For automatic entitlement
 * sync later, add a Stripe/PayPal webhook → /api route — see worklog.)
 */

export const PAYMENT_LINKS = {
  /** Stripe Payment Link — Pro yearly subscription */
  proYearly: "",
  /** Stripe Payment Link — Pro monthly subscription */
  proMonthly: "",
  /** Stripe Payment Links — Boost packs, keyed by pack id */
  boostPacks: {
    starter: "",
    double: "",
    mega: "",
  },
  /** PayPal — your PayPal.me link or PayPal hosted-button URL */
  paypal: "",
};

export type CheckoutItem = "proYearly" | "proMonthly" | "boost:starter" | "boost:double" | "boost:mega";

/**
 * Returns the real processor URL for this payment method + item, or null when
 * the owner hasn't configured that link yet (→ checkout completes in-app).
 * Card / Apple Pay / Google Pay all ride the Stripe Payment Link; PayPal has
 * its own link.
 */
export function processorUrl(method: PayMethod, item: CheckoutItem): string | null {
  if (method === "paypal") return PAYMENT_LINKS.paypal || null;
  const stripe =
    item === "proYearly"
      ? PAYMENT_LINKS.proYearly
      : item === "proMonthly"
        ? PAYMENT_LINKS.proMonthly
        : PAYMENT_LINKS.boostPacks[item.slice("boost:".length)];
  return stripe || null;
}
