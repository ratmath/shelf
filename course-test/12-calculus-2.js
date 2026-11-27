const t = String.raw;
import { near } from "./lib.js";

export default {
  title: "Calculus II",
  level: "University: first two years",
  short: "Techniques of integration, improper integrals, applications, numerical integration, sequences and series, Taylor series, polar area.",
  blurb: "Integration by parts, trigonometric integrals and substitutions, partial fractions, improper integrals, volumes of revolution and arc length, Simpson's rule, limits of sequences, convergence tests, alternating series, power series and their intervals of convergence, Taylor polynomials and the remainder, and area in polar coordinates.",
  exercises: [
    {
      topic: "Integration by parts",
      q: t`\(\displaystyle\int x e^x\,dx\)`,
      a: t`\(xe^x - e^x + C\).`,
      code: `symbolic.integrate("x*exp(x)", "x").result`,
      expect: "x*exp(x) - exp(x)",
    },
    {
      topic: "Parts with a logarithm",
      q: t`\(\displaystyle\int x^2\ln x\,dx\)`,
      a: t`\(\tfrac{x^3}{3}\ln x - \tfrac{x^3}{9} + C\).`,
      code: `symbolic.integrate("x^2*log(x)", "x").result`,
      expect: "-x^3/9 + x^3*log(x)/3",
    },
    {
      topic: "Trigonometric integral",
      q: t`\(\displaystyle\int \sin^3 x\,dx\)`,
      a: t`\(\int (1 - \cos^2 x)\sin x\,dx = -\cos x + \tfrac{\cos^3 x}{3} + C\).`,
      code: `const F = symbolic.integrate("sin(x)^3", "x");
PRINT(F);
symbolic.equal(String(F.result), "-cos(x) + cos(x)^3/3")`,
      expect: /^equal/,
      expectText: "-cos x + cos³x/3 + C",
    },
    {
      topic: "Arctangent form",
      q: t`\(\displaystyle\int \frac{dx}{x^2 + 4}\)`,
      a: t`\(\tfrac12\arctan\tfrac x2 + C\).`,
      code: `symbolic.integrate("1/(x^2 + 4)", "x").result`,
      expect: ["1/2*atan(1/2*x)", "atan(x/2)/2", "1/2*atan(x/2)"],
    },
    {
      topic: "Trigonometric substitution",
      q: t`\(\displaystyle\int \frac{dx}{\sqrt{9 - x^2}}\)`,
      a: t`\(\arcsin\tfrac x3 + C\).`,
      code: `symbolic.integrate("1/sqrt(9 - x^2)", "x").result`,
      expect: ["asin(1/3*x)", "asin(x/3)"],
    },
    {
      topic: "Partial fractions",
      q: t`\(\displaystyle\int \frac{3x + 5}{(x + 1)(x + 2)}\,dx\)`,
      a: t`\(\tfrac{2}{x + 1} + \tfrac{1}{x + 2}\): \(2\ln|x + 1| + \ln|x + 2| + C\).`,
      code: `[symbolic.apart("(3x + 5)/((x + 1)(x + 2))", "x"), symbolic.integrate("(3x + 5)/((x + 1)(x + 2))", "x").result]`,
      expect: "[2/(x + 1) + 1/(x + 2), 2*log(abs(1 + x)) + log(abs(2 + x))]",
    },
    {
      topic: "Improper integral, infinite interval",
      fix: "symbolic#8",
      q: t`\(\displaystyle\int_1^\infty \frac{dx}{x^2}\)`,
      a: t`\(\lim_{b\to\infty}(1 - 1/b) = 1\).`,
      code: `symbolic.integrate("1/x^2", "x", { from: 1, to: "inf" }).value`,
      expect: "1",
      note: "Bug: <code>to: \"inf\"</code> was read as a letter named <em>inf</em>, so the value came back as <code>(inf - 1)/inf</code>.",
    },
    {
      topic: "Improper integral, unbounded integrand",
      fix: "symbolic#8",
      q: t`\(\displaystyle\int_0^1 \frac{dx}{\sqrt x}\)`,
      a: t`\([2\sqrt x]_0^1 = 2\).`,
      code: `symbolic.integrate("1/sqrt(x)", "x", { from: 0, to: 1 }).value`,
      expect: "2",
      note: "symbolic finds \\(2\\sqrt x\\) but declines the definite integral (value <code>null</code>: the integrand cannot be bounded on the interval). That is honest, but the improper integral converges and the antiderivative has a limit at 0.",
    },
    {
      topic: "Volume of revolution",
      q: t`The region under \(y = \sqrt x\), \(0 \le x \le 4\), is turned about the \(x\)-axis. Find the volume.`,
      a: t`\(\pi\int_0^4 x\,dx = 8\pi\).`,
      code: `symbolic.integrate("pi*sqrt(x)^2", "x", { from: 0, to: 4 }).value`,
      expect: "8*pi",
    },
    {
      topic: "Arc length",
      q: t`Find the length of \(y = \tfrac23 x^{3/2}\) from \(x = 0\) to \(x = 3\).`,
      a: t`\(\int_0^3 \sqrt{1 + x}\,dx = \tfrac23(8 - 1) = \tfrac{14}{3}\).`,
      code: `const dy = symbolic.sym("2/3*x^(3/2)").diff("x");
symbolic.integrate(\`sqrt(1 + (\${dy})^2)\`, "x", { from: 0, to: 3 }).value`,
      expect: "14/3",
    },
    {
      topic: "Simpson's rule",
      q: t`Use Simpson's rule with \(n = 4\) to estimate \(\int_0^1 \frac{dx}{1 + x^2}\). Compare with the exact value.`,
      a: t`\(\tfrac{1}{12}\bigl[1 + 4\cdot\tfrac{16}{17} + 2\cdot\tfrac45 + 4\cdot\tfrac{16}{25} + \tfrac12\bigr] = \tfrac{8011}{10200} \approx 0.785392\); exact \(\pi/4 \approx 0.785398\).`,
      code: `const f = (x) => R\`1/(1 + \${x}^2)\`, h = R\`1/4\`;
const S = h.divide(R\`3\`).multiply(f(0).add(R\`4\`.multiply(f(h))).add(R\`2\`.multiply(f(R\`1/2\`))).add(R\`4\`.multiply(f(R\`3/4\`))).add(f(1)));
[S, symbolic.integrate("1/(1 + x^2)", "x", { from: 0, to: 1 }).value]`,
      expect: "[8011/10200, pi/4]",
    },
    {
      topic: "Limit of a sequence",
      q: t`\(\displaystyle\lim_{n\to\infty}\left(1 + \frac2n\right)^n\)`,
      a: t`\(e^2\).`,
      code: `symbolic.limit("(1 + 2/n)^n", "n", "inf").value`,
      expect: "e^2",
    },
    {
      topic: "p-series",
      q: t`Does \(\sum_{n\ge1} 1/n^2\) converge? What is its sum?`,
      a: t`Yes (a \(p\)-series with \(p = 2 > 1\)); the sum is \(\pi^2/6\).`,
      code: `[analytic.sum("1/k^2", { variable: "k" }).convergence().convergence, symbolic.sum("1/k^2", "k", 1, "inf").value]`,
      expect: '["absolutely convergent", pi^2/6]',
    },
    {
      topic: "Ratio test",
      q: t`Show \(\sum_{n\ge1} n^2/2^n\) converges and find its sum.`,
      a: t`Ratio \(\to \tfrac12 < 1\). Using \(\sum n^2x^n = \tfrac{x(1 + x)}{(1 - x)^3}\) at \(x = \tfrac12\): sum 6.`,
      code: `[analytic.sum("k^2/2^k", { variable: "k" }).ratioTest().conclusion ?? analytic.sum("k^2/2^k", { variable: "k" }).convergence().convergence, symbolic.sum("k^2/2^k", "k", 1, "inf").value]`,
      expect: /converg.*, 6\]$/,
      expectText: "[converges, 6]",
    },
    {
      topic: "Alternating series",
      q: t`Does \(\sum_{n\ge1} (-1)^{n+1}/n\) converge absolutely, conditionally, or not at all? What is the sum?`,
      a: t`Conditionally (the harmonic series diverges; the alternating series test applies). Sum \(\ln 2\).`,
      code: `[analytic.sum("(-1)^(k+1)/k", { variable: "k" }).convergence().convergence, symbolic.sum("(-1)^(k+1)/k", "k", 1, "inf").value]`,
      expect: '["conditionally convergent", log(2)]',
    },
    {
      topic: "Interval of convergence",
      q: t`Find the interval of convergence of \(\displaystyle\sum_{n\ge1}\frac{(x - 3)^n}{n\,2^n}\).`,
      a: t`\(R = 2\). At \(x = 5\): harmonic, diverges; at \(x = 1\): alternating harmonic, converges. \([1, 5)\).`,
      code: `analytic.powerSeries("1/(n*2^n)", { index: "n", from: 1, centre: 3 }).interval().text`,
      expect: "[1, 5)",
    },
    {
      topic: "Taylor polynomial",
      q: t`Find the degree-4 Taylor polynomial of \(\cos x\) at 0.`,
      a: t`\(1 - \tfrac{x^2}{2} + \tfrac{x^4}{24}\).`,
      code: `symbolic.taylor("cos(x)", "x", 0, 4)`,
      expect: "1 - 1/2*x^2 + 1/24*x^4 + …",
    },
    {
      topic: "Taylor series about a point",
      q: t`Expand \(e^x\) about \(x = 1\) up to \((x - 1)^3\).`,
      a: t`\(e\left[1 + (x - 1) + \tfrac{(x-1)^2}{2} + \tfrac{(x-1)^3}{6}\right]\).`,
      code: `symbolic.taylor("exp(x)", "x", 1, 3)`,
      expect: "e + e*(x - 1) + e/2*(x - 1)^2 + e/6*(x - 1)^3 + …",
    },
    {
      topic: "Remainder bound",
      q: t`Approximate \(e^{0.1}\) by its degree-2 Maclaurin polynomial and bound the error.`,
      a: t`\(1 + 0.1 + 0.005 = 1.105\). \(|R_2| \le e^{0.1}\tfrac{(0.1)^3}{6} < 1.2 \cdot \tfrac{0.001}{6} = 0.0002\). (True error \(0.000171\).)`,
      code: `const r = analytic.taylorRemainder("exp(x)", { about: 0, order: 2, on: [0, "0.1"] });
PRINT(r);
symbolic.taylor("exp(x)", "x", 0, 2)`,
      expect: "1 + x + 1/2*x^2 + …",
      status: "partial",
      note: "taylorRemainder gives Lagrange's bound and the true maximum error (shown in the printed line); the value 1.105 is read from the polynomial.",
    },
    {
      topic: "Polar area",
      q: t`Find the area inside \(r = 2\cos\theta\).`,
      a: t`\(\tfrac12\int_{-\pi/2}^{\pi/2} 4\cos^2\theta\,d\theta = \pi\) (a circle of radius 1).`,
      code: `symbolic.integrate("1/2*(2cos(t))^2", "t", { from: "-pi/2", to: "pi/2" }).value`,
      expect: "pi",
    },
  ],
};
