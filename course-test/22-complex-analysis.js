const t = String.raw;
import { near, nearC } from "./lib.js";

const PI = Math.PI, E = Math.E;

export default {
  title: "Complex analysis",
  level: "University: upper level",
  short: "Complex arithmetic and polar form, roots, the exponential and logarithm with branches, analytic functions, contour integrals, residues, real integrals, Laurent series, counting zeros, Möbius maps, gamma and zeta.",
  blurb: "Arithmetic and division, modulus and argument, roots of a complex number, the exponential, principal logarithm and \(i^i\), sines of imaginary numbers, the Cauchy–Riemann equations, contour integrals and Cauchy's formula, residues at poles of every order, real integrals over the line and round the circle, Laurent series, Rouché-style zero counting, Möbius maps and their fixed points, and values of \(\Gamma\) and \(\zeta\).",
  exercises: [
    {
      topic: "Arithmetic",
      q: t`Compute \((1 + 2i)(3 - i)\) and \(\dfrac{1 + 2i}{3 - i}\).`,
      a: t`\(3 - i + 6i - 2i^2 = 5 + 5i\). \(\dfrac{(1 + 2i)(3 + i)}{10} = \dfrac{1 + 7i}{10}\).`,
      code: `[complex.complex("(1 + 2i)*(3 - i)"), complex.complex("(1 + 2i)/(3 - i)")]`,
      expect: "[5 + 5i, 1/10 + 7/10i]",
    },
    {
      topic: "Polar form",
      q: t`Write \(-1 + i\) in polar form.`,
      a: t`\(r = \sqrt2\), \(\theta = 3\pi/4\) (second quadrant), i.e. \(\tfrac38\) of a full turn: \(-1 + i = \sqrt2\,e^{3\pi i/4}\).`,
      code: `const p = complex.polar("-1 + i");
[p.modulus, p.argument, p.exactTurn]`,
      check: (v) => near([Math.SQRT2, 3 * PI / 4])(v.slice(0, 2)) && String(v[2]) === "3/8",
      expectText: "[√2 ≈ 1.41421, 3π/4 ≈ 2.35619, 3/8 of a turn]",
    },
    {
      topic: "Roots",
      q: t`Find the three cube roots of \(-8\).`,
      a: t`\(-8 = 8e^{i\pi}\): roots \(2e^{i(\pi + 2k\pi)/3}\), i.e. \(1 + i\sqrt3\), \(-2\), \(1 - i\sqrt3\).`,
      code: `complex.roots("-8", 3)`,
      check: nearC([[1, Math.sqrt(3)], [-2, 0], [1, -Math.sqrt(3)]]),
    },
    {
      topic: "Exponential",
      q: t`Compute \(e^{1 + i}\).`,
      a: t`\(e(\cos1 + i\sin1) \approx 1.4686939 + 2.2873553i\).`,
      code: `complex.exp("1 + i")`,
      check: nearC([E * Math.cos(1), E * Math.sin(1)]),
      note: "<code>exp(\"pi i\")</code> is refused: the text parser reads exact complex rationals only, so \\(e^{i\\pi}\\) cannot be asked for directly.",
    },
    {
      topic: "Principal logarithm",
      q: t`Find the principal value \(\operatorname{Log}(-1 - i)\).`,
      a: t`\(\ln|{-1-i}| + i\operatorname{Arg} = \tfrac12\ln2 - \tfrac{3\pi}{4}i \approx 0.3465736 - 2.3561945i\).`,
      code: `complex.log("-1 - i")`,
      check: nearC([Math.log(2) / 2, -3 * PI / 4]),
    },
    {
      topic: "Complex powers",
      q: t`Find the principal value of \(i^i\).`,
      a: t`\(i^i = e^{i\operatorname{Log} i} = e^{i\cdot i\pi/2} = e^{-\pi/2} \approx 0.2078796\), a real number.`,
      code: `complex.pow("i", "i")`,
      check: nearC([Math.exp(-PI / 2), 0]),
    },
    {
      topic: "Trigonometric functions",
      q: t`Compute \(\sin i\).`,
      a: t`\(\sin i = \dfrac{e^{-1} - e}{2i} = i\sinh 1 \approx 1.1752012i\).`,
      code: `complex.sin("i")`,
      check: nearC([0, Math.sinh(1)]),
    },
    {
      topic: "Cauchy–Riemann equations",
      q: t`Check that \(f = (x^2 - y^2) + 2xy\,i\) satisfies the Cauchy–Riemann equations.`,
      a: t`\(u_x = 2x = v_y\) and \(u_y = -2y = -v_x\). (It is \(f = z^2\).)`,
      code: `const d = (e, v) => symbolic.sym(e).diff(v);
[symbolic.simplify(\`\${d("x^2 - y^2", "x")} - (\${d("2*x*y", "y")})\`), symbolic.simplify(\`\${d("x^2 - y^2", "y")} + \${d("2*x*y", "x")}\`)]`,
      expect: "[0, 0]",
      status: "partial",
      note: "Checked with symbolic partial derivatives; there is no Cauchy–Riemann or analyticity test for a function given by its real and imaginary parts.",
    },
    {
      topic: "Contour integral",
      q: t`Compute \(\oint_{|z|=1} \dfrac{dz}{z}\), counter-clockwise.`,
      a: t`\(z = e^{it}\): \(\int_0^{2\pi} i\,dt = 2\pi i\).`,
      code: `complex.contourIntegral("1/z", complex.Contour.circle(0, 1))`,
      check: nearC([0, 2 * PI]),
    },
    {
      topic: "Cauchy's integral formula",
      q: t`Compute \(\oint_{|z|=2} \dfrac{e^z}{z - 1}\,dz\).`,
      a: t`\(2\pi i\,e^1 \approx 17.0794684i\).`,
      code: `complex.contourIntegral("exp(z)/(z - 1)", complex.Contour.circle(0, 2))`,
      check: nearC([0, 2 * PI * E]),
    },
    {
      topic: "Residue at a simple pole",
      q: t`Find \(\operatorname{Res}_{z=i} \dfrac{1}{z^2 + 1}\).`,
      a: t`\(\dfrac{1}{2z}\Big|_{z=i} = \dfrac1{2i} = -\dfrac i2\).`,
      code: `complex.residue("1/(z^2 + 1)", "i")`,
      check: nearC([0, -0.5]),
    },
    {
      topic: "Residue at a higher-order pole",
      q: t`Find \(\operatorname{Res}_{z=0} \dfrac{e^z}{z^3}\).`,
      a: t`The coefficient of \(z^2\) in \(e^z\): \(\tfrac12\).`,
      code: `complex.residue("exp(z)/z^3", 0)`,
      check: nearC([0.5, 0]),
    },
    {
      topic: "Real integral by residues",
      q: t`Evaluate \(\displaystyle\int_{-\infty}^{\infty} \frac{dx}{(1 + x^2)^2}\).`,
      a: t`Double pole at \(i\) in the upper half-plane: \(\operatorname{Res} = \dfrac{d}{dz}(z + i)^{-2}\Big|_i = -2(2i)^{-3} = \dfrac{1}{4i}\). Integral \(= 2\pi i\cdot\dfrac1{4i} = \dfrac\pi2\).`,
      code: `complex.realLineIntegral("1/(x^2 + 1)^2").real`,
      check: near(PI / 2, 1e-12),
    },
    {
      topic: "Trigonometric integral",
      q: t`Evaluate \(\displaystyle\int_0^{2\pi} \frac{d\theta}{2 + \cos\theta}\).`,
      a: t`With \(z = e^{i\theta}\) it becomes \(\oint \dfrac{2\,dz}{i(z^2 + 4z + 1)}\); the pole inside is \(-2 + \sqrt3\) with residue \(\dfrac{1}{2\sqrt3}\cdot\dfrac2i\). Total \(\dfrac{2\pi}{\sqrt3} \approx 3.6275987\).`,
      code: `complex.trigIntegral("1/(2 + cos(t))").real`,
      check: near(2 * PI / Math.sqrt(3), 1e-12),
    },
    {
      topic: "Laurent series",
      q: t`Find the Laurent series of \(\dfrac{1}{z(1 - z)}\) in \(0 < |z| < 1\), up to \(z^2\).`,
      a: t`\(\dfrac1z\cdot\dfrac1{1 - z} = \dfrac1z + 1 + z + z^2 + \cdots\): every coefficient from \(a_{-1}\) on is 1.`,
      code: `const L = complex.laurent("1/(z*(1 - z))", 0, "1/2", { from: -1, to: 2 });
[-1, 0, 1, 2].map((n) => L.coefficient ? L.coefficient(n) : L.coefficients[n + 1])`,
      check: nearC([[1, 0], [1, 0], [1, 0], [1, 0]], 1e-10),
    },
    {
      topic: "Classifying singularities",
      q: t`Locate and classify the singularities of \(\dfrac{e^z}{(z^2 + 1)^2\sin z}\) in the square \(|\operatorname{Re} z|, |\operatorname{Im} z| \le 2\).`,
      a: t`\(\sin z = 0\) at \(z = 0\) only in the square (\(\pm\pi\) lie outside): a simple pole. \((z^2 + 1)^2\) vanishes to order 2 at \(\pm i\): double poles. \(e^z\) never vanishes, so nothing cancels.`,
      code: `const r = complex.singularities("exp(z)/((z^2 + 1)^2 * sin(z))", complex.rect([-2, 2], [-2, 2]));
r.singularities.map((s) => [s.kind, s.order, s.enclosure.center])`,
      check: (v) => v.length === 3 && v.every((x) => x[0] === "pole") && JSON.stringify(v.map((x) => x[1])) === "[2,2,1]" && nearC([[0, -1], [0, 1], [0, 0]])(v.map((x) => x[2])),
      expectText: "[[pole, 2, −i], [pole, 2, i], [pole, 1, 0]]",
    },
    {
      topic: "Counting zeros",
      q: t`How many zeros does \(z^5 + 3z + 1\) have in \(|z| < 1\)?`,
      a: t`On \(|z| = 1\), \(|z^5 + 1| \le 2 < 3 = |3z|\), so by Rouché it has as many zeros as \(3z\): one.`,
      code: `complex.countZeros("z^5 + 3z + 1", complex.Contour.circle(0, 1))`,
      expect: "1",
    },
    {
      topic: "Möbius maps",
      q: t`Under \(T(z) = \dfrac{z - i}{z + i}\), find \(T(0)\), \(T(1)\) and \(T(i)\). Where does the real line go?`,
      a: t`\(T(0) = -1\), \(T(1) = \dfrac{1 - i}{1 + i} = -i\), \(T(i) = 0\). Real \(x\) has \(|x - i| = |x + i|\), so the real line goes to the unit circle (and the upper half-plane to the disc).`,
      code: `const T = complex.mobius(1, "-i", 1, "i");
[T.apply(0), T.apply(1), T.apply("i")]`,
      expect: "[-1, -i, 0]",
    },
    {
      topic: "Fixed points and type",
      q: t`Find the fixed points of \(T(z) = \dfrac{2z + 1}{z + 1}\) and classify the map.`,
      a: t`\(z^2 + z = 2z + 1\): \(z^2 - z - 1 = 0\), \(z = \tfrac{1 \pm \sqrt5}2\). \(\operatorname{tr}^2/\det = 9 > 4\) and real: hyperbolic.`,
      code: `const T = complex.mobius(2, 1, 1, 1);
[T.classify(), ...T.fixedPoints().points]`,
      check: (v) => v[0] === "hyperbolic" && nearC([[(1 + Math.sqrt(5)) / 2, 0], [(1 - Math.sqrt(5)) / 2, 0]])(v.slice(1)),
      expectText: "[hyperbolic, (1 + √5)/2, (1 − √5)/2]",
    },
    {
      topic: "Gamma and zeta",
      q: t`Give \(\Gamma(\tfrac12)\), \(\zeta(2)\) and \(\zeta(-1)\).`,
      a: t`\(\Gamma(\tfrac12) = \sqrt\pi \approx 1.7724539\); \(\zeta(2) = \pi^2/6 \approx 1.6449341\); \(\zeta(-1) = -\tfrac1{12}\).`,
      code: `[complex.gamma("1/2"), complex.zeta(2), complex.zeta(-1)]`,
      check: nearC([[Math.sqrt(PI), 0], [PI * PI / 6, 0], [-1 / 12, 0]], 1e-10),
    },
  ],
};
