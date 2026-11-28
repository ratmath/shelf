// Helpers for the course files: comparing numeric output with a tolerance.

/** A JavaScript number for a RatMath value (Rational, Integer, interval, algebraic, number, numeric text). */
export function toNum(v) {
  if (v === null || v === undefined) return NaN;
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") return Number(v.replace(/[…\s]/g, ""));
  if (v.low !== undefined && v.high !== undefined && typeof v.low.toNumber === "function") return (v.low.toNumber() + v.high.toNumber()) / 2;
  if (v.lo !== undefined && v.hi !== undefined) return (toNum(v.lo) + toNum(v.hi)) / 2;
  if (typeof v.toNumber === "function") return v.toNumber();
  if (typeof v.value === "number") return v.value;
  if (v.value !== undefined) return toNum(v.value);
  return Number(String(v));
}

/** Both ends of an interval value as numbers, or null for a point value. */
function endsOf(v) {
  if (v && v.low !== undefined && v.high !== undefined && typeof v.low.toNumber === "function") return [v.low.toNumber(), v.high.toNumber()];
  if (v && v.lo !== undefined && v.hi !== undefined) return [toNum(v.lo), toNum(v.hi)];
  return null;
}

/**
 * check: the value (or each listed value) is within tol of the target(s). An
 * interval passes only when both of its ends are within tol, so a wide
 * interval whose midpoint happens to be near the target does not.
 */
export function near(target, tol = 1e-6) {
  const targets = Array.isArray(target) ? target : [target];
  const fn = (v) => {
    const vs = Array.isArray(target) ? [...v] : [v];
    return vs.length === targets.length && vs.every((x, i) => {
      const lim = tol * Math.max(1, Math.abs(targets[i]));
      const e = endsOf(x);
      return e ? Math.abs(e[0] - targets[i]) <= lim && Math.abs(e[1] - targets[i]) <= lim : Math.abs(toNum(x) - targets[i]) <= lim;
    });
  };
  fn.text = `${targets.join(", ")} (to within ${tol})`;
  return fn;
}

/** The real and imaginary parts of a complex value: a Complex, a Rect enclosure, or a branched result. */
export function parts(z) {
  if (z && z.re !== undefined && z.im !== undefined) return [toNum(z.re), toNum(z.im)];
  if (z && z.value !== undefined) return parts(z.value);
  return [toNum(z), 0];
}

/** The [low, high] ends of each part of a complex value (equal ends for exact parts). */
function partEnds(z) {
  if (z && z.re !== undefined && z.im !== undefined) return [endsOf(z.re) ?? [toNum(z.re), toNum(z.re)], endsOf(z.im) ?? [toNum(z.im), toNum(z.im)]];
  if (z && z.value !== undefined) return partEnds(z.value);
  const e = endsOf(z) ?? [toNum(z), toNum(z)];
  return [e, [0, 0]];
}

/** check for complex values: each value (every corner of an enclosure) is within tol of the [re, im] target(s). */
export function nearC(target, tol = 1e-8) {
  const many = Array.isArray(target[0]);
  const targets = many ? target : [target];
  const fn = (v) => {
    const vs = many ? [...v] : [v];
    return vs.length === targets.length && vs.every((x, i) => {
      const [re, im] = partEnds(x);
      const [c, d] = targets[i];
      const far = Math.hypot(Math.max(...re.map((a) => Math.abs(a - c))), Math.max(...im.map((b) => Math.abs(b - d))));
      return far <= tol * Math.max(1, Math.hypot(c, d));
    });
  };
  const show = ([a, b]) => (b === 0 ? `${a}` : `${a} ${b < 0 ? "−" : "+"} ${Math.abs(b)}i`);
  fn.text = `${targets.map(show).join(", ")} (to within ${tol})`;
  return fn;
}
