/**
 * Automated platform email — every transactional message (receipts,
 * cancellation confirmations) is sent FROM the platform's no-reply address.
 * Members never need to write in and the owner never touches a support inbox:
 * cancel / resume / billing are all self-serve in Settings.
 *
 * Delivery goes through POST /api/email (server-side outbox). To deliver to
 * real inboxes, drop a provider key into that route — e.g. Resend:
 *   await resend.emails.send({ from: NO_REPLY_FROM, to, subject, text: body });
 * (free Resend account + domain verification — no Google account involved).
 */

export const NO_REPLY_EMAIL = "no-reply@moddeck.app";
export const NO_REPLY_FROM = `ModDeck <${NO_REPLY_EMAIL}>`;

/** Every automated email closes with this — it is a no-reply address. */
export const NO_REPLY_NOTE = [
  "This is an automated message from ModDeck, sent from a no-reply address.",
  "Please do not reply to this email — replies and call-backs to this address cannot be answered.",
  "Everything (cancel, resume, billing) is self-serve in Settings → Account.",
].join(" ");

/** fire-and-forget — the UI never blocks on email delivery */
export function sendPlatformEmail(opts: { to: string; subject: string; body: string }) {
  if (typeof window === "undefined") return;
  window
    .fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
      keepalive: true,
    })
    .catch(() => {});
}

export interface PlatformEmail {
  from: string;
  to: string;
  subject: string;
  body: string;
}

/* ---------- templates ---------- */

export function buildProReceiptEmail(opts: {
  username: string;
  plan: "yearly" | "monthly";
  price: string;
  currency: string;
  method: string;
  orderId: string;
}): PlatformEmail {
  const { username, plan, price, currency, method, orderId } = opts;
  return {
    from: NO_REPLY_FROM,
    to: "",
    subject: `Your ModDeck Pro receipt — ${orderId}`,
    body: [
      `Hi ${username},`,
      "",
      `Thanks for subscribing to ModDeck Pro (${plan}). Your membership is active right away:`,
      "no daily customization limits, unlimited cheat profiles, Pro-exclusive cheats and 2× Boost earning.",
      "",
      `Order      ${orderId}`,
      `Plan       ModDeck Pro — ${plan === "yearly" ? "Yearly" : "Monthly"}`,
      `Amount     ${price} (shown in ${currency}; any applicable tax is calculated by the payment processor)`,
      `Billed to  ${method}`,
      "",
      "Cancel or resume anytime in Settings → Account — it's self-serve, no email required.",
      "If you do cancel, an automated confirmation will arrive from this address.",
      "",
      NO_REPLY_NOTE,
      "",
      "— ModDeck",
    ].join("\n"),
  };
}

export function buildBoostReceiptEmail(opts: {
  username: string;
  pack: string;
  boosts: number;
  price: string;
  orderId: string;
}): PlatformEmail {
  const { username, pack, boosts, price, orderId } = opts;
  return {
    from: NO_REPLY_FROM,
    to: "",
    subject: `Your ModDeck Boost order — ${orderId}`,
    body: [
      `Hi ${username},`,
      "",
      `Your Boost order is confirmed and the Boost is already in your balance.`,
      "",
      `Order      ${orderId}`,
      `Item       ${pack} — +${boosts.toLocaleString()} Boost`,
      `Amount     ${price} (any applicable tax is calculated by the payment processor)`,
      "",
      NO_REPLY_NOTE,
      "",
      "— ModDeck",
    ].join("\n"),
  };
}

export function buildCancelEmail(opts: {
  username: string;
  plan: "yearly" | "monthly";
  price: string;
  until: string;
}): PlatformEmail {
  const { username, plan, price, until } = opts;
  const yearly = plan === "yearly";
  return {
    from: NO_REPLY_FROM,
    to: "",
    subject: "Your ModDeck Pro subscription is cancelled",
    body: [
      `Hi ${username},`,
      "",
      `Your ModDeck Pro (${yearly ? "yearly" : "monthly"} — ${price}/${yearly ? "year" : "month"}) subscription has been cancelled.`,
      `Your benefits stay active until ${until}. No further charges will be made.`,
      "",
      "Changed your mind? Resubscribe anytime from Settings → Account or the Pro page.",
      "",
      NO_REPLY_NOTE,
      "",
      "— The ModDeck team",
    ].join("\n"),
  };
}
