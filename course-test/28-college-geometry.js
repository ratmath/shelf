const t = String.raw;
import { near } from "./lib.js";

export default {
  title: "College geometry",
  level: "University: upper level",
  short: "Triangle centres and the Euler line, the nine-point circle, inversion, cross ratio and harmonic conjugates, conics through five points, isometries, Pick's theorem, spherical and hyperbolic triangles, finite planes, polyhedra, taxicab geometry.",
  blurb: "Circumcentre, incentre, orthocentre and centroid of a right triangle, the Euler line and the 2 : 1 ratio, the nine-point circle, inversion in a circle, the cross ratio and harmonic conjugates, the conic through five points, composing reflections, Pick's theorem, interior angles of regular polygons, a spherical octant and its excess, great-circle distance, hyperbolic distance and the defect of hyperbolic and ideal triangles, the Fano plane and the projective plane of order 3, Euler's formula for the icosahedron, and the taxicab metric.",
  exercises: [
    {
      topic: "Triangle centres",
      q: t`For the triangle \(A(0,0)\), \(B(4,0)\), \(C(0,3)\), find the circumcentre and circumradius, the incentre and inradius, the orthocentre and the centroid.`,
      a: t`Right angle at \(A\): the circumcentre is the midpoint of the hypotenuse, \((2, \tfrac32)\), radius \(\tfrac52\). Inradius \(r = \tfrac{3 + 4 - 5}{2} = 1\), incentre \((1, 1)\). The orthocentre is the right-angle vertex \((0, 0)\). Centroid \((\tfrac43, 1)\).`,
      code: `const T = geo.triangle([0, 0], [4, 0], [0, 3]);
[T.circumcenter, T.circumradius, T.incenter, T.inradius, T.orthocenter, T.centroid].map(String)`,
      expect: `["(2, 3/2)", "5/2", "(1, 1)", "1", "(0, 0)", "(4/3, 1)"]`,
    },
    {
      topic: "The Euler line",
      q: t`For the same triangle, show the circumcentre \(O\), centroid \(G\) and orthocentre \(H\) are collinear with \(HG = 2\,GO\), and find the line.`,
      a: t`\(H = (0,0)\), \(G = (\tfrac43, 1)\), \(O = (2, \tfrac32)\) all lie on \(3x - 4y = 0\). \(HG = \tfrac53\), \(GO = \tfrac56\).`,
      code: `const T = geo.triangle([0, 0], [4, 0], [0, 3]);
[geo.collinear(T.circumcenter, T.centroid, T.orthocenter), geo.distance(T.orthocenter, T.centroid), geo.distance(T.centroid, T.circumcenter), String(T.eulerLine)]`,
      expect: `[true, 5/3, 5/6, "3·x - 4·y = 0"]`,
    },
    {
      topic: "Nine-point circle",
      q: t`Find the centre and radius of the nine-point circle of the same triangle.`,
      a: t`Its centre is the midpoint of \(OH\), \((1, \tfrac34)\), and its radius is half the circumradius, \(\tfrac54\).`,
      code: `String(geo.triangle([0, 0], [4, 0], [0, 3]).ninePointCircle)`,
      expect: "circle, centre (1, 3/4), radius 5/4",
    },
    {
      topic: "Inversion",
      q: t`Find the images of \((2, 0)\) and \((1, 1)\) under inversion in the unit circle.`,
      a: t`\(P \mapsto P/|P|^2\): \((\tfrac12, 0)\) and \((\tfrac12, \tfrac12)\).`,
      code: `const inv = geo.inversion(geo.circle([0, 0], [1, 0]));
[inv.apply(geo.point(2, 0)), inv.apply(geo.point(1, 1))].map(String)`,
      expect: `["(1/2, 0)", "(1/2, 1/2)"]`,
    },
    {
      topic: "Cross ratio",
      q: t`Find the cross ratio \((A, B; C, D) = \dfrac{AC\cdot BD}{BC\cdot AD}\) of the points 0, 1, 2, 3 on a line.`,
      a: t`\(\dfrac{2\cdot2}{1\cdot3} = \dfrac43\).`,
      code: `const p = (x) => geo.point(x, 0);
geo.crossRatio(p(0), p(1), p(2), p(3))`,
      expect: "4/3",
    },
    {
      topic: "Harmonic conjugates",
      q: t`On a line, \(A = 0\), \(B = 3\), \(C = 1\). Find the harmonic conjugate \(D\) of \(C\) with respect to \(A, B\).`,
      a: t`\(\dfrac{CA}{CB} = -\dfrac{DA}{DB}\): \(\dfrac{1}{-2} = -\dfrac{D}{D - 3}\), so \(D - 3 = 2D\), \(D = -3\).`,
      code: `String(geo.harmonicConjugate(geo.point(0, 0), geo.point(3, 0), geo.point(1, 0)))`,
      expect: "[-3 : 0 : 1]",
      note: "The answer is in homogeneous coordinates \\([x : y : 1]\\).",
    },
    {
      topic: "Conic through five points",
      q: t`Find the conic through \((\pm1, 0)\), \((0, \pm2)\) and \((\tfrac35, \tfrac85)\), and classify it.`,
      a: t`Symmetry suggests \(x^2 + \tfrac{y^2}{4} = 1\); \((\tfrac35, \tfrac85)\): \(\tfrac9{25} + \tfrac{16}{25} = 1\). An ellipse.`,
      code: `const c = geo.conicThrough([geo.point(1, 0), geo.point(-1, 0), geo.point(0, 2), geo.point(0, -2), geo.point("3/5", "8/5")]);
[String(c), c.classify()]`,
      expect: `["−x² − 1/4y² + 1 = 0", "ellipse"]`,
    },
    {
      topic: "Composing reflections",
      q: t`Reflect in the line \(y = x\), then in the \(x\)-axis. What single isometry is this?`,
      a: t`\((x, y) \mapsto (y, x) \mapsto (y, -x)\): rotation about the origin by \(-90^\circ\), twice the angle between the mirrors.`,
      code: `const r = (p, q) => geo.reflection(geo.line(geo.point(...p), geo.point(...q)));
const T = r([0, 0], [1, 0]).compose(r([0, 0], [1, 1]));   // x-axis after y = x
const c = T.classify();
[c.kind, String(c.center), String(c.degrees)]`,
      expect: `["rotation", "(0, 0)", "-90"]`,
    },
    {
      topic: "Pick's theorem",
      q: t`The rectangle with vertices \((0,0)\), \((4,0)\), \((4,3)\), \((0,3)\) has how many interior lattice points? Check Pick's theorem.`,
      a: t`Boundary points \(B = 2(4 + 3) = 14\), interior \(I = 3\cdot2 = 6\). \(I + \tfrac B2 - 1 = 6 + 7 - 1 = 12\), the area.`,
      code: `const p = geo.pick([[0, 0], [4, 0], [4, 3], [0, 3]]);
[p.interior, p.boundary, p.area, p.holds]`,
      expect: "[6, 14, 12, true]",
    },
    {
      topic: "Regular polygons",
      q: t`Find the interior angle of a regular 12-gon, as a fraction of a full turn and in degrees.`,
      a: t`\(\dfrac{(12 - 2)\cdot180^\circ}{12} = 150^\circ = \tfrac{5}{12}\) of a turn.`,
      code: `const a = geo.polygonAngle(12);
[a, a.multiply(R\`360\`)]`,
      expect: "[5/12, 150]",
    },
    {
      topic: "Spherical triangles",
      q: t`On the unit sphere, take the north pole and the equator points at longitudes 0° and 90°. Find the angle sum, excess and area of the triangle.`,
      a: t`Three right angles: sum \(\tfrac{3\pi}2\), excess \(\tfrac\pi2\), area = excess \(= \tfrac\pi2\), one eighth of the sphere's \(4\pi\).`,
      code: `const T = geo.striangle(geo.northPole(), geo.latLon(0, 0), geo.latLon(0, "1/4"));
[T.angleSum, T.excess, T.area, T.fractionOfSphere].map(String)`,
      expect: `["3π/2", "π/2", "π/2", "1/8"]`,
      note: "<code>latLon</code> takes fractions of a full turn, not degrees: <code>latLon(0, 90)</code> is 90 whole turns, the same point as <code>latLon(0, 0)</code>.",
    },
    {
      topic: "Great-circle distance",
      q: t`On the unit sphere, how far apart are the points at latitude 0°, longitudes 0° and 90°?`,
      a: t`The central angle is \(90^\circ\): distance \(\tfrac\pi2\).`,
      code: `String(geo.latLon(0, 0).distanceTo(geo.latLon(0, "1/4")))`,
      expect: "π/2",
    },
    {
      topic: "Hyperbolic distance",
      q: t`In the Poincaré disc, find the distance from the centre to the point \((\tfrac12, 0)\).`,
      a: t`\(d = 2\operatorname{artanh}\tfrac12 = \ln\dfrac{1 + 1/2}{1 - 1/2} = \ln 3 \approx 1.0986\).`,
      code: `String(geo.horigin().distanceTo(geo.hpoint("1/2", 0)))`,
      expect: "ln(3)",
    },
    {
      topic: "Hyperbolic triangles",
      q: t`In the Poincaré disc, find the angle sum and area of the triangle with vertices \(0\), \((\tfrac12, 0)\), \((0, \tfrac12)\).`,
      a: t`Sides \(\cosh = \tfrac53, \tfrac53\) (from 0) and \(\cosh = 1 + \dfrac{2\cdot\frac12}{(3/4)^2} = \tfrac{25}9\). The angle at 0 is \(\tfrac\pi2\); by the hyperbolic law of cosines the other two are \(\arccos 0.857493 \approx 0.540421\) each. Sum \(\approx 2.651635\), area = defect \(\approx 0.489957\).`,
      code: `const T = geo.htriangle(geo.horigin(), geo.hpoint("1/2", 0), geo.hpoint(0, "1/2"));
[T.angleSum, T.defect]`,
      check: (v) => near([2.6516353273, 0.4899573262], 1e-9)(v.map((x) => Number(String(x).replace("…", "")))),
      expectText: "[2.6516353…, 0.4899573…]",
    },
    {
      topic: "Ideal triangles",
      q: t`What is the area of a hyperbolic triangle whose three vertices are on the boundary circle?`,
      a: t`All three angles are 0, so the area is the defect \(\pi - 0 = \pi\).`,
      code: `const T = geo.htriangle(geo.ideal(1, 0), geo.ideal(-1, 0), geo.ideal(0, 1));
[T.angleSum, T.area].map(String)`,
      expect: `["0", "π"]`,
    },
    {
      topic: "Finite projective planes",
      q: t`The Fano plane is the projective plane of order 2. How many lines does it have? How many points has the projective plane of order 3?`,
      a: t`Order \(n\) gives \(n^2 + n + 1\) points and lines: 7 for \(n = 2\), 13 for \(n = 3\).`,
      code: `const F = geo.fano();
[F.order, F.lines.length, F.isProjectivePlane(), geo.projectivePlane(3).lines.length]`,
      expect: "[2, 7, true, 13]",
    },
    {
      topic: "Euler's formula for polyhedra",
      q: t`Check Euler's formula for the icosahedron.`,
      a: t`20 triangular faces, \(E = 20\cdot3/2 = 30\), five faces at each vertex so \(V = 20\cdot3/5 = 12\). \(12 - 30 + 20 = 2\).`,
      code: `const P = geo.solids.icosahedron();
[P.V, P.E, P.F, P.euler]`,
      expect: "[12, 30, 20, 2]",
    },
    {
      topic: "Taxicab geometry",
      q: t`Find the taxicab and Euclidean distances between \((1, 2)\) and \((4, 6)\).`,
      a: t`Taxicab: \(|4 - 1| + |6 - 2| = 7\). Euclidean: \(\sqrt{9 + 16} = 5\).`,
      code: `[geo.metric("taxicab").distance([1, 2], [4, 6]), geo.distance(geo.point(1, 2), geo.point(4, 6))]`,
      expect: "[7, 5]",
    },
    {
      topic: "Euclidean theorem proving",
      q: t`Prove that the nine-point circle passes through the midpoints of the sides, the feet of the altitudes, and the midpoints from the orthocentre to the vertices, for every triangle.`,
      a: t`Classical proof: the midpoints and the midpoints of \(AH, BH, CH\) form two rectangles with a common diagonal set, all inscribed in the circle on \(N\), the midpoint of \(OH\); the feet see these diameters at right angles.`,
      code: `const p = geo.proofs.ninePointCircle;
const r = typeof p === "function" ? p() : p;
[r.proved ?? r.holds ?? r.ok, String(r).slice(0, 40)]`,
      check: (v) => v[0] === true,
      expectText: "[true, …] (a proof for all triangles)",
    },
    {
      topic: "Sides and angles",
      q: t`For the triangle \(A(0,0)\), \(B(4,0)\), \(C(0,3)\), find the side lengths and the angle at \(B\) in degrees.`,
      a: t`\(AB = 4\), \(AC = 3\), \(BC = 5\). \(\cos B = \tfrac45\), \(B = \arccos\tfrac45 \approx 36.8699^\circ\).`,
      code: `const T = geo.triangle([0, 0], [4, 0], [0, 3]);
[Object.values(T.sides).map(String), String(T.cosines.B), T.degrees.B]`,
      check: (v) => JSON.stringify(v[0].slice().sort()) === JSON.stringify(["3", "4", "5"]) && v[1] === "4/5" && Math.abs(v[2] - 36.86989765) < 1e-6,
      expectText: "sides 3, 4, 5; cos B = 4/5; B ≈ 36.8699°",
    },
  ],
};
