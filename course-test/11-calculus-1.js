const t = String.raw;
import { near } from "./lib.js";

export default {
  title: "Calculus I",
  level: "University: first two years",
  short: "Limits, derivatives and their rules, tangent lines, extrema, related rates, optimisation, Newton's method, integrals and the fundamental theorem.",
  blurb: "Limits including trigonometric and at infinity, the derivative rules (product, quotient, chain), implicit differentiation, tangent lines and linear approximation, critical points and the first and second derivative tests, absolute extrema, related rates, optimisation, Newton's method, Riemann sums, the fundamental theorem of calculus, substitution and the area between curves.",
  exercises: [
    {
      topic: "A trigonometric limit",
      q: t`\(\displaystyle\lim_{x\to 0}\frac{\sin 5x}{x}\)`,
      a: t`\(5 \cdot \lim \frac{\sin 5x}{5x} = 5\).`,
      code: `symbolic.limit("sin(5x)/x", "x", 0).value`,
      expect: "5",
    },
    {
      topic: "Limit at infinity",
      q: t`\(\displaystyle\lim_{x\to\infty}\frac{3x^2 - x}{5x^2 + 2}\)`,
      a: t`Divide by \(x^2\): \(\tfrac35\).`,
      code: `symbolic.limit("(3x^2 - x)/(5x^2 + 2)", "x", "inf").value`,
      expect: "3/5",
    },
    {
      topic: "Product rule",
      q: t`Differentiate \(x^3\sin x\).`,
      a: t`\(3x^2\sin x + x^3\cos x\).`,
      code: `symbolic.sym("x^3*sin(x)").diff("x")`,
      expect: "3*x^2*sin(x) + x^3*cos(x)",
    },
    {
      topic: "Quotient rule",
      q: t`Differentiate \(\dfrac{x^2 + 1}{x - 2}\).`,
      a: t`\(\dfrac{2x(x - 2) - (x^2 + 1)}{(x - 2)^2} = \dfrac{x^2 - 4x - 1}{(x - 2)^2}\).`,
      code: `symbolic.simplify(symbolic.sym("(x^2 + 1)/(x - 2)").diff("x"))`,
      expect: ["(x^2 - 4*x - 1)/(x - 2)^2", "(x^2 - 4*x - 1)/(x^2 - 4*x + 4)"],
    },
    {
      topic: "Chain rule",
      q: t`Differentiate \(\sqrt{3x^2 + 1}\).`,
      a: t`\(\dfrac{6x}{2\sqrt{3x^2 + 1}} = \dfrac{3x}{\sqrt{3x^2 + 1}}\).`,
      code: `symbolic.simplify(symbolic.sym("sqrt(3x^2 + 1)").diff("x"))`,
      expect: ["3*x/sqrt(3*x^2 + 1)", "3*x*(3*x^2 + 1)^(-1/2)"],
    },
    {
      topic: "Exponentials and logarithms",
      q: t`Differentiate \(e^{2x}\ln x\).`,
      a: t`\(2e^{2x}\ln x + \dfrac{e^{2x}}{x}\).`,
      code: `symbolic.sym("exp(2x)*log(x)").diff("x")`,
      expect: "2*exp(2*x)*log(x) + exp(2*x)*(1/x)",
    },
    {
      topic: "Implicit differentiation",
      q: t`Find \(dy/dx\) for \(x^2 + y^2 = 25\) at the point \((3, 4)\).`,
      a: t`\(2x + 2yy' = 0\), \(y' = -x/y = -\tfrac34\).`,
      code: `const F = symbolic.sym("x^2 + y^2 - 25");
const slope = symbolic.simplify(\`-(\${F.diff("x")})/(\${F.diff("y")})\`);
PRINT("dy/dx =", slope);
symbolic.sym(String(slope)).subs({ x: 3, y: 4 }).simplify()`,
      expect: "-3/4",
      status: "partial",
      note: "There is no implicit differentiation; the code uses \\(dy/dx = -F_x/F_y\\), which the student has to know.",
    },
    {
      topic: "Tangent line",
      q: t`Find the tangent line to \(y = x^3 - 2x\) at \(x = 1\).`,
      a: t`\(y(1) = -1\), \(y'(1) = 1\): \(y = x - 2\).`,
      code: `const f = symbolic.sym("x^3 - 2x"), m = f.diff("x").subs({ x: 1 }).simplify(), y1 = f.subs({ x: 1 }).simplify();
symbolic.expand(\`\${m}*(x - 1) + \${y1}\`)`,
      expect: "x - 2",
    },
    {
      topic: "Critical points",
      q: t`Find and classify the critical points of \(f(x) = x^3 - 3x^2 - 9x + 5\).`,
      a: t`\(f' = 3(x - 3)(x + 1)\). Local maximum \(f(-1) = 10\); local minimum \(f(3) = -22\).`,
      code: `analytic.extrema("x^3 - 3x^2 - 9x + 5", [-5, 5]).exact().filter((e) => e.kind !== "endpoint").map((e) => [e.kind, e.at, e.value])`,
      expect: /max.*-1.*10.*min.*3.*-22/,
      expectText: "local max at -1 (10), local min at 3 (-22)",
    },
    {
      topic: "Absolute extrema",
      q: t`Find the absolute maximum and minimum of \(f(x) = x^3 - 3x\) on \([0, 2]\).`,
      a: t`\(f'(x) = 0\) at \(x = 1\); \(f(0) = 0\), \(f(1) = -2\), \(f(2) = 2\). Max 2 at \(x = 2\), min \(-2\) at \(x = 1\).`,
      code: `analytic.extrema("x^3 - 3x", [0, 2]).exact().map((e) => [e.kind, e.at, e.value])`,
      expect: /min.*1.*-2|max.*2.*2/,
      expectText: "max 2 at x = 2, min -2 at x = 1",
    },
    {
      topic: "Inflection points",
      q: t`Find the inflection points of \(f(x) = x^4 - 6x^2\).`,
      a: t`\(f'' = 12x^2 - 12 = 0\) at \(x = \pm 1\), where \(f''\) changes sign: \((-1, -5)\) and \((1, -5)\).`,
      code: `analytic.inflections("x^4 - 6x^2", [-3, 3]).exact().map((p) => [p.at, p.value])`,
      expect: "[[-1, -5], [1, -5]]",
    },
    {
      topic: "Related rates",
      q: t`A balloon's radius grows at 2 cm/s. How fast is its volume growing when the radius is 5 cm?`,
      a: t`\(\dot V = 4\pi r^2 \dot r = 4\pi \cdot 25 \cdot 2 = 200\pi\ \text{cm}^3/\text{s}\).`,
      code: `symbolic.simplify(String(symbolic.sym("4/3*pi*r^3").diff("r").subs({ r: 5 })) + "*2")`,
      expect: "200*pi",
    },
    {
      topic: "Optimisation",
      q: t`A rectangle has perimeter 40. What dimensions give the greatest area?`,
      a: t`\(A = x(20 - x)\), \(A' = 20 - 2x = 0\): a 10 by 10 square, area 100.`,
      code: `const s = symbolic.solve(String(symbolic.sym("x*(20 - x)").diff("x")) + " = 0", "x");
[s, symbolic.sym("x*(20 - x)").subs({ x: 10 }).simplify()]`,
      expect: "[x = 10, 100]",
    },
    {
      topic: "Linear approximation",
      q: t`Use a linear approximation to estimate \(\sqrt{4.1}\).`,
      a: t`\(2 + \tfrac{1}{4}(0.1) = 2.025\).`,
      code: `symbolic.taylor("sqrt(x)", "x", 4, 1)`,
      expect: /2 \+ 1\/4\*\(x - 4\)/,
      expectText: "2 + (x - 4)/4, so 2.025",
    },
    {
      topic: "Newton's method",
      q: t`Apply Newton's method to \(x^2 - 2 = 0\) from \(x_0 = 1\). Give \(x_1, x_2, x_3\) as fractions.`,
      a: t`\(x_{n+1} = \tfrac{x_n}{2} + \tfrac{1}{x_n}\): \(\tfrac32, \tfrac{17}{12}, \tfrac{577}{408}\).`,
      code: `let x = R\`1\`;
const out = [];
for (let i = 0; i < 3; i++) out.push((x = x.divide(R\`2\`).add(R\`1\`.divide(x))));
out`,
      expect: "[3/2, 17/12, 577/408]",
      status: "partial",
      note: "analytic's <code>newton</code> teaches the method in floating point (true errors, observed order); the exact iterates here are written as a loop over Core rationals.",
    },
    {
      topic: "Riemann sum",
      q: t`Compute the left Riemann sum for \(\int_0^2 x^2\,dx\) with 4 equal subintervals.`,
      a: t`\(\tfrac12(0 + \tfrac14 + 1 + \tfrac94) = \tfrac74\).`,
      code: `sum(0, 3, (i) => R\`(\${i}/2)^2 * 1/2\`)`,
      expect: "7/4",
    },
    {
      topic: "Definite integral",
      q: t`\(\displaystyle\int_1^3 (2x + 1)\,dx\)`,
      a: t`\([x^2 + x]_1^3 = 12 - 2 = 10\).`,
      code: `symbolic.integrate("2x + 1", "x", { from: 1, to: 3 }).value`,
      expect: "10",
    },
    {
      topic: "Fundamental theorem",
      q: t`\(\dfrac{d}{dx}\displaystyle\int_0^{x^2}\cos t\,dt\)`,
      a: t`\(2x\cos(x^2)\).`,
      code: `const F = symbolic.integrate("cos(t)", "t").result;     // sin(t)
symbolic.sym(String(F).replace(/t/g, "(x^2)")).diff("x")`,
      expect: ["2*x*cos(x^2)", "2*cos(x^2)*x"],
      status: "partial",
      note: "No rule for differentiating an integral with a variable limit; the code integrates first and then differentiates.",
    },
    {
      topic: "Substitution",
      q: t`\(\displaystyle\int x(x^2 + 1)^5\,dx\)`,
      a: t`\(u = x^2 + 1\): \(\tfrac{(x^2 + 1)^6}{12} + C\).`,
      code: `const F = symbolic.integrate("x*(x^2 + 1)^5", "x");
PRINT(F);
symbolic.equal(\`\${F.result}\`, "(x^2 + 1)^6/12 - 1/12")`,
      expect: /^equal/,
      expectText: "(x^2 + 1)^6/12 + C (same up to a constant)",
    },
    {
      topic: "Area between curves",
      q: t`Find the area between \(y = x^2\) and \(y = x + 2\).`,
      a: t`They meet at \(x = -1, 2\): \(\int_{-1}^2 (x + 2 - x^2)\,dx = \tfrac92\).`,
      code: `symbolic.integrate("x + 2 - x^2", "x", { from: -1, to: 2 }).value`,
      expect: "9/2",
    },
  ],
};
