const t = String.raw;
import { near } from "./lib.js";

const PI = Math.PI;

export default {
  title: "Differential geometry",
  level: "University: upper level",
  short: "Curves: speed, arc length, curvature, torsion, the Frenet frame, osculating circles and evolutes. Surfaces: fundamental forms, Gaussian and mean curvature, Christoffel symbols, geodesics, parallel transport, Gauss–Bonnet.",
  blurb: "The helix (speed, curvature, torsion, length, Frenet frame), curvature and the osculating circle of a parabola, its evolute, total curvature of a circle, the torus (first fundamental form, Gaussian curvature on the outer and inner rims, area), the sphere and the hyperbolic half-plane, a cylinder, a saddle and the catenoid as a minimal surface, Christoffel symbols in polar coordinates, a hyperbolic geodesic, holonomy of parallel transport round a latitude, and Gauss–Bonnet.",
  exercises: [
    {
      topic: "The helix",
      q: t`For the helix \(\mathbf r(t) = (\cos t, \sin t, t/2)\), find the speed, curvature and torsion.`,
      a: t`\(|\mathbf r'| = \sqrt{1 + \tfrac14} = \tfrac{\sqrt5}2\). For \((a\cos t, a\sin t, bt)\): \(\kappa = \dfrac{a}{a^2 + b^2} = \dfrac{1}{5/4} = \tfrac45\), \(\tau = \dfrac{b}{a^2 + b^2} = \tfrac25\).`,
      code: `const h = analytic.curve(["cos(t)", "sin(t)", "t/2"], "t");
[h.speed(), h.curvature(), h.torsion()].map(String)`,
      expect: `["sqrt(5/4)", "4/5", "2/5"]`,
    },
    {
      topic: "Arc length",
      q: t`Find the length of one turn of the helix, \(0 \le t \le 2\pi\).`,
      a: t`\(2\pi\cdot\tfrac{\sqrt5}2 = \pi\sqrt5 \approx 7.024815\).`,
      code: `analytic.curve(["cos(t)", "sin(t)", "t/2"], "t").length([0, "2*pi"])`,
      check: near(PI * Math.sqrt(5), 1e-12),
    },
    {
      topic: "Frenet frame",
      q: t`Find the unit tangent, principal normal and binormal of the helix at \(t = 0\).`,
      a: t`\(\mathbf r'(0) = (0, 1, \tfrac12)\), so \(T = \tfrac1{\sqrt5}(0, 2, 1)\). \(T'\) points to \((-1, 0, 0)\): \(N = (-1, 0, 0)\). \(B = T\times N = \tfrac1{\sqrt5}(0, -1, 2)\).`,
      code: `const a = analytic.curve(["cos(t)", "sin(t)", "t/2"], "t").at(0);
[...a.tangent, ...a.normal, ...a.binormal]`,
      check: near([0, 2 / Math.sqrt(5), 1 / Math.sqrt(5), -1, 0, 0, 0, -1 / Math.sqrt(5), 2 / Math.sqrt(5)], 1e-12),
    },
    {
      topic: "Curvature of a plane curve",
      q: t`Find the curvature of the parabola \(y = x^2\) as a function of \(x\), and at the vertex.`,
      a: t`\(\kappa = \dfrac{|y''|}{(1 + y'^2)^{3/2}} = \dfrac{2}{(1 + 4x^2)^{3/2}}\); at the vertex \(\kappa = 2\).`,
      code: `const p = analytic.curve(["t", "t^2"], "t");
[String(p.curvature()), p.at(0).curvature]`,
      expect: `["2/(4*t^2*sqrt(4*t^2 + 1) + sqrt(4*t^2 + 1))", 2]`,
      note: "The formula is correct but not in its simplest form: \\(4t^2\\sqrt{4t^2+1} + \\sqrt{4t^2+1} = (4t^2+1)^{3/2}\\).",
    },
    {
      topic: "Osculating circle",
      q: t`Find the osculating circle of \(y = x^2\) at the origin.`,
      a: t`Radius \(1/\kappa = \tfrac12\), centre on the normal (the \(y\)-axis): \((0, \tfrac12)\).`,
      code: `const a = analytic.curve(["t", "t^2"], "t").at(0);
[a.radius, ...a.centre]`,
      expect: "[1/2, 0, 1/2]",
    },
    {
      topic: "Evolutes",
      q: t`Find the evolute (the locus of centres of curvature) of \((t, t^2)\).`,
      a: t`Centre \(= \mathbf r + \dfrac{1 + 4t^2}{2}\,\dfrac{(-2t, 1)}{1}\cdot\dfrac{1}{1}\): \(\left(t - 2t(1 + 4t^2)\cdot\tfrac12\cdot2,\ t^2 + \tfrac{1 + 4t^2}{2}\right) = (-4t^3, 3t^2 + \tfrac12)\), a semicubical parabola.`,
      code: `analytic.curve(["t", "t^2"], "t").evolute().position.map(String)`,
      expect: `["-4*t^3", "3*t^2 + 1/2"]`,
    },
    {
      topic: "Total curvature",
      q: t`Find the curvature and the total curvature \(\int\kappa\,ds\) of the circle of radius 3.`,
      a: t`\(\kappa = \tfrac13\), length \(6\pi\): total \(2\pi\) (the turning number of a simple closed curve times \(2\pi\)).`,
      code: `const c = analytic.curve(["3*cos(t)", "3*sin(t)"], "t");
[c.curvature(), c.totalCurvature([0, "2*pi"])]`,
      check: (v) => String(v[0]) === "1/3" && near(2 * PI, 1e-12)(v[1]),
      expectText: "[1/3, 2π]",
    },
    {
      topic: "First fundamental form",
      q: t`Find \(E, F, G\) for the torus \(((2 + \cos v)\cos u, (2 + \cos v)\sin u, \sin v)\).`,
      a: t`\(\mathbf r_u = (2 + \cos v)(-\sin u, \cos u, 0)\), \(\mathbf r_v = (-\sin v\cos u, -\sin v\sin u, \cos v)\): \(E = (2 + \cos v)^2\), \(F = 0\), \(G = 1\).`,
      code: `const f = analytic.surface(["(2 + cos(v))*cos(u)", "(2 + cos(v))*sin(u)", "sin(v)"], ["u", "v"]).first();
[f.E, f.F, f.G].map(String)`,
      expect: `["cos(v)^2 + 4*cos(v) + 4", "0", "1"]`,
    },
    {
      topic: "Gaussian curvature of the torus",
      q: t`Find the Gaussian curvature of the torus, and its value on the outer (\(v = 0\)) and inner (\(v = \pi\)) rims.`,
      a: t`\(K = \dfrac{\cos v}{2 + \cos v}\): \(\tfrac13\) outside (elliptic), \(-1\) inside (hyperbolic).`,
      code: `const T = analytic.surface(["(2 + cos(v))*cos(u)", "(2 + cos(v))*sin(u)", "sin(v)"], ["u", "v"]);
[String(T.gaussian()), T.at(0, 0).gaussian, T.at(0, "pi").gaussian, T.at(0, 0).kind, T.at(0, "pi").kind]`,
      check: (v) => v[0] === "cos(v)/(cos(v) + 2)" && near([1 / 3, -1], 1e-12)(v.slice(1, 3)) && v[3] === "elliptic" && v[4] === "hyperbolic",
      expectText: "[cos(v)/(cos(v) + 2), 1/3, −1, elliptic, hyperbolic]",
    },
    {
      topic: "Surface area",
      q: t`Find the area of the torus.`,
      a: t`\(\int_0^{2\pi}\int_0^{2\pi}(2 + \cos v)\,dv\,du = 4\pi\cdot2\pi = 8\pi^2 \approx 78.9568\).`,
      code: `analytic.surface(["(2 + cos(v))*cos(u)", "(2 + cos(v))*sin(u)", "sin(v)"], ["u", "v"]).area({ u: [0, "2*pi"], v: [0, "2*pi"] })`,
      check: near(8 * PI ** 2, 1e-6),
    },
    {
      topic: "The sphere",
      q: t`Find the Gaussian curvature of the unit sphere and its total curvature.`,
      a: t`\(K = 1\); total \(\int K\,dA = 4\pi = 2\pi\chi(S^2)\).`,
      code: `const S = analytic.surface(["cos(u)*sin(v)", "sin(u)*sin(v)", "cos(v)"], ["u", "v"]);
[S.gaussian(), S.totalCurvature({ u: [0, "2*pi"], v: [0, "pi"] })]`,
      check: (v) => String(v[0]) === "1" && near(4 * PI, 1e-6)(v[1]),
      expectText: "[1, 4π]",
    },
    {
      topic: "The hyperbolic plane",
      q: t`Find the Gaussian curvature of the half-plane metric \(\dfrac{du^2 + dv^2}{v^2}\).`,
      a: t`For \(E = G = e^{2\phi}\), \(K = -e^{-2\phi}\Delta\phi\); here \(\phi = -\ln v\), \(\Delta\phi = 1/v^2\), so \(K = -v^2\cdot\tfrac1{v^2} = -1\).`,
      code: `String(analytic.metric({ E: "1/v^2", F: 0, G: "1/v^2" }, ["u", "v"]).gaussian())`,
      expect: "-1",
    },
    {
      topic: "A cylinder",
      q: t`Find the Gaussian and mean curvature of the unit cylinder \((\cos u, \sin u, v)\).`,
      a: t`Principal curvatures 1 (round) and 0 (along the rulings): \(K = 0\), \(|H| = \tfrac12\) (the sign depends on the normal: with the outward normal \(\mathbf r_u\times\mathbf r_v\), \(H = -\tfrac12\)).`,
      code: `const C = analytic.surface(["cos(u)", "sin(u)", "v"], ["u", "v"]);
[C.gaussian(), C.mean()].map(String)`,
      expect: `["0", "-1/2"]`,
    },
    {
      topic: "A saddle",
      q: t`Find \(K\) and \(H\) for \(z = xy\) at the origin.`,
      a: t`\(f_{xy} = 1\), \(f_{xx} = f_{yy} = 0\), \(\nabla f = 0\): \(K = f_{xx}f_{yy} - f_{xy}^2 = -1\), \(H = 0\).`,
      code: `const a = analytic.surface(["u", "v", "u*v"], ["u", "v"]).at(0, 0);
[a.gaussian, a.mean]`,
      expect: "[-1, 0]",
    },
    {
      topic: "Minimal surfaces",
      q: t`Show the catenoid \((\cosh v\cos u, \cosh v\sin u, v)\) is minimal, and find its Gaussian curvature.`,
      a: t`\(H = 0\); \(K = -\dfrac{1}{\cosh^4 v}\).`,
      code: `const C = analytic.surface(["cosh(v)*cos(u)", "cosh(v)*sin(u)", "v"], ["u", "v"]);
[C.mean(), C.gaussian()].map(String)`,
      expect: `["0", "-(1/(sinh(v)^4 + 2*sinh(v)^2 + 1))"]`,
      note: "Correct, written with \\(\\sinh^4 v + 2\\sinh^2 v + 1 = \\cosh^4 v\\) left unsimplified.",
    },
    {
      topic: "Christoffel symbols",
      q: t`Find the Christoffel symbols of the plane in polar coordinates, \(ds^2 = dr^2 + r^2d\theta^2\).`,
      a: t`\(\Gamma^r_{\theta\theta} = -r\), \(\Gamma^\theta_{r\theta} = \Gamma^\theta_{\theta r} = \tfrac1r\), all others 0.`,
      code: `analytic.metric({ E: "1", F: 0, G: "r^2" }, ["r", "theta"]).christoffel()`,
      expect: `{ r_rr: "0", r_rtheta: "0", r_thetatheta: "-r", theta_rr: "0", theta_rtheta: "1/r", theta_thetatheta: "0" }`,
    },
    {
      topic: "Geodesics",
      q: t`In the half-plane model, follow the unit-speed geodesic from \((0, 1)\) heading in the \(u\) direction for time 1. Where does it end?`,
      a: t`It is the unit semicircle about 0: \(u = \tanh t\), \(v = \operatorname{sech} t\). At \(t = 1\): \((0.761594, 0.648054)\).`,
      code: `const g = analytic.metric({ E: "1/v^2", F: 0, G: "1/v^2" }, ["u", "v"]).geodesic({ from: [0, 1], direction: [1, 0], until: 1 }).exact().final;
[g[0], g[1]]`,
      check: near([Math.tanh(1), 1 / Math.cosh(1)], 1e-5),
    },
    {
      topic: "Parallel transport",
      q: t`Parallel-transport a tangent vector once round the circle of polar angle \(\pi/3\) on the unit sphere. By what angle is it rotated?`,
      a: t`The holonomy equals the enclosed area (the cap): \(2\pi(1 - \cos\tfrac\pi3) = \pi\).`,
      code: `const S = analytic.surface(["cos(u)*sin(v)", "sin(u)*sin(v)", "cos(v)"], ["u", "v"]);
S.transport({ u: "2*pi*t", v: "pi/3" }, [0, 1], [1, 0]).angle`,
      check: near(PI, 1e-4),
      note: "The parameter interval must have rational ends, so the circle is written with \\(u = 2\\pi t\\), \\(0 \\le t \\le 1\\). The returned enclosure is wide (it runs from about 3.14146 to 3.14159), so the check allows 1e-4.",
    },
    {
      topic: "Gauss–Bonnet",
      q: t`Check the Gauss–Bonnet theorem on the patch \(0 \le u \le 1\), \(1 \le v \le 2\) of the unit sphere.`,
      a: t`\(\iint K\,dA + \oint\kappa_g\,ds + \sum(\pi - \theta_i) = 2\pi\) for a disc-like region. Here \(\iint K\,dA = \int_0^1\int_1^2\sin v = \cos1 - \cos2\), and the boundary terms make up the rest.`,
      code: `analytic.surface(["cos(u)*sin(v)", "sin(u)*sin(v)", "cos(v)"], ["u", "v"]).gaussBonnet({ u: [0, 1], v: [1, 2] }).agree`,
      expect: "true",
    },
    {
      topic: "Theorema egregium",
      q: t`Compute the Gaussian curvature of the sphere intrinsically from \(E = \sin^2 v\), \(F = 0\), \(G = 1\) (with \(v\) the polar angle and \(u\) the longitude).`,
      a: t`For \(ds^2 = dv^2 + f(v)^2du^2\), \(K = -f''/f = -(-\sin v)/\sin v = 1\): the same as the extrinsic value.`,
      code: `String(analytic.metric({ E: "sin(v)^2", F: 0, G: "1" }, ["u", "v"]).gaussian())`,
      expect: "1",
    },
  ],
};
