const t = String.raw;
import { near } from "./lib.js";

export default {
  title: "Calculus III: several variables and vector calculus",
  level: "University: first two years",
  short: "Vectors and planes, partial derivatives, gradients, optimisation, multiple integrals, line and surface integrals, the theorems of Green, Stokes and Gauss.",
  blurb: "Dot and cross products, planes, partial derivatives, gradients and directional derivatives, tangent planes, critical points and the second derivative test, Lagrange multipliers, double and triple integrals in rectangular, polar and spherical coordinates, Jacobians, line integrals and conservative fields, Green's theorem, divergence and curl, the divergence theorem, surface area, and curves in space.",
  exercises: [
    {
      topic: "Dot and cross products",
      q: t`For \(\mathbf u = (1, 2, -2)\) and \(\mathbf v = (3, 0, 4)\) find \(\mathbf u\cdot\mathbf v\) and \(\mathbf u\times\mathbf v\).`,
      a: t`\(\mathbf u\cdot\mathbf v = 3 - 8 = -5\); \(\mathbf u\times\mathbf v = (8, -10, -6)\).`,
      code: "const u = geo.vector(1, 2, -2);\n[u.dot([3, 0, 4]), String(u.cross([3, 0, 4]))]",
      expect: '[-5, "(8, -10, -6)"]',
      note: "geo's 3D <code>vector</code> has dot and cross products.",
      fix: "geo#11",
    },
    {
      topic: "Plane through three points",
      q: t`Find the plane through \((1, 0, 2)\), \((2, 1, 0)\), \((0, 3, 1)\).`,
      a: t`Normal \((1, 1, -2)\times(-1, 3, -1) = (5, 3, 4)\): \(5x + 3y + 4z = 13\).`,
      code: "geo.plane([1, 0, 2], [2, 1, 0], [0, 3, 1]).equation",
      expect: "5x + 3y + 4z = 13",
      note: "<code>plane</code> takes the normal as a cross product and prints the equation with whole coefficients.",
      fix: "geo#11",
    },
    {
      topic: "Partial derivatives",
      q: t`For \(f(x, y) = x^2y^3 + e^{xy}\) find \(f_x\) and \(f_y\).`,
      a: t`\(f_x = 2xy^3 + ye^{xy}\), \(f_y = 3x^2y^2 + xe^{xy}\).`,
      code: `const f = symbolic.sym("x^2*y^3 + exp(x*y)");
[f.diff("x"), f.diff("y")]`,
      expect: "[2*x*y^3 + exp(x*y)*y, 3*x^2*y^2 + exp(x*y)*x]",
    },
    {
      topic: "Directional derivative",
      q: t`For \(f = x^2y + yz\), find \(\nabla f\) at \((1, 2, 3)\) and the derivative in the direction \((2, 1, -2)\).`,
      a: t`\(\nabla f = (2xy, x^2 + z, y) = (4, 4, 2)\); unit direction \(\tfrac13(2, 1, -2)\): \(\tfrac{8 + 4 - 4}{3} = \tfrac83\).`,
      code: `const f = analytic.field("x^2*y + y*z", ["x", "y", "z"]);
[f.gradient().map((g) => g.value([1, 2, 3]).exact()), f.directional([1, 2, 3], [2, 1, -2]).exact()]`,
      expect: /\[\[4, 4, 2\], 8\/3\]/,
      expectText: "[[4, 4, 2], 8/3]",
    },
    {
      topic: "Tangent plane",
      q: t`Find the tangent plane to \(z = x^2 + y^2\) at \((1, 2)\).`,
      a: t`\(z = 5 + 2(x - 1) + 4(y - 2) = 2x + 4y - 5\).`,
      code: `analytic.field("x^2 + y^2", ["x", "y"]).linearization([1, 2]).toString()`,
      expect: /2\*x \+ 4\*y - 5|2x \+ 4y - 5|5 \+ 2\*\(x - 1\) \+ 4\*\(y - 2\)/,
      expectText: "2x + 4y - 5",
    },
    {
      topic: "Second derivative test",
      q: t`Find and classify the critical points of \(f = x^3 + y^3 - 3xy\).`,
      a: t`\(f_x = 3x^2 - 3y\), \(f_y = 3y^2 - 3x\): \((0, 0)\) and \((1, 1)\). \(D = 36xy - 9\): \(-9 < 0\) saddle at the origin; \(27 > 0\), \(f_{xx} = 6 > 0\): local minimum \(-1\) at \((1, 1)\).`,
      code: `const mid = (iv) => Number(iv.low.add(iv.high).toNumber() / 2).toFixed(12);
analytic.field("x^3 + y^3 - 3*x*y", ["x", "y"]).criticalPoints({ x: [-2, 2], y: [-2, 2] }).exact().map((c) => [c.kind, c.point.map(mid), mid(c.value)])`,
      expect: '[["saddle", ["0.000000000000", "0.000000000000"], "0.000000000000"], ["min", ["1.000000000000", "1.000000000000"], "-1.000000000000"]]',
      note: "Certified: each point comes as a tiny box proven to hold exactly one critical point (shown here by its midpoint).",
      expectText: "saddle at (0, 0); local minimum −1 at (1, 1)",
    },
    {
      topic: "Lagrange multipliers",
      q: t`Find the maximum of \(xy\) on the circle \(x^2 + y^2 = 8\).`,
      a: t`\(y = 2\lambda x\), \(x = 2\lambda y\) give \(x^2 = y^2 = 4\): maximum 4 at \(\pm(2, 2)\).`,
      code: `analytic.lagrange("x*y", "x^2 + y^2 - 8", ["x", "y"], { x: [-3, 3], y: [-3, 3] }).max.value`,
      check: near(4, 1e-15),
      expectText: "4 (a certified enclosure)",
    },
    {
      topic: "Double integral",
      q: t`\(\displaystyle\int_0^1\!\!\int_0^2 (x + y^2)\,dy\,dx\)`,
      a: t`Inner: \(2x + \tfrac83\). Outer: \(1 + \tfrac83 = \tfrac{11}{3}\).`,
      code: `symbolic.integrate(String(symbolic.integrate("x + y^2", "y", { from: 0, to: 2 }).value), "x", { from: 0, to: 1 }).value`,
      expect: "11/3",
    },
    {
      topic: "Reversing the order",
      q: t`\(\displaystyle\int_0^1\!\!\int_x^1 e^{y^2}\,dy\,dx\)`,
      a: t`Reverse: \(\int_0^1\int_0^y e^{y^2}\,dx\,dy = \int_0^1 ye^{y^2}\,dy = \tfrac{e - 1}{2}\).`,
      code: `symbolic.integrate("y*exp(y^2)", "y", { from: 0, to: 1 }).value`,
      expect: ["e/2 - 1/2", "(e - 1)/2", "-1/2 + e/2"],
      status: "partial",
      note: "The order of integration is reversed by hand; the libraries do not change the order over a region.",
    },
    {
      topic: "Polar coordinates",
      q: t`\(\displaystyle\iint_{x^2 + y^2 \le 4} e^{-(x^2 + y^2)}\,dA\)`,
      a: t`\(\int_0^{2\pi}\!\int_0^2 e^{-r^2} r\,dr\,d\theta = \pi(1 - e^{-4}) \approx 3.0841\).`,
      code: `analytic.changeOfVariables("exp(-(x^2 + y^2))", ["x", "y"], { x: "r*cos(t)", y: "r*sin(t)" }, ["r", "t"], { r: [0, 2], t: [0, "2*pi"] }).value`,
      check: near(3.0840522, 1e-5),
      expectText: "π(1 − e⁻⁴) ≈ 3.08405",
    },
    {
      topic: "Triple integral",
      q: t`Find the volume of the tetrahedron \(x, y, z \ge 0\), \(x + y + z \le 1\).`,
      a: t`\(\int_0^1\int_0^{1-x}(1 - x - y)\,dy\,dx = \tfrac16\).`,
      code: `const inner = symbolic.integrate("1 - x - y", "y", { from: 0, to: "1 - x" }).value;
symbolic.integrate(String(inner), "x", { from: 0, to: 1 }).value`,
      expect: "1/6",
    },
    {
      topic: "Spherical coordinates",
      q: t`Use spherical coordinates to find the volume of a ball of radius 2.`,
      a: t`\(\int_0^{2\pi}\int_0^\pi\int_0^2 \rho^2\sin\phi\,d\rho\,d\phi\,d\theta = \tfrac{32\pi}{3}\).`,
      code: `const r = symbolic.integrate("rho^2", "rho", { from: 0, to: 2 }).value;          // 8/3
const p = symbolic.integrate("sin(phi)", "phi", { from: 0, to: "pi" }).value;      // 2
symbolic.simplify(\`(\${r})*(\${p})*2*pi\`)`,
      expect: "32*pi/3",
    },
    {
      topic: "Jacobian",
      q: t`Find the Jacobian determinant of \(x = r\cos\theta\), \(y = r\sin\theta\).`,
      a: t`\(\cos\theta\cdot r\cos\theta - (-r\sin\theta)\sin\theta = r\).`,
      code: `analytic.changeOfVariables("1", ["x", "y"], { x: "r*cos(t)", y: "r*sin(t)" }, ["r", "t"], { r: [0, 1], t: [0, 1] }).determinant`,
      expect: "r",
    },
    {
      topic: "Conservative field",
      q: t`Find \(\int_C y\,dx + x\,dy\) along any path from \((0, 0)\) to \((1, 2)\).`,
      a: t`\(\mathbf F = \nabla(xy)\): the integral is \(xy\big|_{(0,0)}^{(1,2)} = 2\).`,
      code: `const P = analytic.potential(["y", "x"], ["x", "y"]);
[P.conservative, String(P.potential), P.value([1, 2], [0, 0])]`,
      expect: '[true, "x*y", 2]',
    },
    {
      topic: "Circulation",
      q: t`Find \(\oint_C -y\,dx + x\,dy\) around the unit circle, counterclockwise.`,
      a: t`With \(x = \cos t\), \(y = \sin t\): \(\int_0^{2\pi}(\sin^2 t + \cos^2 t)\,dt = 2\pi\).`,
      code: `// the parameter interval must be rational, so t runs over [0, 1] and the angle is 2πt
analytic.lineIntegral(["-y", "x"], ["x", "y"], { x: "cos(2*pi*t)", y: "sin(2*pi*t)" }, [0, 1]).exact()`,
      note: "<code>lineIntegral</code> refuses an end such as <code>\"2*pi\"</code> (\"not a number\") although <code>surfaceIntegral</code> and <code>curve().length</code> accept it; the curve is reparametrised over \\([0, 1]\\).",
      check: near(2 * Math.PI, 1e-9),
      expectText: "2π",
    },
    {
      topic: "Green's theorem",
      q: t`Use Green's theorem for \(\oint_C x^2y\,dx + x\,dy\) around the unit square \([0,1]^2\), counterclockwise.`,
      a: t`\(\iint (1 - x^2)\,dA = 1 - \tfrac13 = \tfrac23\).`,
      code: `const g = analytic.greens(["x^2*y", "x"], ["x", "y"], { x: [0, 1], y: [0, 1] });
[g.agree, g.right.value]`,
      check: (v) => v[0] === true && Math.abs(v[1].low.toNumber() - 2 / 3) < 1e-9 && Math.abs(v[1].high.toNumber() - 2 / 3) < 1e-9,
      expectText: "[true, 2/3]",
    },
    {
      topic: "Divergence and curl",
      q: t`For \(\mathbf F = (xy, yz, zx)\) find \(\nabla\cdot\mathbf F\) and \(\nabla\times\mathbf F\).`,
      a: t`\(\nabla\cdot\mathbf F = x + y + z\); \(\nabla\times\mathbf F = (-y, -z, -x)\).`,
      code: `const F = ["x*y", "y*z", "z*x"], V = ["x", "y", "z"];
[String(analytic.divergence(F, V)), analytic.curl(F, V).map(String)]`,
      expect: /^\[(y \+ z \+ x|x \+ y \+ z|y \+ x \+ z|.*), \["-y", "-z", "-x"\]\]$/,
      expectText: '[x + y + z, ["-y", "-z", "-x"]]',
    },
    {
      topic: "Divergence theorem",
      q: t`Find the flux of \(\mathbf F = (x, y, z)\) out of the unit sphere.`,
      a: t`\(\iiint 3\,dV = 3\cdot\tfrac43\pi = 4\pi\).`,
      code: `analytic.surfaceIntegral(["x", "y", "z"], ["x", "y", "z"], { x: "sin(u)*cos(v)", y: "sin(u)*sin(v)", z: "cos(u)" }, ["u", "v"], { u: [0, "pi"], v: [0, "2*pi"] }).exact()`,
      check: near(4 * Math.PI, 1e-8),
      expectText: "4π ≈ 12.566",
    },
    {
      topic: "Surface area",
      q: t`Find the area of the part of \(z = x^2 + y^2\) below \(z = 1\).`,
      a: t`\(\int_0^{2\pi}\int_0^1 \sqrt{1 + 4r^2}\,r\,dr\,d\theta = \tfrac{\pi}{6}(5\sqrt5 - 1) \approx 5.3304\).`,
      code: `analytic.surfaceIntegral("1", ["x", "y", "z"], { x: "r*cos(t)", y: "r*sin(t)", z: "r^2" }, ["r", "t"], { r: [0, 1], t: [0, "2*pi"] }).exact()`,
      check: near(5.3304135, 1e-6),
      expectText: "π(5√5 − 1)/6 ≈ 5.33041",
    },
    {
      topic: "Curves in space",
      q: t`For the helix \(\mathbf r(t) = (\cos t, \sin t, t)\), find the length for \(0 \le t \le 2\pi\) and the curvature.`,
      a: t`Speed \(\sqrt2\): length \(2\sqrt2\,\pi \approx 8.8858\). Curvature \(\tfrac{|\mathbf r'\times\mathbf r''|}{|\mathbf r'|^3} = \tfrac{\sqrt2}{2\sqrt2} = \tfrac12\).`,
      code: `const c = analytic.curve(["cos(t)", "sin(t)", "t"], "t");
[c.length([0, "2*pi"]), c.curvature()]`,
      check: (v) => Math.abs((v[0].low.toNumber() + v[0].high.toNumber()) / 2 - 8.8857659) < 1e-6 && String(v[1]) === "1/2",
      expectText: "[2√2 π ≈ 8.88577, 1/2]",
    },
  ],
};
