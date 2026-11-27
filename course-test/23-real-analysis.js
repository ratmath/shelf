const t = String.raw;
import { near } from "./lib.js";

export default {
  title: "Real analysis",
  level: "University: upper level",
  short: "Limits of sequences, suprema and monotone sequences, series tests and sums, power series, ε–δ continuity, the mean value and intermediate value theorems, Taylor remainders, Riemann sums, uniform convergence, contractions.",
  blurb: "Limits of sequences and functions, an \(N\) for a given \(\varepsilon\), monotone and bounded sequences and their supremum, telescoping and \(p\)-series, the ratio and alternating series tests with error bounds, radius of convergence, a \(\delta\) for a given \(\varepsilon\), the mean value and intermediate value theorems, Lagrange's remainder, upper and lower Darboux sums, uniform and pointwise convergence, an improper integral, limits superior and inferior, and the contraction mapping theorem.",
  exercises: [
    {
      topic: "Limit of a sequence",
      q: t`Find \(\displaystyle\lim_{n\to\infty} \frac{3n^2 + 1}{2n^2 - n}\).`,
      a: t`Divide by \(n^2\): \(\dfrac{3 + 1/n^2}{2 - 1/n} \to \dfrac32\).`,
      code: `analytic.sequence("(3n^2 + 1)/(2n^2 - n)").limit()`,
      expect: "3/2",
    },
    {
      topic: "An N for a given ε",
      q: t`Find the least \(N\) such that \(\dfrac1{\sqrt n} < 0.01\) for every \(n \ge N\).`,
      a: t`\(\sqrt n > 100 \iff n > 10000\): \(N = 10001\).`,
      code: `const eps = R\`1/100\`;
// 1/√n < ε  ⟺  n > 1/ε²
new Integer(R\`1\`.divide(eps.multiply(eps)).floor() + 1n)`,
      expect: "10001",
      status: "partial",
      note: "Done by solving the inequality by hand; there is no helper that finds an \\(N\\) for a given \\(\\varepsilon\\).",
    },
    {
      topic: "Monotone sequences and the supremum",
      q: t`Let \(a_n = 1 - \tfrac1n\). Is it monotone? Find \(\sup a_n\) and \(\inf a_n\).`,
      a: t`Increasing, since \(\tfrac1n\) decreases. \(\inf = a_1 = 0\) (attained); \(\sup = \lim a_n = 1\) (not attained).`,
      code: `const a = analytic.sequence("1 - 1/n");
[a.monotone().direction, a.bounds().lower, a.limit()]`,
      expect: `["increasing", 0, 1]`,
      status: "partial",
      note: "<code>bounds()</code> gives a proven upper bound of 5/4, not the supremum 1; the supremum is read off as the limit of an increasing sequence.",
    },
    {
      topic: "Telescoping series",
      q: t`Sum \(\displaystyle\sum_{n=1}^{\infty} \frac{1}{n(n+1)}\).`,
      a: t`\(\dfrac1{n(n+1)} = \dfrac1n - \dfrac1{n+1}\); partial sums \(1 - \dfrac1{N+1} \to 1\).`,
      code: `symbolic.sum("1/(n*(n+1))", "n", 1, "inf").value`,
      expect: "1",
    },
    {
      topic: "Ratio test",
      q: t`Does \(\displaystyle\sum \frac{n!}{n^n}\) converge? Find the limit of the ratio of consecutive terms.`,
      a: t`\(\dfrac{a_{n+1}}{a_n} = \left(\dfrac{n}{n+1}\right)^n \to \dfrac1e < 1\): converges.`,
      code: `[analytic.sum("n!/n^n").ratioTest().verdict, symbolic.limit("(n/(n+1))^n", "n", "inf").value]`,
      expect: `["convergent", 1/e]`,
      status: "gap",
      note: "<code>analytic.sum(…).ratioTest()</code> says “inconclusive: the limit of |a(n+1)/a(n)| was not found”, and <code>convergence()</code> is undecided; the limit itself is found by <code>symbolic.limit</code>, and the conclusion is drawn by hand.",
    },
    {
      topic: "Alternating series error",
      q: t`How many terms of \(\displaystyle\sum_{n\ge1} \frac{(-1)^{n+1}}{n^2}\) guarantee an error below 0.001?`,
      a: t`The error after \(N\) terms is below \(\dfrac1{(N+1)^2}\); \((N + 1)^2 > 1000\) needs \(N + 1 \ge 32\), so \(N = 31\).`,
      code: `const S = analytic.sum("(-1)^(n+1)/n^2");
let N = 1;
while (!R\`1/(\${N + 1})^2\`.lessThan(R\`1/1000\`)) N++;
[S.alternatingTest().verdict, N]`,
      expect: `["convergent", 31]`,
      status: "partial",
      note: "The test confirms convergence and states the error bound; the number of terms is found with a short loop.",
    },
    {
      topic: "Radius of convergence",
      q: t`Find the radius of convergence of \(\displaystyle\sum \frac{n^2}{3^n} x^n\).`,
      a: t`\(\left|\dfrac{c_{n+1}}{c_n}\right| = \dfrac{(n+1)^2}{3n^2} \to \dfrac13\), so \(R = 3\).`,
      code: `analytic.powerSeries("n^2/3^n").radius().radius`,
      expect: "3",
    },
    {
      topic: "Limits of functions",
      q: t`Find \(\displaystyle\lim_{x\to0}\frac{1 - \cos x}{x^2}\).`,
      a: t`\(1 - \cos x = \tfrac{x^2}{2} - \tfrac{x^4}{24} + \cdots\), so the limit is \(\tfrac12\).`,
      code: `symbolic.limit("(1 - cos(x))/x^2", "x", 0).value`,
      expect: "1/2",
    },
    {
      topic: "A δ for a given ε",
      q: t`For \(f(x) = x^2\) at \(a = 2\) and \(\varepsilon = 0.01\), show \(\delta = \min(1, \varepsilon/5) = 0.002\) works.`,
      a: t`If \(|x - 2| < \delta \le 1\) then \(|x + 2| < 5\), so \(|x^2 - 4| = |x - 2||x + 2| < 5\delta \le \varepsilon\). Concretely the worst case is \((2.002)^2 - 4 = 0.008004 < 0.01\).`,
      code: `const d = R\`0.002\`;
const worst = R\`2\`.add(d).pow(2).subtract(R\`4\`);   // x² − 4 is largest in size at x = 2 + δ
[worst, worst.lessThan(R\`0.01\`)]`,
      expect: "[2001/250000, true]",
      status: "partial",
      note: "Only the worst case is checked, by hand; no ε–δ helper.",
    },
    {
      topic: "Mean value theorem",
      q: t`Find the \(c\) in \((0, 2)\) promised by the mean value theorem for \(f(x) = x^3\).`,
      a: t`\(\dfrac{f(2) - f(0)}{2} = 4 = 3c^2\), so \(c = \dfrac{2}{\sqrt3} = \dfrac{2\sqrt3}{3} \approx 1.1547\).`,
      code: `symbolic.solve("3x^2 = 4", "x")`,
      expect: "x = -2*sqrt(3)/3,  2*sqrt(3)/3",
      note: "Both roots come back; the one in \\((0, 2)\\) is chosen by hand.",
    },
    {
      topic: "Intermediate value theorem",
      q: t`Show \(x^3 - x - 1\) has a root in \([1, 2]\) and find it to six decimals.`,
      a: t`\(f(1) = -1 < 0 < 5 = f(2)\). Bisection or Newton gives \(x \approx 1.324718\) (the plastic number).`,
      code: `analytic.bisection("x^3 - x - 1", ["1", "2"]).root`,
      check: near(1.3247179572, 1e-9),
    },
    {
      topic: "Taylor's remainder",
      q: t`Bound the error of the degree-4 Taylor polynomial of \(e^x\) about 0 on \([0, 1]\), and compare with the true error.`,
      a: t`Lagrange: \(|R_4| \le \dfrac{e\cdot1^5}{5!} = \dfrac{e}{120} \approx 0.02265\). The true maximum error, at \(x = 1\), is \(e - \tfrac{65}{24} \approx 0.009948\).`,
      code: `const T = analytic.taylorRemainder("exp(x)", { order: 4, on: ["0", "1"] });
[T.bound, T.actual]`,
      check: near([Math.E / 120, Math.E - 65 / 24], 1e-3),
    },
    {
      topic: "Darboux sums",
      q: t`Compute the lower and upper sums of \(f(x) = x^2\) on \([0, 1]\) with four equal pieces.`,
      a: t`\(f\) is increasing: \(L = \tfrac14(0 + \tfrac1{16} + \tfrac4{16} + \tfrac9{16}) = \tfrac{7}{32}\), \(U = \tfrac14(\tfrac1{16} + \tfrac4{16} + \tfrac9{16} + 1) = \tfrac{15}{32}\).`,
      code: `const f = (x) => x.multiply(x);
const xs = [0, 1, 2, 3, 4].map((k) => R\`\${k}/4\`);
const h = R\`1/4\`;
let L = R\`0\`, U = R\`0\`;
for (let i = 0; i < 4; i++) { L = L.add(f(xs[i]).multiply(h)); U = U.add(f(xs[i + 1]).multiply(h)); }
[L, U]`,
      expect: "[7/32, 15/32]",
      status: "partial",
      note: "Written out with Core arithmetic (using that \\(x^2\\) is increasing); there is no Darboux or Riemann sum helper with the inf and sup on each piece.",
    },
    {
      topic: "An improper integral",
      q: t`Evaluate \(\displaystyle\int_0^1 \ln x\,dx\).`,
      a: t`\(\displaystyle\lim_{a\to0^+}\big[x\ln x - x\big]_a^1 = -1 - \lim_{a\to0^+}(a\ln a - a) = -1\).`,
      code: `symbolic.integrate("ln(x)", "x", { from: 0, to: 1 }).value`,
      expect: "-1",
      status: "gap",
      note: "Returns <code>null</code>: the antiderivative is found, but an endpoint where it needs a limit is not handled (the same limitation as \\(\\int_0^1 x^{-1/2}dx\\) in Calculus II).",
    },
    {
      topic: "Pointwise limit",
      q: t`Find the pointwise limit of \(f_n(x) = x^n\) on \([0, 1]\).`,
      a: t`\(0\) for \(0 \le x < 1\) and \(1\) at \(x = 1\): a discontinuous limit of continuous functions.`,
      code: `const F = analytic.functionSequence("x^n");
[F.pointwise("1/2"), F.pointwise("1")]`,
      expect: "[0, 1]",
      note: "Throws “an exponent may oscillate with growing size”: <code>pointwise</code> hands \\(x\\) to the sequence as a parameter that the limit code never substitutes. A bug; see the analytic fix.",
    },
    {
      topic: "Uniform convergence",
      q: t`Does \(x^n \to 0\) uniformly on \([0, \tfrac12]\)? On \([0, 1)\)?`,
      a: t`On \([0, \tfrac12]\): \(\sup|x^n| = 2^{-n} \to 0\), so yes. On \([0, 1)\): \(\sup = 1\) for every \(n\), so no.`,
      code: `const F = analytic.functionSequence("x^n");
[F.uniform(["0", "1/2"]).verdict, F.uniform(["0", "1"]).verdict]`,
      expect: "[uniform, not uniform]",
      status: "gap",
      note: "Gives <code>undecided</code> on \\([0, \\tfrac12]\\) (the suprema \\(2^{-n}\\) are listed, but no bound for every \\(n\\) is proven) and <code>not uniform so far</code> on \\([0, 1]\\), which it calls evidence rather than proof. The sup of a monotone power is attained at the end, which would settle both.",
    },
    {
      topic: "Limits superior and inferior",
      q: t`Find \(\limsup\) and \(\liminf\) of \(a_n = (-1)^n\left(1 + \tfrac1n\right)\).`,
      a: t`Even terms \(1 + \tfrac1n \to 1\); odd terms \(-(1 + \tfrac1n) \to -1\). \(\limsup = 1\), \(\liminf = -1\); no limit.`,
      code: `analytic.sequence("(-1)^n*(1 + 1/n)").limit()`,
      expect: "no limit (limsup 1, liminf -1)",
      status: "gap",
      note: "No lim sup or lim inf. <code>limit()</code> throws “the argument of a logarithm could not be shown positive near infinity”, a confusing message for a sequence that simply has no limit, and <code>bounds()</code> cannot bound it either.",
    },
    {
      topic: "Series value",
      q: t`Find \(\displaystyle\sum_{n=1}^{\infty} \frac{(-1)^{n+1}}{n^2}\).`,
      a: t`\(\left(1 - 2\cdot\tfrac14\right)\zeta(2) = \tfrac12\cdot\tfrac{\pi^2}{6} = \tfrac{\pi^2}{12}\).`,
      code: `symbolic.sum("(-1)^(n+1)/n^2", "n", 1, "inf").value`,
      expect: "pi^2/12",
    },
    {
      topic: "Contraction mapping",
      q: t`Show \(g(x) = \cos x\) is a contraction on \([0, 1]\) and find its fixed point.`,
      a: t`\(g\) maps \([0, 1]\) into \([\cos 1, 1] \subset [0, 1]\) and \(|g'(x)| = |\sin x| \le \sin 1 < 1\). The fixed point (the Dottie number) is \(0.7390851332\ldots\).`,
      code: `analytic.fixedPoint("cos(x)", "1").root`,
      check: near(0.7390851332151607, 1e-12),
    },
    {
      topic: "Euler's number",
      q: t`Find \(\displaystyle\lim_{n\to\infty}\left(1 + \frac1n\right)^n\) and show the sequence is increasing.`,
      a: t`The limit is \(e\). By AM–GM on \(n\) copies of \(1 + \tfrac1n\) and one 1, \(a_n \le a_{n+1}\).`,
      code: `symbolic.limit("(1 + 1/n)^n", "n", "inf").value`,
      expect: "e",
      status: "partial",
      note: "The limit is found; <code>analytic.sequence(\"(1 + 1/n)^n\").monotone()</code> throws “no ray was found on which (1 + 1/n)^n is proven monotone”, so monotonicity is left to the proof.",
    },
  ],
};
