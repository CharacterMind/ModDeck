/**
 * Number formatting helpers shared by the trainer UI.
 *
 * The money number space goes up to $1 trillion (1e12), so every readout
 * needs to stay compact and stable no matter how large the value gets.
 */

const SUFFIXES: [number, string][] = [
  [1e15, "Q"],
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

/** 1234 -> "1.23K", 1.5e9 -> "1.50B", 1e12 -> "1.00T" */
export function fmtCompact(n: number, decimals = 2): string {
  const abs = Math.abs(n);
  if (!Number.isFinite(n)) return "∞";
  if (abs >= 1e18) return n.toExponential(2).replace("e+", "e");
  for (const [size, suffix] of SUFFIXES) {
    if (abs >= size) return `${(n / size).toFixed(decimals)}${suffix}`;
  }
  return `${Math.round(n * 100) / 100}`;
}

/** $4,250 under a million, $12.50M / $1.00T above — always fits the HUD */
export function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "$∞";
  const abs = Math.abs(n);
  if (abs >= 1e6) return `$${fmtCompact(n)}`;
  return `$${Math.floor(n).toLocaleString("en-US")}`;
}

/** 1234567.891 -> "1,234,567.89" (for tooltips / toasts) */
export function fmtFull(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** 2.5 -> "2.5", 10 -> "10", 1.375 -> "1.375" (no trailing zeros) */
export function fmtNum(n: number): string {
  return String(parseFloat(n.toFixed(3)));
}
