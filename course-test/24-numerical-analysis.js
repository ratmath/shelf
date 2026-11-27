const t = String.raw;
import { near, toNum } from "./lib.js";

export default {
  title: "Numerical analysis",
  level: "University: upper level",
  short: "Floating point and round-off, root finding, interpolation and splines, numerical differentiation and integration, ODE methods and stability, linear systems, conditioning, iterative methods and eigenvalues.",
  blurb: "The double nearest 0.1 and machine epsilon, catastrophic cancellation, bisection, Newton, secant and fixed-point iteration with their rates, Lagrange interpolation, natural cubic splines, Chebyshev nodes, least squares, Richardson extrapolation, the trapezoid, Simpson and Gauss rules, Euler and Runge–Kutta steps and the stability limit of Euler's method, LU factorisation, condition numbers, Jacobi iteration and the power method.",
  exercises: [
    {
      topic: "Floating point",
      q: t`What exact rational number does the double nearest to 0.1 equal? What is machine epsilon (the gap from 1 to the next double)?`,
      a: t`\(0.1 = 0.000110011\ldots_2\); rounded to 53 significant bits it is \(\dfrac{3602879701896397}{2^{55}}\), slightly above 0.1. Machine epsilon is \(2^{-52} \approx 2.22\times10^{-16}\).`,
      code: `[analytic.floatParts(0.1).exact, analytic.floatParts(1).ulp]`,
      expect: "[3602879701896397/36028797018963968, 1/4503599627370496]",
    },
    {
      topic: "Catastrophic cancellation",
      q: t`Evaluate \(\sqrt{x + 1} - \sqrt{x}\) at \(x = 10^{16}\) in double precision. What goes wrong, and what is the true value?`,
      a: t`\(10^{16} + 1\) rounds to \(10^{16}\), so the computed difference is 0, with every digit lost. Rewriting as \(\dfrac{1}{\sqrt{x+1} + \sqrt x} \approx 5\times10^{-9}\) gives the true value.`,
      code: `const r = analytic.roundoff("sqrt(x + 1) - sqrt(x)", { x: 1e16 });
[r.float, r.exact, r.digitsLost]`,
      check: (v) => v[0] === 0 && Math.abs(toNum(v[1]) - 5e-9) < 1e-15 && v[2] >= 15,
      expectText: "[0, 5e-9 (true value), all digits lost]",
    },
    {
      topic: "Bisection",
      q: t`Bisection on \(x^2 - 2\) over \([1, 2]\): how many steps until the guaranteed error \((b - a)/2^{n+1}\) is below \(10^{-6}\)?`,
      a: t`\(2^{-(n+1)} < 10^{-6}\) needs \(n + 1 \ge 20\) (\(2^{20} = 1048576\)): 19 halvings, i.e. 20 midpoints counting the first, with bound \(2^{-20} \approx 9.54\times10^{-7}\).`,
      code: `const b = analytic.bisection("x^2 - 2", ["1", "2"], { tol: "1e-6" });
[b.iterations.length, b.iterations.at(-1).bound]`,
      expect: "[20, 9.5367431640625e-7]",
    },
    {
      topic: "Newton's method",
      q: t`Apply Newton's method to \(x^2 - 2\) from \(x_0 = 1\). Give \(x_1, x_2, x_3\).`,
      a: t`\(x_{k+1} = \tfrac12(x_k + 2/x_k)\): \(\tfrac32\), \(\tfrac{17}{12}\), \(\tfrac{577}{408} \approx 1.4142157\). The correct digits roughly double each step.`,
      code: `analytic.newton("x^2 - 2", "1").iterations.slice(1, 4).map((i) => i.x)`,
      check: near([3 / 2, 17 / 12, 577 / 408], 1e-15),
      note: "The iterates are doubles, so \\(\\tfrac{17}{12}\\) and \\(\\tfrac{577}{408}\\) come back rounded; the root itself is certified.",
    },
    {
      topic: "Secant method",
      q: t`Apply the secant method to \(x^2 - 2\) from \(x_0 = 1\), \(x_1 = 2\). Give \(x_2\) and \(x_3\).`,
      a: t`\(x_2 = 2 - 2\cdot\dfrac{2 - 1}{2 - (-1)} = \tfrac43\); \(x_3 = \tfrac43 - \left(-\tfrac29\right)\dfrac{4/3 - 2}{-2/9 - 2} = \tfrac75\).`,
      code: `analytic.secant("x^2 - 2", "1", "2").iterations.slice(2, 4).map((i) => i.x)`,
      check: near([4 / 3, 7 / 5], 1e-15),
    },
    {
      topic: "Fixed-point iteration",
      q: t`For \(x_{k+1} = \cos x_k\), by what factor does the error shrink each step near the fixed point?`,
      a: t`\(|g'(x^*)| = \sin x^* \approx \sin 0.7390851 \approx 0.6736\): linear convergence with that ratio.`,
      code: `analytic.fixedPoint("cos(x)", "1").multiplier`,
      check: (v) => Math.abs(Math.abs(toNum(v)) - 0.6736120291832148) < 1e-9,
      expectText: "−0.6736120… (g′ = −sin x*)",
    },
    {
      topic: "Interpolation",
      q: t`Find the polynomial through \((0, 1)\), \((1, 3)\), \((2, 7)\) and evaluate it at 3.`,
      a: t`Divided differences: 1; 2, 4; 1. \(p = 1 + 2x + x(x - 1) = x^2 + x + 1\), \(p(3) = 13\).`,
      code: `const p = analytic.interpolate([[0, 1], [1, 3], [2, 7]]);
[String(p.polynomial), p.at(3)]`,
      expect: `["x^2 + x + 1", 13]`,
    },
    {
      topic: "Natural cubic spline",
      q: t`Find the natural cubic spline through \((0, 0)\), \((1, 1)\), \((2, 0)\) and its value at \(x = \tfrac12\).`,
      a: t`With \(M_0 = M_2 = 0\): \(4M_1 = 6(0 - 2 + 0) = -12\), \(M_1 = -3\). On \([0, 1]\): \(S = -\tfrac12x^3 + \tfrac32x\), so \(S(\tfrac12) = \tfrac34 - \tfrac1{16} = \tfrac{11}{16}\).`,
      code: `analytic.spline([[0, 0], [1, 1], [2, 0]]).at("1/2")`,
      expect: "11/16",
    },
    {
      topic: "Chebyshev nodes",
      q: t`Give the three Chebyshev nodes on \([-1, 1]\).`,
      a: t`\(\cos\dfrac{(2i + 1)\pi}{6}\): \(\tfrac{\sqrt3}2, 0, -\tfrac{\sqrt3}2 \approx \pm0.8660254\).`,
      code: `analytic.chebyshevNodes(-1, 1, 3)`,
      check: (v) => near([-Math.sqrt(3) / 2, 0, Math.sqrt(3) / 2], 2e-5)([...v].sort((a, b) => toNum(a) - toNum(b))),
      expectText: "±√3/2 ≈ ±0.8660254, 0",
      note: "The nodes are rounded to short rationals (within \\(2^{-16}\\) by default), as the documentation says.",
    },
    {
      topic: "Least squares",
      q: t`Fit a least-squares line to \((0, 1)\), \((1, 3)\), \((2, 4)\), \((3, 4)\).`,
      a: t`\(\bar x = 1.5\), \(\bar y = 3\), \(S_{xy} = 5\), \(S_{xx} = 5\): slope 1, intercept \(3 - 1.5 = 1.5\). \(y = x + \tfrac32\).`,
      code: `String(analytic.leastSquares([[0, 1], [1, 3], [2, 4], [3, 4]], 1).polynomial)`,
      expect: "x + 3/2",
    },
    {
      topic: "Richardson extrapolation",
      q: t`Estimate \(f'(0)\) for \(f = e^x\) with central differences at \(h = 0.1\) and \(h = 0.05\), then one Richardson step.`,
      a: t`\(D(0.1) = \dfrac{e^{0.1} - e^{-0.1}}{0.2} \approx 1.0016675\), \(D(0.05) \approx 1.0004167\). \(\dfrac{4D(0.05) - D(0.1)}{3} \approx 0.99999979\), error about \(2\times10^{-7}\) instead of \(4\times10^{-4}\).`,
      code: `const T = analytic.richardson("exp(x)", 0, { h: "0.1" }).table;
[T[0][0], T[1][0], T[1][1]]`,
      check: near([1.0016675001984403, 1.0004167187531, 0.9999997916046544], 1e-12),
    },
    {
      topic: "Trapezoid rule",
      q: t`Approximate \(\int_0^1 x^2\,dx\) by the trapezoid rule with 4 panels.`,
      a: t`\(\tfrac18\left(0 + 2\cdot\tfrac{1 + 4 + 9}{16} + 1\right) = \tfrac{11}{32} = 0.34375\) (exact \(\tfrac13\)).`,
      code: `analytic.quadratureRule("x^2", ["0", "1"], { rule: "trapezoid", n: 4 }).value`,
      expect: "11/32",
    },
    {
      topic: "Simpson's rule",
      q: t`Apply Simpson's rule with one panel (three points) to \(\int_0^1 x^4\,dx\).`,
      a: t`\(\tfrac16\left(0 + 4\cdot\tfrac1{16} + 1\right) = \tfrac{5}{24} \approx 0.2083\) (exact \(\tfrac15\)).`,
      code: `analytic.quadratureRule("x^4", ["0", "1"], { rule: "simpson", n: 1 }).value`,
      expect: "5/24",
    },
    {
      topic: "Gaussian quadrature",
      q: t`Apply two-point Gauss–Legendre quadrature to \(\int_{-1}^1 x^4\,dx\).`,
      a: t`Nodes \(\pm1/\sqrt3\), weights 1: \(2\cdot\tfrac19 = \tfrac29\) (exact \(\tfrac25\); the rule is exact only up to degree 3).`,
      code: `analytic.gaussRule("x^4", ["-1", "1"], 2).value`,
      check: near(2 / 9, 1e-15),
    },
    {
      topic: "Euler's method",
      q: t`Use Euler's method with \(h = 0.1\) on \(y' = y\), \(y(0) = 1\), up to \(t = 0.5\).`,
      a: t`Each step multiplies by 1.1: \(1.1^5 = 1.61051\) (exact \(e^{0.5} \approx 1.64872\)).`,
      code: `analytic.odeMethod("y", { y0: 1, until: "0.5", steps: 5 }).steps.at(-1).y`,
      check: near(1.61051, 1e-12),
    },
    {
      topic: "Runge–Kutta",
      q: t`Take one classical RK4 step of size 0.1 on \(y' = y\), \(y(0) = 1\).`,
      a: t`\(1 + h + \tfrac{h^2}2 + \tfrac{h^3}6 + \tfrac{h^4}{24} = 1.1051708\overline3\) (exact \(e^{0.1} = 1.1051709181\)).`,
      code: `analytic.odeMethod("y", { y0: 1, until: "0.1", steps: 1, method: "rk4" }).steps.at(-1).y`,
      check: near(1.1051708333333333, 1e-14),
    },
    {
      topic: "Stability",
      q: t`For \(y' = -10y\), what is the largest step for which Euler's method does not grow?`,
      a: t`Each step multiplies by \(1 - 10h\); \(|1 - 10h| \le 1\) needs \(h \le 0.2\). The stability interval for \(h\lambda\) is \([-2, 0]\).`,
      code: `const s = analytic.stability("euler");
[s.interval, s.largestStep(-10)]`,
      expect: "[[-2, 0], 1/5]",
    },
    {
      topic: "LU factorisation",
      q: t`Factor \(A = \begin{pmatrix}2&1\\4&3\end{pmatrix}\) as \(LU\) (no pivoting).`,
      a: t`\(\ell_{21} = 2\): \(L = \begin{pmatrix}1&0\\2&1\end{pmatrix}\), \(U = \begin{pmatrix}2&1\\0&1\end{pmatrix}\).`,
      code: `const F = linalg.lu([[2, 1], [4, 3]]).exact();
[F.L, F.U].map(String)`,
      expect: String.raw`["[1, 0]\n[2, 1]", "[2, 1]\n[0, 1]"]`,
    },
    {
      topic: "Condition number",
      q: t`Find \(\kappa_\infty\) of \(\begin{pmatrix}1&1\\1&1.0001\end{pmatrix}\).`,
      a: t`\(\|A\|_\infty = 2.0001\); \(A^{-1} = 10^4\begin{pmatrix}1.0001&-1\\-1&1\end{pmatrix}\), \(\|A^{-1}\|_\infty = 20001\). \(\kappa = 2.0001\cdot20001 = 40004.0001\).`,
      code: `linalg.cond([["1", "1"], ["1", "1.0001"]], "inf").exact()`,
      expect: "400040001/10000",
    },
    {
      topic: "Iterative methods and eigenvalues",
      q: t`(a) Two Jacobi steps for \(4x + y = 1\), \(x + 3y = 2\) from \((0, 0)\). (b) The dominant eigenvalue of \(\begin{pmatrix}2&1\\1&3\end{pmatrix}\) by the power method.`,
      a: t`(a) \((\tfrac14, \tfrac23)\), then \(\left(\tfrac{1 - 2/3}{4}, \tfrac{2 - 1/4}{3}\right) = (\tfrac1{12}, \tfrac7{12})\); the solution is \((\tfrac1{11}, \tfrac7{11})\). (b) \(\lambda = \tfrac{5 + \sqrt5}{2} \approx 3.618034\).`,
      code: `const J = linalg.methods.jacobi([[4, 1], [1, 3]], [1, 2], { steps: 2 });
const P = linalg.methods.powerMethod([[2, 1], [1, 3]]);
[...J.rows[2].x, P.rows.at(-1).estimate]`,
      check: near([1 / 12, 7 / 12, (5 + Math.sqrt(5)) / 2], 1e-9),
    },
  ],
};
