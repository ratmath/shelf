const t = String.raw;
import { near, toNum } from "./lib.js";

export default {
  title: "Dynamical systems and chaos",
  level: "University: upper level",
  short: "Fixed points and their stability, periodic orbits, period doubling and Feigenbaum, Lyapunov exponents, symbolic dynamics, Sharkovskii's theorem, Hénon and Lorenz, toral automorphisms, fractal dimension, Mandelbrot and Life.",
  blurb: "Fixed points and multipliers of the logistic map, its 2-cycles, the first period doublings and the superstable 2-cycle, the Lyapunov exponent at \(r = 4\), rational orbits of the tent and doubling maps, Sharkovskii's order, fixed points of the Hénon map, the Lorenz equilibria and their types, the damped pendulum, Arnold's cat map (periodic points and entropy), dimensions of the Cantor set, the Sierpinski triangle and a Moran set, membership in the Mandelbrot set, and oscillators and spaceships in the Game of Life.",
  exercises: [
    {
      topic: "Fixed points and stability",
      q: t`Find the fixed points of the logistic map \(f(x) = 3x(1 - x)\) and classify them.`,
      a: t`\(x = 3x - 3x^2\): \(x = 0\) or \(x = \tfrac23\). \(f'(x) = 3 - 6x\): \(f'(0) = 3\) (repelling), \(f'(\tfrac23) = -1\) (neutral: the boundary where the period doubling starts).`,
      code: `chaos.logistic(3).fixedPoints().map((p) => [p.text, p.stability])`,
      expect: `[["0", "repelling"], ["2/3", "neutral"]]`,
    },
    {
      topic: "Multipliers",
      q: t`For \(f(x) = \tfrac52x(1 - x)\), find the non-zero fixed point and its multiplier.`,
      a: t`\(x^* = 1 - \tfrac1r = \tfrac35\); \(f'(x^*) = 2 - r = -\tfrac12\): attracting, with orbits spiralling in (alternating sides).`,
      code: `chaos.logistic("5/2").derivativeAt("3/5")`,
      expect: "-1/2",
    },
    {
      topic: "Period-2 orbits",
      q: t`Find the 2-cycle of \(f(x) = 4x(1 - x)\) and its stability.`,
      a: t`Divide \(f(f(x)) - x\) by \(x(4x - 3)\): \(16x^2 - 20x + 5 = 0\), \(x = \tfrac{5 \pm \sqrt5}{8}\). The multiplier is \(f'(x_1)f'(x_2) = 16(1 - 2x_1)(1 - 2x_2) = -4\): repelling.`,
      code: `chaos.logistic(4).periodicPoints(2).map((p) => [p.text, p.stability])`,
      expect: `[["(5 − √5)/8", "repelling"], ["(5 + √5)/8", "repelling"]]`,
    },
    {
      topic: "Period doubling",
      q: t`At which \(r\) do the first two period doublings of the logistic map occur?`,
      a: t`The fixed point loses stability when \(2 - r = -1\): \(r_1 = 3\). The 2-cycle has multiplier \(-r^2 + 2r + 4\), which is \(-1\) at \(r_2 = 1 + \sqrt6 \approx 3.449490\).`,
      code: `chaos.periodDoubling(chaos.logistic(), { parameter: "r", levels: 2, start: [2.9, 0.6] }).parameters`,
      check: near([3, 1 + Math.sqrt(6)], 1e-12),
    },
    {
      topic: "Superstable cycles",
      q: t`Find the \(r\) at which the logistic map has a superstable 2-cycle (the critical point \(\tfrac12\) has period 2).`,
      a: t`\(f(f(\tfrac12)) = \tfrac12\) with \(f(\tfrac12) = \tfrac r4\): \(r\cdot\tfrac r4(1 - \tfrac r4) = \tfrac12\), i.e. \(r^3 - 4r^2 + 8 = 0 = (r - 2)(r^2 - 2r - 4)\): \(r = 1 + \sqrt5 \approx 3.236068\).`,
      code: `chaos.superstable(chaos.logistic(), { parameter: "r", period: 2, range: [3, "7/2"] })[0]`,
      check: near(1 + Math.sqrt(5), 1e-9),
    },
    {
      topic: "Lyapunov exponent",
      q: t`What is the Lyapunov exponent of the logistic map at \(r = 4\)?`,
      a: t`\(f\) is conjugate to the tent map with slope \(\pm2\) by \(x = \sin^2(\pi\theta/2)\), so \(\lambda = \ln 2 \approx 0.6931\) for almost every orbit.`,
      code: `const e = chaos.lyapunovExponent(chaos.logistic(4), { digits: 4 });
[e.value, e.invariance.proven]`,
      check: (v) => v[0].low.toNumber() <= Math.LN2 && Math.LN2 <= v[0].high.toNumber() && v[0].high.toNumber() - v[0].low.toNumber() < 2e-4 && v[1] === true,
      expectText: "[an interval of width under 0.0002 containing ln 2 ≈ 0.693147, true]",
      fix: ["chaos#8", "chaos#9"],
      note: "<code>lyapunovExponent</code> encloses \\(\\int \\log|f'|\\,d\\mu\\) against the invariant measure \\(dx/(\\pi\\sqrt{x(1-x)})\\), which is the limit itself and not a finite average. The measure is invariant by the conjugacy with the tent map; ergodicity is taken from the theory. <code>lyapunov</code> still gives the certified average along one orbit.",
    },
    {
      topic: "Tent map orbits",
      q: t`Find the orbit of \(\tfrac15\) under the tent map \(T(x) = 2\min(x, 1 - x)\).`,
      a: t`\(\tfrac15 \to \tfrac25 \to \tfrac45 \to \tfrac25 \to \cdots\): eventually periodic with period 2.`,
      code: `chaos.tent(2).orbit("1/5", 4)`,
      expect: "[1/5, 2/5, 4/5, 2/5, 4/5]",
    },
    {
      topic: "The doubling map",
      q: t`Find the orbit of \(\tfrac17\) under \(x \mapsto 2x \bmod 1\).`,
      a: t`\(\tfrac17 = 0.\overline{001}_2\): the orbit \(\tfrac17, \tfrac27, \tfrac47\) repeats, period 3 with no preperiod.`,
      code: `const d = chaos.doubling("1/7");
[d.orbit, d.preperiod, d.period]`,
      expect: "[[1/7, 2/7, 4/7], 0, 3]",
    },
    {
      topic: "Sharkovskii's theorem",
      q: t`For a continuous map of the line, does a 3-cycle force a 5-cycle? Does a 5-cycle force a 3-cycle?`,
      a: t`Sharkovskii's order starts \(3 \triangleright 5 \triangleright 7 \triangleright \cdots\): period 3 forces every period, but period 5 does not force period 3.`,
      code: `[chaos.sharkovskii.forces(3, 5), chaos.sharkovskii.forces(5, 3)]`,
      expect: "[true, false]",
    },
    {
      topic: "The Hénon map",
      q: t`Find the fixed points of the Hénon map \((x, y) \mapsto (1 - 1.4x^2 + y,\ 0.3x)\).`,
      a: t`\(y = 0.3x\) and \(1.4x^2 + 0.7x - 1 = 0\): \(x = \dfrac{-0.7 \pm \sqrt{0.49 + 5.6}}{2.8} \approx 0.631354\) and \(-1.131354\). Both are saddles.`,
      code: `chaos.henon().fixedPoints({ x: [-2, 2], y: [-2, 2] }).map((p) => [p.point[0], p.stability])`,
      check: (v) => near([-1.1313544770, 0.6313544770], 1e-9)(v.map((p) => p[0])) && v.every((p) => p[1] === "saddle"),
      expectText: "[(−1.131354…, saddle), (0.631354…, saddle)]",
    },
    {
      topic: "Lorenz equilibria",
      q: t`Find the equilibria of the Lorenz system with \(\sigma = 10\), \(\rho = 28\), \(\beta = \tfrac83\), and classify them.`,
      a: t`The origin, and \((\pm\sqrt{\beta(\rho - 1)}, \pm\sqrt{\beta(\rho - 1)}, \rho - 1) = (\pm\sqrt{72}, \pm\sqrt{72}, 27)\). At the origin the eigenvalues are \(-\tfrac83\) and \(\tfrac{-11 \pm \sqrt{1201}}2\): a saddle. The other two are saddle-foci (one real negative eigenvalue and a complex pair with positive real part).`,
      code: `const E = chaos.lorenz().equilibria({ x: [-30, 30], y: [-30, 30], z: [-10, 60] });
[E.complete, E.map((e) => e.kind), E.map((e) => e.point[2])]`,
      check: (v) => v[0] === true && JSON.stringify(v[1]) === '["saddle-focus","saddle","saddle-focus"]' && near([27, 0, 27], 1e-9)(v[2]),
      expectText: "[complete, (saddle-focus, saddle, saddle-focus), z = 27, 0, 27]",
    },
    {
      topic: "The damped pendulum",
      q: t`For \(\theta'' + \tfrac12\theta' + \sin\theta = 0\), classify the equilibria with \(-4 \le \theta \le 4\).`,
      a: t`\(\theta = 0\): Jacobian \(\begin{pmatrix}0&1\\-1&-\frac12\end{pmatrix}\), eigenvalues \(\tfrac{-1 \pm i\sqrt{15}}{4}\): a spiral sink. \(\theta = \pm\pi\): \(\begin{pmatrix}0&1\\1&-\frac12\end{pmatrix}\), real eigenvalues of opposite sign: saddles.`,
      code: `chaos.pendulum("1/2").equilibria({ x: [-4, 4], y: [-1, 1] }).map((e) => [e.point[0], e.kind])`,
      check: (v) => near([-Math.PI, 0, Math.PI], 1e-12)(v.map((e) => e[0])) && JSON.stringify(v.map((e) => e[1])) === '["saddle","spiral sink","saddle"]',
      expectText: "[(−π, saddle), (0, spiral sink), (π, saddle)]",
    },
    {
      topic: "Arnold's cat map",
      q: t`For the cat map \(\begin{pmatrix}2&1\\1&1\end{pmatrix}\) on the torus, how many fixed points and how many points of period dividing 2 are there? What is its entropy?`,
      a: t`The number of points with \(A^n x = x\) is \(|\det(A^n - I)| = |\operatorname{tr}A^n - 2|\): \(|3 - 2| = 1\) and \(|7 - 2| = 5\). The entropy is \(\ln\lambda_{\max} = \ln\tfrac{3 + \sqrt5}{2} \approx 0.9624\).`,
      code: `const T = chaos.catMap();
[T.fixedPointCount(1), T.fixedPointCount(2), T.entropy().text]`,
      expect: `[1, 5, "log((3 + √5)/2)"]`,
    },
    {
      topic: "Cantor set",
      q: t`Find the box-counting dimension of the middle-thirds Cantor set.`,
      a: t`Two copies at scale \(\tfrac13\): \(2\cdot(\tfrac13)^s = 1\), \(s = \dfrac{\ln2}{\ln3} \approx 0.6309\).`,
      code: `const d = chaos.cantor().dimension();
[d.formula, d.interval[0]]`,
      check: (v) => near(Math.log(2) / Math.log(3), 1e-9)(v[1]),
      expectText: "log 2/log 3 ≈ 0.6309298",
    },
    {
      topic: "Sierpinski triangle",
      q: t`Find the similarity dimension of the Sierpinski triangle.`,
      a: t`Three copies at scale \(\tfrac12\): \(s = \log_2 3 \approx 1.58496\).`,
      code: `const d = chaos.attractors.sierpinski().similarityDimension();
[d.formula, d.interval[0]]`,
      check: (v) => v[0] === "log(3)/log(2)" && near(Math.log2(3), 1e-9)(v[1]),
      expectText: "[log(3)/log(2), 1.5849625…]",
    },
    {
      topic: "Moran's equation",
      q: t`A self-similar set has two pieces, scaled by \(\tfrac12\) and \(\tfrac14\). Find its dimension.`,
      a: t`\((\tfrac12)^s + (\tfrac14)^s = 1\). With \(u = 2^{-s}\): \(u^2 + u = 1\), \(u = \tfrac{\sqrt5 - 1}2\), so \(s = \log_2\varphi \approx 0.694242\).`,
      code: `chaos.moran(["1/2", "1/4"]).interval[0]`,
      check: near(Math.log2((1 + Math.sqrt(5)) / 2), 1e-9),
    },
    {
      topic: "The Mandelbrot set",
      q: t`Are \(c = -1\) and \(c = 1\) in the Mandelbrot set?`,
      a: t`\(c = -1\): \(0 \to -1 \to 0 \to \cdots\), a bounded 2-cycle: inside. \(c = 1\): \(0 \to 1 \to 2 \to 5 \to \cdots\) escapes: outside (\(|z_3| = 5 > 2\)).`,
      code: `[chaos.mandelbrotPoint("-1").verdict, chaos.mandelbrotPoint("1").verdict, chaos.mandelbrotPoint("1").escape]`,
      expect: `["inside", "outside", 3]`,
    },
    {
      topic: "Game of Life",
      q: t`Classify the blinker and the glider in Conway's Game of Life.`,
      a: t`The blinker is an oscillator of period 2. The glider is a spaceship of period 4 that moves one cell diagonally each period (speed \(c/4\)).`,
      code: `const L = (p) => chaos.life(chaos.patterns[p]).classify();
[L("blinker").kind, L("blinker").period, L("glider").kind, L("glider").period, L("glider").speed]`,
      expect: `["oscillator", 2, "spaceship", 4, "c/4"]`,
    },
    {
      topic: "Sensitive dependence",
      q: t`For the tent map \(T(x) = 2\min(x, 1 - x)\), the points \(\tfrac13\) and \(\tfrac13 + 10^{-6}\) start close. After how many steps are they more than \(\tfrac1{10}\) apart?`,
      a: t`While both stay on one side of each fold the distance doubles: \(2^n\cdot10^{-6} > 0.1\) needs \(2^n > 10^5\), \(n = 17\). The growth rate is \(\ln 2\) per step.`,
      code: `const s = chaos.sensitivity(chaos.tent(2), "1/3", "1/1000000");
[s.reaches, s.factor]`,
      expect: "[17, 2]",
      note: "<code>chaos.map</code> knows no <code>mod</code> or <code>floor</code>, so the doubling map itself cannot be written as a formula; <code>chaos.doubling</code> handles exact orbits only.",
    },
    {
      topic: "Itineraries",
      q: t`Under \(f(x) = 4x(1 - x)\), write the first 6 symbols of the itinerary of \(x_0 = \tfrac15\) (L if \(x < \tfrac12\), R if \(x > \tfrac12\)).`,
      a: t`\(\tfrac15 \to \tfrac{16}{25} \to \tfrac{576}{625} \to \ldots\): \(0.2\) L, \(0.64\) R, \(0.9216\) R, \(0.28901\) L, \(0.82194\) R, \(0.58542\) R. Itinerary LRRLRR.`,
      code: `chaos.itinerary(chaos.logistic(4), "1/5", 6)`,
      check: (v, out) => /L.?R.?R.?L.?R.?R/.test(out.replace(/[^LRC]/g, "")),
      expectText: "LRRLRR",
    },
  ],
};
