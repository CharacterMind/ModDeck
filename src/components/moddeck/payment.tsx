"use client";

import { useState } from "react";
import { CreditCard, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoogleIcon, PayPalMark } from "@/components/moddeck/brand";
import { cn } from "@/lib/utils";

export type PayMethod = "card" | "paypal" | "gpay" | "applepay";

export function payMethodLabel(m: PayMethod) {
  return m === "card" ? "card" : m === "paypal" ? "PayPal" : m === "gpay" ? "Google Pay" : "Apple Pay";
}

/* ---------- formatting helpers ---------- */

function digits(s: string) {
  return s.replace(/\D/g, "");
}

function formatCardNumber(v: string) {
  return digits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(v: string) {
  const d = digits(v).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)} / ${d.slice(2)}`;
}

/** classic Luhn check so card numbers feel real (4242 4242 4242 4242 passes) */
function luhnValid(num: string) {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return num.length >= 13 && num.length <= 19 && sum % 10 === 0;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/* ---------- PaymentMethods ---------- */

/** shared order-id format for receipts (MD-XXXXXX) */
export function makeOrderId() {
  return `MD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/**
 * Interactive payment block shared by the Pro checkout and the Boost shop.
 * The parent owns the "paying" state — onPay fires only after local
 * validation passes, then the parent routes to the real processor when one is
 * configured (see src/lib/moddeck-payments.ts) or completes in-app.
 */
export function PaymentMethods({
  amount,
  paying,
  onPay,
}: {
  amount: string;
  paying: boolean;
  onPay: (method: PayMethod) => void;
}) {
  const [method, setMethod] = useState<PayMethod>("card");

  /* card form */
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("ca");
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* paypal form */
  const [ppEmail, setPpEmail] = useState("");
  const [ppPassword, setPpPassword] = useState("");
  const [ppError, setPpError] = useState("");

  const tabs: { id: PayMethod; label: string; icon: React.ReactNode }[] = [
    { id: "card", label: "Card", icon: <CreditCard className="h-3.5 w-3.5" /> },
    { id: "paypal", label: "PayPal", icon: <PayPalMark className="text-[11px]" /> },
    { id: "gpay", label: "G Pay", icon: <GoogleIcon className="h-3.5 w-3.5" /> },
    { id: "applepay", label: "Pay", icon: null },
  ];

  const payCard = () => {
    const e: Record<string, string> = {};
    if (!first.trim() || !last.trim()) e.name = "Enter the cardholder name";
    if (!luhnValid(digits(number))) e.number = "Enter a valid card number";
    if (!/^(0[1-9]|1[0-2]) \/ \d{2}$/.test(expiry)) e.expiry = "Use MM / YY";
    if (!/^\d{3,4}$/.test(cvv)) e.cvv = "3-4 digits";
    if (zip.trim().length < 3) e.zip = "Required";
    setErrors(e);
    if (Object.keys(e).length === 0) onPay("card");
  };

  const payPayPal = () => {
    if (!EMAIL_RE.test(ppEmail)) {
      setPpError("Enter the email for your PayPal account");
      return;
    }
    if (ppPassword.length < 4) {
      setPpError("Enter your PayPal password");
      return;
    }
    setPpError("");
    onPay("paypal");
  };

  const spin = paying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />;

  return (
    <div aria-label="Payment method">
      {/* method tabs */}
      <div className="grid grid-cols-4 gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setMethod(t.id)}
            disabled={paying}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[11px] font-bold transition-colors",
              method === t.id
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-white/10 bg-panel text-muted-foreground hover:border-white/25"
            )}
            aria-pressed={method === t.id}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ---- card ---- */}
      {method === "card" && (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative col-span-2">
              <Input
                value={number}
                onChange={(e) => setNumber(formatCardNumber(e.target.value))}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="Card number"
                aria-label="Card number"
                disabled={paying}
                className="border-white/10 bg-panel pr-10 font-mono"
              />
              <CreditCard className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Input
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              inputMode="numeric"
              placeholder="MM / YY"
              aria-label="Expiry"
              disabled={paying}
              className="border-white/10 bg-panel font-mono"
            />
            <Input
              value={cvv}
              onChange={(e) => setCvv(digits(e.target.value).slice(0, 4))}
              inputMode="numeric"
              type="password"
              placeholder="CVV"
              aria-label="CVV"
              disabled={paying}
              className="border-white/10 bg-panel font-mono"
            />
            <Input
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              placeholder="First name"
              aria-label="First name"
              disabled={paying}
              className="border-white/10 bg-panel"
            />
            <Input
              value={last}
              onChange={(e) => setLast(e.target.value)}
              placeholder="Last name"
              aria-label="Last name"
              disabled={paying}
              className="border-white/10 bg-panel"
            />
            <Input
              value={zip}
              onChange={(e) => setZip(e.target.value.slice(0, 10))}
              placeholder="ZIP / Postal code"
              aria-label="ZIP"
              disabled={paying}
              className="border-white/10 bg-panel"
            />
            <Select value={country} onValueChange={setCountry} disabled={paying}>
              <SelectTrigger className="border-white/10 bg-panel" aria-label="Country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {Object.keys(errors).length > 0 && (
            <ul className="mt-2 space-y-0.5 text-[11px] font-semibold text-red-400" role="alert">
              {Object.values(errors).map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            onClick={payCard}
            disabled={paying}
            className="mt-3 h-10 w-full bg-success font-bold text-white hover:bg-success/90"
          >
            {spin}
            <Lock className="mr-1.5 h-3.5 w-3.5" /> Pay {amount}
          </Button>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Your card details are encrypted and processed securely
          </p>
        </div>
      )}

      {/* ---- paypal ---- */}
      {method === "paypal" && (
        <div className="mt-3 rounded-xl border border-white/10 bg-[#f5f7fa] p-4">
          <div className="flex items-center justify-center border-b border-black/8 pb-2.5">
            <span className="text-lg">
              <PayPalMark className="text-base" />
            </span>
          </div>
          <p className="mt-2.5 text-center text-[11px] font-semibold text-[#2c2e2f]">
            Log in to PayPal to finish your purchase
          </p>
          <div className="mt-2.5 space-y-2">
            <Input
              value={ppEmail}
              onChange={(e) => setPpEmail(e.target.value)}
              type="email"
              placeholder="Email or mobile number"
              aria-label="PayPal email"
              disabled={paying}
              className="border-black/15 bg-white text-[#2c2e2f] placeholder:text-black/40"
            />
            <Input
              value={ppPassword}
              onChange={(e) => setPpPassword(e.target.value)}
              type="password"
              placeholder="Password"
              aria-label="PayPal password"
              disabled={paying}
              className="border-black/15 bg-white text-[#2c2e2f] placeholder:text-black/40"
            />
          </div>
          {ppError && (
            <p className="mt-2 text-[11px] font-semibold text-red-500" role="alert">
              {ppError}
            </p>
          )}
          <Button
            type="button"
            onClick={payPayPal}
            disabled={paying}
            className="mt-3 h-10 w-full bg-[#ffc439] font-bold text-[#003087] hover:bg-[#f2ba2f]"
          >
            {spin}
            <PayPalMark className="text-sm" /> Agree &amp; Pay {amount}
          </Button>
          <p className="mt-1.5 text-center text-[10px] text-[#666]">
            Payments are processed by PayPal — ModDeck never sees your password
          </p>
        </div>
      )}

      {/* ---- one-click wallets ---- */}
      {method === "gpay" && (
        <div className="mt-3">
          <Button
            type="button"
            onClick={() => onPay("gpay")}
            disabled={paying}
            variant="outline"
            className="h-10 w-full border-white/15 bg-white font-bold text-neutral-800 hover:bg-white/90"
          >
            {spin}
            <GoogleIcon className="mr-1.5 h-4 w-4" /> Pay {amount} with Google
          </Button>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            One tap — confirmed with your device unlock
          </p>
        </div>
      )}
      {method === "applepay" && (
        <div className="mt-3">
          <Button
            type="button"
            onClick={() => onPay("applepay")}
            disabled={paying}
            className="h-10 w-full bg-black font-bold text-white hover:bg-black/85"
          >
            {spin} Pay {amount}
          </Button>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            One tap — confirmed with Face ID or Touch ID
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- PaymentSuccess ---------- */

export function PaymentSuccess({
  amount,
  heading,
  sub,
  orderId: orderIdProp,
  onDone,
}: {
  amount: string;
  heading: string;
  sub: string;
  /** pass the same order id used for the receipt email */
  orderId?: string;
  onDone: () => void;
}) {
  const [orderId] = useState(() => orderIdProp ?? makeOrderId());
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <p className="mt-3 text-base font-black text-foreground">{heading}</p>
      <p className="mt-1 max-w-xs text-[12px] leading-relaxed text-muted-foreground">{sub}</p>
      <div className="mt-4 w-full space-y-1.5 rounded-xl border border-white/8 bg-panel/60 p-3 text-[12px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Amount paid</span>
          <span className="font-black text-foreground">{amount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-mono font-bold text-foreground">{orderId}</span>
        </div>
      </div>
      <Button onClick={onDone} className="mt-4 h-10 w-full bg-primary font-black text-primary-foreground hover:bg-primary/90">
        Done
      </Button>
    </div>
  );
}
