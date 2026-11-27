// Helpers for the course files: comparing numeric output with a tolerance.

/** A JavaScript number for a RatMath value (Rational, Integer, interval, algebraic, number, numeric text). */
export function toNum(v) {
  if (v === null || v === undefined) return NaN;
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") return Number(v.replace(/[…\s]/g, ""));
  if (v.low !== undefined && v.high !== undefined && typeof v.low.toNumber === "function") return (v.low.toNumber() + v.high.toNumber()) / 2;
  if (typeof v.toNumber === "function") return v.toNumber();
  if (typeof v.value === "number") return v.value;
  if (v.value !== undefined) return toNum(v.value);
  return Number(String(v));
}

/** check: the value (or each listed value) is within tol of the target(s). */
export function near(target, tol = 1e-6) {
  const targets = Array.isArray(target) ? target : [target];
  const fn = (v) => {
    const vs = Array.isArray(target) ? [...v] : [v];
    return vs.length === targets.length && vs.every((x, i) => Math.abs(toNum(x) - targets[i]) <= tol * Math.max(1, Math.abs(targets[i])));
  };
  fn.text = `${targets.join(", ")} (to within ${tol})`;
  return fn;
}
