import { near } from "./lib.js";
const t = String.raw;
const PI = Math.PI;

export default {
  title: "Partial differential equations",
  level: "University: upper level",
  short: "Classification, characteristics, separation of variables, heat, wave and Laplace equations, Sturm–Liouville problems.",
  blurb: "Classifying second-order equations, the transport equation by characteristics, the heat equation with fixed and insulated ends and on the whole line, d'Alembert's formula, Laplace's equation on a rectangle and a disc, Sturm–Liouville eigenvalues and steady states.",
  exercises: [
    {
      topic: "Classification",
      q: t`Classify \(u_{xx} + 4u_{xy} + 3u_{yy} = 0\) as elliptic, parabolic or hyperbolic.`,
      a: t`\(B^2 - 4AC = 16 - 12 = 4 > 0\): hyperbolic.`,
      fix: "analytic#19",
      code: `const c = analytic.pde.classify({ A: 1, B: 4, C: 3 });
[c.discriminant, c.type]`,
      expect: '["4", "hyperbolic"]',
      note: "<code>pde.classify</code> takes the sign of \\(B^2 - 4AC\\); with coefficients in \\(x\\) and \\(y\\) it returns the region of each type.",
    },
    {
      topic: "Characteristics",
      q: t`Solve \(u_t + 2u_x = 0\) with \(u(x, 0) = e^{-x^2}\), and find \(u(1, \tfrac12)\).`,
      a: t`\(u\) is constant on the lines \(x - 2t = \text{const}\), so \(u = e^{-(x - 2t)^2}\) and \(u(1, \tfrac12) = e^0 = 1\).`,
      code: `const f = analytic.fn("exp(-x^2)");     // the initial data
f.value(R\`1 - 2*1/2\`).exact()           // at the foot of the characteristic, x - 2t`,
      check: near(1, 1e-12),
      status: "partial",
      note: "There is no first-order PDE solver: the characteristic \\(x - 2t\\) is found by hand and the library only evaluates the initial data there.",
    },
    {
      topic: "Heat equation, fixed ends",
      q: t`A rod \(0 \le x \le 1\) with \(u_t = u_{xx}\), ends held at 0, starts at \(u(x, 0) = x(1 - x)\). Find \(u(\tfrac12, \tfrac1{10})\).`,
      a: t`\(b_n = 8/(n\pi)^3\) for odd \(n\), so \(u = \sum_{n \text{ odd}} \frac{8}{n^3\pi^3} e^{-n^2\pi^2 t}\sin n\pi x\); at the point, \(0.0961619\).`,
      code: `analytic.heat({ k: 1, length: 1, initial: "x*(1 - x)", terms: 8 }).at("1/2", "1/10").value`,
      check: near(0.096161871434348, 1e-9),
    },
    {
      topic: "Fourier sine coefficients",
      q: t`For the same rod, what is the first coefficient \(b_1\) of the sine series?`,
      a: t`\(b_1 = 2\int_0^1 x(1 - x)\sin \pi x\,dx = 8/\pi^3 \approx 0.258012\).`,
      code: `analytic.heat({ k: 1, length: 1, initial: "x*(1 - x)" }).modes[0].coefficient`,
      check: near(8 / PI ** 3, 1e-9),
    },
    {
      topic: "Decay rates",
      q: t`For \(u_t = 2u_{xx}\) on \(0 < x < 3\) with fixed ends, at what rate does the slowest mode decay?`,
      a: t`\(k(\pi/L)^2 = 2\pi^2/9 \approx 2.19325\).`,
      code: `analytic.heat({ k: 2, length: 3, initial: "x*(3 - x)" }).modes[0].rate`,
      expectText: "2*(1*pi/3)^2, that is 2π²/9",
      check: (v) => /2\s*\*\s*\(\s*(1\s*\*\s*)?pi\s*\/\s*3\s*\)\s*\^\s*2/.test(String(v)),
    },
    {
      topic: "Heat equation, insulated ends",
      q: t`A rod \(0 \le x \le 1\) with insulated ends starts at \(u(x, 0) = x\). Find \(u(0, 1)\), and the temperature it tends to.`,
      a: t`Cosine series: \(u = \tfrac12 - \sum_{n\text{ odd}} \frac{4}{n^2\pi^2} e^{-n^2\pi^2 t}\cos n\pi x\). So \(u(0, 1) \approx 0.4999790\), tending to the mean, \(\tfrac12\).`,
      code: `analytic.heat({ length: 1, initial: "x", ends: "insulated" }).at(0, 1).value`,
      check: near(0.4999790373822083, 1e-9),
    },
    {
      topic: "Wave equation, d'Alembert",
      q: t`A string \(0 \le x \le 1\) with \(c = 1\) starts at rest in the shape \(\sin \pi x\). Find \(u(\tfrac14, \tfrac13)\).`,
      a: t`\(u = \sin \pi x \cos \pi t\), so \(u = \sin\tfrac\pi4\cos\tfrac\pi3 = \tfrac{\sqrt2}{4} \approx 0.353553\).`,
      code: `analytic.wave({ c: 1, length: 1, position: "sin(pi*x)" }).at("1/4", "1/3")`,
      check: near(Math.SQRT2 / 4, 1e-9),
    },
    {
      topic: "Periodicity of a string",
      q: t`A plucked string \(0 \le x \le 1\), \(c = 1\), starts at rest as \(x(1 - x)\). Compare \(u(\tfrac13, 2)\) with \(u(\tfrac13, 0)\).`,
      a: t`The motion has period \(2L/c = 2\), so both are \(\tfrac13 \cdot \tfrac23 = \tfrac29\).`,
      code: `const s = analytic.wave({ c: 1, length: 1, position: "x*(1 - x)" });
[s.at("1/3", 2), s.at("1/3", 0)]`,
      check: near([2 / 9, 2 / 9], 1e-9),
    },
    {
      topic: "Waves on a line",
      q: t`On the whole line, \(u_{tt} = u_{xx}\) with \(u(x, 0) = e^{-x^2}\) and \(u_t(x, 0) = 0\). Find \(u(3, 3)\).`,
      a: t`\(u = \tfrac12\bigl(e^{-(x-t)^2} + e^{-(x+t)^2}\bigr)\), so \(u(3, 3) = \tfrac12(1 + e^{-36}) \approx 0.5\).`,
      code: `analytic.wave({ c: 1, position: "exp(-x^2)" }).at(3, 3)`,
      check: near(0.5 * (1 + Math.exp(-36)), 1e-12),
    },
    {
      topic: "Initial velocity",
      q: t`On the whole line, \(u_{tt} = u_{xx}\) with \(u(x, 0) = 0\) and \(u_t(x, 0) = 1/(1 + x^2)\). Find \(u(0, 1)\).`,
      a: t`\(u = \tfrac12\int_{x-t}^{x+t}\frac{ds}{1 + s^2}\), so \(u(0, 1) = \arctan 1 = \pi/4 \approx 0.785398\).`,
      code: `analytic.wave({ c: 1, position: "0", velocity: "1/(1 + x^2)" }).at(0, 1)`,
      check: near(PI / 4, 1e-9),
    },
    {
      topic: "Laplace on a rectangle",
      q: t`Solve \(\Delta u = 0\) on the unit square with \(u = \sin \pi x\) on the top edge and 0 on the other three. Find \(u(\tfrac12, \tfrac12)\).`,
      a: t`\(u = \frac{\sinh \pi y}{\sinh \pi}\sin \pi x\), so \(u = \sinh(\pi/2)/\sinh \pi \approx 0.199268\).`,
      code: `analytic.laplaceRectangle({ top: "sin(pi*x)", terms: 16 }).at("1/2", "1/2").value`,
      check: near(0.19926840766919334, 1e-9),
      note: "The tail bound does not know that only one mode is present, so 16 terms are needed for a tight enclosure: with 4 terms it is about 0.002 wide.",
    },
    {
      topic: "Mean value property",
      q: t`A disc of radius 1 has its rim held at \(\cos^2\theta\). What is the steady temperature at the centre?`,
      a: t`The mean of the boundary values: \(\tfrac1{2\pi}\int_0^{2\pi}\cos^2\theta\,d\theta = \tfrac12\).`,
      code: `analytic.laplaceDisc({ boundary: "cos(theta)^2", terms: 4 }).mean`,
      check: near(0.5, 1e-9),
    },
    {
      topic: "Laplace on a disc",
      q: t`For the same disc, find \(u\) at \(r = \tfrac12\), \(\theta = 0\).`,
      a: t`\(\cos^2\theta = \tfrac12 + \tfrac12\cos 2\theta\), so \(u = \tfrac12 + \tfrac12 r^2\cos 2\theta\) and \(u = \tfrac12 + \tfrac18 = \tfrac58\).`,
      code: `analytic.laplaceDisc({ boundary: "cos(theta)^2", terms: 32 }).at("1/2", 0).value`,
      check: near(5 / 8, 1e-8),
      note: "The answer is exact after two terms, but the tail bound shrinks only like \\(r^n\\): with 4 terms the enclosure is \\([0.375, 0.875]\\), with 32 it is within \\(10^{-9}\\). The <code>partial</code> field holds the kept terms alone.",
    },
    {
      topic: "Sturm–Liouville eigenvalues",
      q: t`Find the first two eigenvalues of \(-y'' = \lambda y\), \(y(0) = y(1) = 0\).`,
      a: t`\(\lambda_n = n^2\pi^2\): \(\pi^2 \approx 9.869604\) and \(4\pi^2 \approx 39.478418\).`,
      code: `analytic.sturmLiouville({ interval: [0, 1], count: 2 }).map((e) => e.eigenvalue)`,
      check: near([PI ** 2, 4 * PI ** 2], 1e-5),
    },
    {
      topic: "Eigenvalues on a longer interval",
      q: t`Find the lowest eigenvalue of \(-y'' = \lambda y\), \(y(0) = y(2) = 0\).`,
      a: t`\(\lambda_1 = (\pi/2)^2 = \pi^2/4 \approx 2.467401\).`,
      code: `analytic.sturmLiouville({ interval: [0, 2], count: 1 })[0].eigenvalue`,
      check: near(PI ** 2 / 4, 1e-5),
    },
    {
      topic: "Heat on a line",
      q: t`On the whole line, \(u_t = u_{xx}\) with \(u(x, 0) = e^{-x^2}\). Find \(u(1, \tfrac12)\).`,
      a: t`\(u = \frac{1}{\sqrt{1 + 4t}}e^{-x^2/(1 + 4t)}\), so \(u(1, \tfrac12) = e^{-1/3}/\sqrt3 \approx 0.413690\).`,
      code: `analytic.heatLine({ initial: "exp(-x^2)" }).at(1, "1/2")`,
      check: near(Math.exp(-1 / 3) / Math.sqrt(3), 1e-8),
    },
    {
      topic: "Conservation of heat",
      q: t`For the same problem, show that the total heat \(\int u\,dx\) does not change, and find it.`,
      a: t`\(\frac{d}{dt}\int u\,dx = \int u_{xx}\,dx = 0\), so it stays \(\int e^{-x^2}\,dx = \sqrt\pi \approx 1.772454\).`,
      code: `analytic.heatLine({ initial: "exp(-x^2)" }).heat()`,
      check: near(Math.sqrt(PI), 1e-8),
    },
    {
      topic: "Steady state with a source",
      q: t`Find the steady temperature of a rod with a uniform heat source, \(u'' = -1\), \(u(0) = u(1) = 0\), at the midpoint.`,
      a: t`\(u = \tfrac12 x(1 - x)\), so \(u(\tfrac12) = \tfrac18\).`,
      code: `analytic.bvp({ f: "-1", interval: [0, 1], left: { y: 0 }, right: { y: 0 } }).exact().at("1/2")`,
      check: near(1 / 8, 1e-9),
    },
    {
      topic: "Expanding a constant",
      q: t`A rod at temperature 1 has its ends plunged into ice. What is the first coefficient of its sine series on \([0, 1]\)?`,
      a: t`\(b_n = 2\int_0^1\sin n\pi x\,dx = \frac{2(1 - (-1)^n)}{n\pi}\), so \(b_1 = 4/\pi \approx 1.273240\).`,
      code: `analytic.heat({ initial: "1" }).modes[0].coefficient`,
      check: near(4 / PI, 1e-9),
    },
    {
      topic: "Checking a separated solution",
      q: t`Show that \(u = e^{-t}\sin x\) solves \(u_t = u_{xx}\).`,
      a: t`\(u_t = -e^{-t}\sin x\) and \(u_{xx} = -e^{-t}\sin x\), so \(u_t - u_{xx} = 0\).`,
      code: `const u = "exp(-t)*sin(x)";
const D = (e, v) => symbolic.format(symbolic.differentiate(symbolic.parse(e), v));
const ut = D(u, "t"), uxx = D(D(u, "x"), "x");
PRINT("u_t =", ut, "  u_xx =", uxx);
String(symbolic.simplify(\`(\${ut}) - (\${uxx})\`))`,
      expect: "0",
    },
  ],
};
