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
      code: `const r = analytic.sequence("1/sqrt(n)").nFor("1/100");
[r.N, r.least, analytic.verifyCertificate(r.certificate).valid]`,
      expect: "[10001, true, true]",
      fix: "analytic#20",
      note: "<code>nFor</code> proves the tail (the terms fall to the limit, so the distance never grows) and finds the least \\(N\\): 10000 fails because \\(1/\\sqrt{10000}\\) equals \\(\\varepsilon\\). <code>verifyCertificate</code> rechecks the result by another route.",
    },
    {
      topic: "Monotone sequences and the supremum",
      q: t`Let \(a_n = 1 - \tfrac1n\). Is it monotone? Find \(\sup a_n\) and \(\inf a_n\).`,
      a: t`Increasing, since \(\tfrac1n\) decreases. \(\inf = a_1 = 0\) (attained); \(\sup = \lim a_n = 1\) (not attained).`,
      code: `const a = analytic.sequence("1 - 1/n");
const [s, i] = [a.supremum(), a.infimum()];
[a.monotone().direction, s.value, s.attained, i.value, i.attained]`,
      expect: `["increasing", 1, false, 0, true]`,
      fix: "analytic#20",
      note: "<code>supremum()</code> and <code>infimum()</code> give the value and whether a term takes it, from the proven direction: an increasing sequence approaches its limit without reaching it, and its first term is its least.",
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
      code: `[analytic.sum("n!/n^n").ratioTest().verdict, analytic.sequence("(n/(n+1))^n").limit()]`,
      check: (v) => v[0] === "convergent" && Math.abs((v[1].low.toNumber() + v[1].high.toNumber()) / 2 - Math.exp(-1)) < 1e-12,
      expectText: `["convergent", 1/e ≈ 0.367879441171]`,
      fix: "analytic#20",
      note: "The ratio \\((n/(n+1))^n\\) is a power with a moving exponent; its limit \\(1/e\\) is now proven (as an enclosure), so <code>ratioTest()</code> concludes.",
    },
    {
      topic: "Alternating series error",
      q: t`How many terms of \(\displaystyle\sum_{n\ge1} \frac{(-1)^{n+1}}{n^2}\) guarantee an error below 0.001?`,
      a: t`The error after \(N\) terms is below \(\dfrac1{(N+1)^2}\); \((N + 1)^2 > 1000\) needs \(N + 1 \ge 32\), so \(N = 31\).`,
      fix: "analytic#19",
      code: `const r = analytic.sum("(-1)^(n+1)/n^2").termsForError("1/1000");
[r.terms, r.bound]`,
      expect: `[31, 1/1024]`,
      note: "<code>termsForError</code> proves the term sizes decrease, then finds the first \\(N\\) with \\(|a_{N+1}| \\le 0.001\\); the bound is \\(1/32^2\\).",
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
      code: `const r = analytic.deltaFor("x^2", 2, "1/100", { delta: "0.002" });
[r.holds, r.worst, analytic.verifyCertificate(r.certificate).valid, analytic.deltaFor("x^2", 2, "1/100").largest]`,
      check: (v) => v[0] === true && String(v[1]) === "2001/250000" && v[2] === true && Math.abs((v[3].low.toNumber() + v[3].high.toNumber()) / 2 - (Math.sqrt(4.01) - 2)) < 1e-9,
      expectText: "[true, 2001/250000, true, √4.01 − 2 ≈ 0.0024984]",
      fix: "analytic#20",
      note: "<code>deltaFor</code> proves that \\(\\delta = 0.002\\) works (the worst case is at the end \\(2.002\\), since \\(x^2\\) is monotone on each side of 2), the certificate is rechecked by plain interval evaluation, and without a \\(\\delta\\) it also gives the largest one, \\(\\sqrt{4.01} - 2\\).",
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
      fix: "analytic#19",
      code: `const d = analytic.darboux("x^2", { interval: [0, 1], n: 4 });
[d.lower, d.upper, d.exact]`,
      expect: "[7/32, 15/32, true]",
      note: "<code>darboux</code> proves \\(x^2\\) increasing on each piece, so the inf and sup are end values and the sums are exact.",
    },
    {
      topic: "An improper integral",
      fix: "symbolic#8",
      q: t`Evaluate \(\displaystyle\int_0^1 \ln x\,dx\).`,
      a: t`\(\displaystyle\lim_{a\to0^+}\big[x\ln x - x\big]_a^1 = -1 - \lim_{a\to0^+}(a\ln a - a) = -1\).`,
      code: `symbolic.integrate("ln(x)", "x", { from: 0, to: 1 }).value`,
      expect: "-1",
      note: "Used to return <code>null</code>: an endpoint where the antiderivative needs a limit was not handled. Now the value is the one-sided limits of the antiderivative, checked against analytic's certified improper integral.",
    },
    {
      topic: "Pointwise limit",
      fix: "analytic#18",
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
      expect: `["uniform", "not uniform"]`,
      fix: "analytic#20",
      note: "Both are now proven: \\(x^n\\) is increasing in \\(x\\) on the interval for every \\(n\\), so the supremum is at the right end, where it tends to 0 on \\([0, \\tfrac12]\\) and to 1 on \\([0, 1]\\) (and the supremum over \\([0, 1)\\) is the same, by continuity).",
    },
    {
      topic: "Limits superior and inferior",
      q: t`Find \(\limsup\) and \(\liminf\) of \(a_n = (-1)^n\left(1 + \tfrac1n\right)\).`,
      a: t`Even terms \(1 + \tfrac1n \to 1\); odd terms \(-(1 + \tfrac1n) \to -1\). \(\limsup = 1\), \(\liminf = -1\); no limit.`,
      code: `const a = analytic.sequence("(-1)^n*(1 + 1/n)");
[a.limsup(), a.liminf(), a.accumulation().converges]`,
      expect: "[1, -1, false]",
      fix: "analytic#20",
      note: "The sequence is split into \\(n = 2m\\) and \\(n = 2m + 1\\); the two limits are the only accumulation points. <code>limit()</code> now refuses with “the terms oscillate, with lim sup 1 and lim inf -1”.",
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
      code: `const a = analytic.sequence("(1 + 1/n)^n");
const m = a.monotone();
[a.limit(), m.direction, m.proven]`,
      check: (v) => Math.abs((v[0].low.toNumber() + v[0].high.toNumber()) / 2 - Math.E) < 1e-12 && v[1] === "increasing" && v[2] === "for every n ≥ 1",
      expectText: `[e ≈ 2.718281828459, "increasing", "for every n ≥ 1"]`,
      fix: "analytic#20",
      note: "The limit is enclosed, and <code>monotone()</code> now proves the direction through the derivative of the logarithm, \\(\\log(1 + 1/n) - 1/(n + 1)\\), which tends to 0 while decreasing and so is positive.",
    },
  ],
};
