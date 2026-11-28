const t = String.raw;
import { near } from "./lib.js";

const PI = Math.PI;

export default {
  title: "Fourier analysis and transforms",
  level: "University: upper level",
  short: "Fourier series, orthogonality and Parseval, the discrete Fourier transform, aliasing, Fourier and Laplace transforms, convolution, Legendre polynomials, Sturm–Liouville problems and the heat, wave and Laplace equations.",
  blurb: "Fourier series of a square wave, a sawtooth and a parabola, the value at a jump, orthogonality of sines, Parseval and \(\zeta(2)\), the DFT of short signals, aliasing at a sampling rate, Fourier transforms of \(e^{-|x|}\) and the Gaussian, Laplace transforms and their inverses, a convolution, Legendre polynomials, the Dirichlet eigenvalues of \(-y''\), and series solutions of the heat equation, the wave equation and Laplace's equation on a disc.",
  exercises: [
    {
      topic: "Square wave",
      q: t`Find the Fourier series of the square wave \(f = -1\) on \((-1, 0)\), \(f = 1\) on \((0, 1)\), period 2, up to \(\sin 3\pi x\).`,
      a: t`\(f\) is odd, so only sines: \(b_n = 2\int_0^1 \sin n\pi x\,dx = \dfrac{2(1 - (-1)^n)}{n\pi}\), i.e. \(\dfrac{4}{n\pi}\) for odd \(n\). \(f \sim \dfrac4\pi\left(\sin\pi x + \tfrac13\sin3\pi x + \cdots\right)\), with \(\tfrac4\pi \approx 1.27324\).`,
      code: `const F = analytic.fourier("-1 if -1:x:!0; 1 if 0:x:1", [-1, 1], { terms: 3 }).exact();
[F.b[1], F.b[2], F.b[3]]`,
      check: near([4 / PI, 0, 4 / (3 * PI)], 1e-9),
      note: "Intervals must have rational ends, so the textbook \\([-\\pi, \\pi]\\) cannot be used (<code>fourier(\"x\", [\"-pi\", \"pi\"])</code> is refused); the course's period-2 versions are used instead.",
    },
    {
      topic: "Sawtooth",
      q: t`Find the Fourier coefficients of \(f(x) = x\) on \((-1, 1)\).`,
      a: t`Odd: \(b_n = 2\int_0^1 x\sin n\pi x\,dx = \dfrac{2(-1)^{n+1}}{n\pi}\): \(\tfrac2\pi, -\tfrac1\pi, \tfrac2{3\pi}\).`,
      code: `const F = analytic.fourier("x", [-1, 1], { terms: 3 }).exact();
[F.a[0], F.b[1], F.b[2], F.b[3]]`,
      check: near([0, 2 / PI, -1 / PI, 2 / (3 * PI)], 1e-9),
    },
    {
      topic: "Parabola",
      q: t`Find the Fourier series of \(f(x) = x^2\) on \((-1, 1)\) up to \(\cos 2\pi x\).`,
      a: t`Even: \(\tfrac{a_0}2 = \int_0^1 x^2 = \tfrac13\), \(a_n = 2\int_0^1 x^2\cos n\pi x\,dx = \dfrac{4(-1)^n}{n^2\pi^2}\): \(-\tfrac4{\pi^2} \approx -0.405285\), \(\tfrac1{\pi^2} \approx 0.101321\).`,
      code: `String(analytic.fourier("x^2", [-1, 1], { terms: 2 }).exact())`,
      expect: "0.333333 - 0.405285*cos(pi*x) + 0.101321*cos(2*pi*x)",
    },
    {
      topic: "Value at a jump",
      q: t`To what does the Fourier series of the square wave converge at \(x = 0\)?`,
      a: t`To the average of the one-sided limits, \(\tfrac{-1 + 1}{2} = 0\) (every \(\sin n\pi\cdot0 = 0\)).`,
      code: `analytic.fourier("-1 if -1:x:!0; 1 if 0:x:1", [-1, 1], { terms: 9 }).exact().value(0)`,
      check: near(0, 1e-10),
    },
    {
      topic: "Orthogonality",
      q: t`Compute \(\int_{-\pi}^{\pi}\sin 2x\sin 3x\,dx\) and \(\int_{-\pi}^{\pi}\sin^2 2x\,dx\).`,
      a: t`\(\sin2x\sin3x = \tfrac12(\cos x - \cos5x)\) integrates to 0. \(\sin^2 2x = \tfrac12(1 - \cos4x)\) integrates to \(\pi\).`,
      code: `[symbolic.integrate("sin(2x)*sin(3x)", "x", { from: "-pi", to: "pi" }).value, symbolic.integrate("sin(2x)^2", "x", { from: "-pi", to: "pi" }).value]`,
      expect: "[0, pi]",
    },
    {
      topic: "Parseval's identity",
      q: t`Use Parseval's identity for \(f(x) = x\) on \((-1, 1)\) to find \(\sum 1/n^2\).`,
      a: t`\(\int_{-1}^1 x^2 = \tfrac23 = \sum b_n^2 = \sum \dfrac{4}{n^2\pi^2}\), so \(\sum \dfrac1{n^2} = \dfrac{\pi^2}6\).`,
      fix: "symbolic#9",
      code: `[symbolic.integrate("x^2", "x", { from: -1, to: 1 }).value, symbolic.sum("4/(n^2*pi^2)", "n", 1, "inf").value, symbolic.sum("1/n^2", "n", 1, "inf").value]`,
      expect: "[2/3, 2/3, pi^2/6]",
      note: "A factor without the index, here \\(4/\\pi^2\\), comes outside the sum first, so both sides of Parseval's identity come out as \\(\\tfrac23\\).",
    },
    {
      topic: "Discrete Fourier transform",
      q: t`Compute the DFT \(X_k = \sum_j x_j e^{-2\pi ijk/4}\) of \((1, 2, 3, 4)\).`,
      a: t`\(X_0 = 10\), \(X_1 = 1 - 2i - 3 + 4i = -2 + 2i\), \(X_2 = 1 - 2 + 3 - 4 = -2\), \(X_3 = -2 - 2i\).`,
      code: `analytic.dft([1, 2, 3, 4]).text`,
      expect: `["10", "-2 + 2ζ", "-2", "-2 - 2ζ"]`,
      note: "Exact answers are written with \\(\\zeta = e^{2\\pi i/n}\\); for \\(n = 4\\), \\(\\zeta = i\\).",
    },
    {
      topic: "DFT of an impulse",
      q: t`Find the DFT of \((1, 0, 0, 0)\).`,
      a: t`Only \(j = 0\) contributes: \(X_k = 1\) for every \(k\), a flat spectrum.`,
      code: `analytic.dft([1, 0, 0, 0]).text`,
      expect: `["1", "1", "1", "1"]`,
    },
    {
      topic: "Aliasing",
      q: t`A 7 Hz sine is sampled at 10 Hz. What frequency does it appear to have?`,
      a: t`The Nyquist frequency is 5 Hz; \(7\) folds to \(10 - 7 = 3\) Hz, and a sine comes back with its sign reversed: \(\sin(2\pi\cdot7n/10) = -\sin(2\pi\cdot3n/10)\).`,
      code: `const a = analytic.alias(7, 10);
[a.alias, a.sign, a.aliased]`,
      expect: "[3, -1, true]",
    },
    {
      topic: "Fourier transform",
      q: t`Find \(\hat f(\omega) = \int_{-\infty}^\infty f(x)e^{-i\omega x}dx\) for \(f = e^{-|x|}\) and for \(f = e^{-x^2}\).`,
      a: t`\(\int_0^\infty e^{-x(1 + i\omega)}dx + \int_0^\infty e^{-x(1 - i\omega)}dx = \dfrac{2}{1 + \omega^2}\). The Gaussian: \(\sqrt\pi\,e^{-\omega^2/4}\).`,
      code: `[analytic.fourierTransform("exp(-abs(x))").formula.text, analytic.fourierTransform("exp(-x^2)").formula.text]`,
      expect: `["2/(w^2 + 1)", "sqrt(pi)*exp(-1/4*w^2)"]`,
    },
    {
      topic: "Convolution",
      q: t`Compute \((f * f)(1)\) for \(f = e^{-|x|}\).`,
      a: t`\((f * f)(x) = (1 + |x|)e^{-|x|}\) (or invert \(\dfrac{4}{(1 + \omega^2)^2}\)): \((f * f)(1) = \dfrac2e \approx 0.735759\).`,
      code: `analytic.convolution("exp(-abs(x))", "exp(-abs(x))").at(1)`,
      check: near(2 / Math.E, 1e-9),
    },
    {
      topic: "Laplace transform",
      q: t`Find the Laplace transforms of \(t^2\) and \(e^{2t}\sin 3t\).`,
      a: t`\(\mathcal L\{t^n\} = \dfrac{n!}{s^{n+1}}\): \(\dfrac2{s^3}\). Shifting \(\dfrac3{s^2 + 9}\): \(\dfrac{3}{(s - 2)^2 + 9}\).`,
      code: `[analytic.laplace("t^2"), analytic.laplace("exp(2t)*sin(3t)")].map(String)`,
      expect: `["2/s^3", "3/((s - 2)^2 + 9)"]`,
    },
    {
      topic: "Inverse Laplace transform",
      q: t`Find \(\mathcal L^{-1}\left\{\dfrac{1}{s(s + 1)}\right\}\).`,
      a: t`\(\dfrac1s - \dfrac1{s + 1}\), so \(1 - e^{-t}\).`,
      code: `String(analytic.inverseLaplace("1/(s*(s+1))").result)`,
      expect: "1 - exp(-t)",
    },
    {
      topic: "Legendre polynomials",
      q: t`Find \(P_3(x)\).`,
      a: t`Rodrigues: \(P_3 = \tfrac1{48}\dfrac{d^3}{dx^3}(x^2 - 1)^3 = \tfrac12(5x^3 - 3x)\).`,
      code: `analytic.legendre(3)`,
      expect: "[0, -3/2, 0, 5/2]",
      note: "The answer is a coefficient list, constant term first.",
    },
    {
      topic: "Sturm–Liouville eigenvalues",
      q: t`Find the first three eigenvalues of \(-y'' = \lambda y\), \(y(0) = y(1) = 0\).`,
      a: t`\(y = \sin n\pi x\), \(\lambda_n = n^2\pi^2\): \(9.8696\), \(39.4784\), \(88.8264\).`,
      code: `analytic.sturmLiouville({ interval: [0, 1], count: 3 }).map((e) => e.eigenvalue)`,
      check: near([PI ** 2, 4 * PI ** 2, 9 * PI ** 2], 1e-7),
      note: "The interval needs rational ends, so the classic \\([0, \\pi]\\) (eigenvalues \\(1, 4, 9\\)) is refused.",
    },
    {
      topic: "Heat equation",
      q: t`Solve \(u_t = u_{xx}\) on \(0 < x < 1\) with \(u = 0\) at both ends and \(u(x, 0) = \sin\pi x\). Find \(u(\tfrac12, \tfrac1{10})\).`,
      a: t`\(u = e^{-\pi^2t}\sin\pi x\); \(u(\tfrac12, \tfrac1{10}) = e^{-\pi^2/10} \approx 0.372708\).`,
      code: `analytic.heat({ k: 1, length: 1, initial: "sin(pi*x)", terms: 3 }).at("1/2", "1/10").value`,
      check: near(Math.exp(-(PI ** 2) / 10), 1e-6),
    },
    {
      topic: "Wave equation",
      q: t`A string of length 1 with \(c = 1\) starts at rest in the shape \(\sin\pi x\). Find the displacement at \(x = \tfrac12\) at \(t = \tfrac12\) and \(t = \tfrac13\).`,
      a: t`\(u = \sin\pi x\cos\pi t\): \(u(\tfrac12, \tfrac12) = 0\), \(u(\tfrac12, \tfrac13) = \tfrac12\).`,
      code: `const W = analytic.wave({ length: 1, position: "sin(pi*x)" });
[W.at("1/2", "1/2"), W.at("1/2", "1/3")]`,
      check: near([0, 0.5], 1e-12),
    },
    {
      topic: "Laplace's equation on a disc",
      q: t`Solve \(\Delta u = 0\) in the unit disc with \(u = \cos\theta\) on the boundary. Find \(u\) at \(r = \tfrac12\), \(\theta = 0\).`,
      a: t`\(u = r\cos\theta\) (harmonic and right on the circle): \(u = \tfrac12\).`,
      code: `const u = analytic.laplaceDisc({ boundary: "cos(theta)" });
[u.closedForm, u.at("1/2", 0).value]`,
      expect: `["r*cos(theta)", 1/2]`,
      fix: "analytic#20",
      note: "Boundary values with finitely many modes give the exact finite sum: the solution is \\(r\\cos\\theta\\) and the value is the fraction \\(\\tfrac12\\), with no tail.",
    },
    {
      topic: "Convolution theorem",
      q: t`Check the convolution theorem \(\widehat{f * g} = \hat f\,\hat g\) for \(f = g = e^{-|x|}\) at \(x = 1\).`,
      a: t`\(\hat f\hat g = \dfrac{4}{(1 + \omega^2)^2}\), whose inverse transform at 1 is \(\dfrac{1}{2\pi}\int\dfrac{4e^{i\omega}}{(1 + \omega^2)^2}d\omega = 2e^{-1}\), the same as the direct convolution.`,
      code: `const r = analytic.convolution("exp(-abs(x))", "exp(-abs(x))").theorem(1);
[r.agrees, r.viaTransforms]`,
      check: (v) => v[0] === true && near(2 / Math.E, 1e-7)(v[1]),
      expectText: "[true, 2/e ≈ 0.7357589]",
    },
    {
      topic: "Mean-square convergence",
      q: t`For \(f(x) = x\) on \((-1, 1)\), find the mean square error \(\tfrac12\int_{-1}^1 (f - S_3)^2\,dx\) of the 3-term Fourier sum \(S_3\).`,
      a: t`By Bessel's equality, \(\int_{-1}^1 (f - S_3)^2 = \int_{-1}^1 x^2 - \sum_{n\le3} b_n^2 = \tfrac23 - \tfrac4{\pi^2}\left(1 + \tfrac14 + \tfrac19\right) = \tfrac23 - \tfrac{49}{9\pi^2} \approx 0.115029\). Half of that is \(\approx 0.0575146\).`,
      code: `analytic.fourier("x", [-1, 1], { terms: 3 }).exact().meanSquareError()`,
      check: near(1 / 3 - 49 / (18 * PI ** 2), 1e-9),
    },
  ],
};
