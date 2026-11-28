const t = String.raw;
import { near } from "./lib.js";

export default {
  title: "Topology",
  level: "University: upper level",
  short: "Finite topologies, metrics and their balls, connectedness and compactness, winding numbers and degree, fixed points, Euler characteristic, homology of surfaces from cell structures, the classification of surfaces, Cantor sets and fractal dimension.",
  blurb: "Counting the topologies on a three-point set, the taxicab unit ball, connectedness, compactness and the fundamental group (which are proofs), winding numbers and the degree of \(z^3\), the one-dimensional Brouwer fixed point theorem, Euler characteristics of polyhedra and graphs, the first homology of the torus, the projective plane and the Klein bottle from their cell structures, the genus of a surface from its Euler characteristic, and the Cantor set and Sierpinski carpet.",
  exercises: [
    {
      topic: "Finite topologies",
      q: t`How many topologies are there on a three-point set?`,
      a: t`Topologies on a finite set correspond to preorders (reflexive, transitive relations), via \(x \le y\) iff every open set containing \(x\) contains \(y\). On 3 points there are 29.`,
      code: `[geo.countTopologies(3), geo.countTopologies(3, { t0: true })]`,
      expect: "[29, 19]",
      fix: "geo#11",
      note: "<code>countTopologies</code> counts the preorders on 3 points (the open sets of a finite space are the up-sets of its specialisation preorder); 19 of the 29 are T₀. <code>finiteSpace</code> also checks the axioms, closure, bases and continuity directly.",
    },
    {
      topic: "Metrics",
      q: t`Describe the unit ball of the taxicab metric \(d(p, q) = |p_1 - q_1| + |p_2 - q_2|\) in the plane. What is its "\(\pi\)" (half the perimeter of the unit circle, measured in the same metric)?`,
      a: t`The square with vertices \((\pm1, 0)\), \((0, \pm1)\). Each side has taxicab length 2, so the perimeter is 8 and \(\pi_{taxi} = 4\).`,
      code: `const m = geo.metric("taxicab");
[String(m.circle([0, 0], 1)), m.pi]`,
      expect: `["(1, 0),(0, 1),(-1, 0),(0, -1)", 4]`,
    },
    {
      topic: "A bounded metric",
      q: t`Show \(d'(x, y) = \dfrac{|x - y|}{1 + |x - y|}\) is a metric on \(\mathbb R\) giving the same topology.`,
      a: t`\(t \mapsto t/(1 + t)\) is increasing, subadditive and zero only at 0, so the triangle inequality passes from \(|x - y|\) to \(d'\). Small balls of the two metrics nest inside each other, so the open sets agree.`,
      code: `// No proof tool. A spot check of the triangle inequality on rationals:
const d = (x, y) => { const a = x.subtract(y).abs(); return a.divide(a.add(R\`1\`)); };
const xs = ["-3", "-1/2", "0", "2/3", "5"].map((s) => R\`\${s}\`);
xs.every((x) => xs.every((y) => xs.every((z) => !d(x, z).greaterThan(d(x, y).add(d(y, z))))))`,
      expect: "a proof",
      status: "gap",
      note: "Proofs are out of reach; the code only spot-checks the triangle inequality on a few rationals (it holds).",
    },
    {
      topic: "Connectedness and compactness",
      q: t`Is \([0, 1]\) compact? Is \((0, 1)\)? Is \(\mathbb Q\) connected?`,
      a: t`\([0, 1]\) is compact (Heine–Borel); \((0, 1)\) is not (the cover \((1/n, 1)\) has no finite subcover). \(\mathbb Q\) is not connected: \((-\infty, \sqrt2) \cap \mathbb Q\) and \((\sqrt2, \infty) \cap \mathbb Q\) separate it. It is even totally disconnected: between any two distinct rationals \(p < q\) lies an irrational \(s\) (such as \(p + (q - p)/\sqrt2\)), and the same cut at \(s\) puts \(p\) and \(q\) in different pieces, so no connected subset has two points.`,
      code: `"no computation"`,
      expect: "proofs",
      status: "gap",
      note: "These are statements about all open covers and all separations; nothing in RatMath decides them.",
    },
    {
      topic: "Winding numbers",
      q: t`Find the winding number about 0 of the closed polygon \(1 \to i \to -1 \to -i \to 1\), of the same path traversed twice, and of the triangle \(3 \to 3 + i \to 2 + i \to 3\).`,
      a: t`Once round counter-clockwise: 1. Twice: 2. The triangle does not surround 0: 0.`,
      code: `const W = complex.winding;
[W(["1", "i", "-1", "-i", "1"]), W(["1", "i", "-1", "-i", "1", "i", "-1", "-i", "1"]), W(["3", "3+i", "2+i", "3"])]`,
      expect: "[1, 2, 0]",
    },
    {
      topic: "Degree of a map",
      q: t`What is the degree of \(z \mapsto z^3\) on the unit circle (how many times does the image wind round 0)?`,
      a: t`\(e^{i\theta} \mapsto e^{3i\theta}\) winds three times: degree 3, equal to the number of zeros inside (argument principle).`,
      code: `complex.argumentPrinciple("z^3", complex.Contour.circle(0, 1))`,
      expect: "3",
    },
    {
      topic: "Fixed point theorem",
      fix: "analytic#18",
      q: t`Show every continuous \(f: [0, 1] \to [0, 1]\) has a fixed point, and find the fixed point of \(\cos\) on \([0, 1]\).`,
      a: t`\(g(x) = f(x) - x\) has \(g(0) \ge 0 \ge g(1)\), so \(g\) vanishes by the intermediate value theorem. For \(\cos\): \(x \approx 0.7390851\).`,
      code: `analytic.fixedPoint("cos(x)", "1/2").root`,
      check: near(0.7390851332151607, 1e-12),
      status: "partial",
      note: "The certified fixed point of \\(\\cos\\) is found (since the analytic fix the exact start <code>\"1/2\"</code> works). The general statement is a proof by the intermediate value theorem, given in the answer; RatMath does not check proofs, so this counts as partial.",
    },
    {
      topic: "Euler characteristic of polyhedra",
      q: t`Compute \(V - E + F\) for the tetrahedron, cube and icosahedron.`,
      a: t`\(4 - 6 + 4\), \(8 - 12 + 6\), \(12 - 30 + 20\): all 2, the Euler characteristic of the sphere.`,
      code: `["tetrahedron", "cube", "icosahedron"].map((n) => geo.solids[n]().euler)`,
      expect: "[2, 2, 2]",
    },
    {
      topic: "Euler characteristic of a graph",
      q: t`For the Petersen graph as a 1-dimensional complex, find \(\chi\) and the rank of \(H_1\).`,
      a: t`\(\chi = V - E = 10 - 15 = -5\). It is connected, so \(b_0 = 1\) and \(b_1 = 1 - \chi = 6\) independent cycles.`,
      code: `const P = geo.simplicial.fromGraph(discrete.petersen());
[P.eulerCharacteristic, P.betti()[1]]`,
      expect: "[-5, 6]",
      fix: "geo#11",
      note: "The graph as a 1-dimensional simplicial complex; \\(b_1\\) comes from its homology, not from the formula.",
    },
    {
      topic: "Homology of the torus",
      q: t`The torus has a cell structure with one 0-cell, two 1-cells \(a, b\) and one 2-cell attached along \(aba^{-1}b^{-1}\). Find \(H_1\).`,
      a: t`\(\partial_2 = a + b - a - b = 0\) and \(\partial_1 = 0\), so \(H_1 = \mathbb Z^2/0 = \mathbb Z^2\).`,
      code: `String(geo.surface("a b a^-1 b^-1").homology(1))`,
      expect: "Z^2",
      fix: "geo#11",
      note: "<code>surface</code> reads the cell structure from the edge word (one vertex, two edges, one face) and structures' <code>chainComplex</code> computes the homology.",
    },
    {
      topic: "Homology of the projective plane",
      q: t`\(\mathbb{RP}^2\) has one cell in each dimension 0, 1, 2, the 2-cell attached along \(aa\). Find \(H_1\).`,
      a: t`\(\partial_2 = 2a\), \(\partial_1 = 0\): \(H_1 = \mathbb Z/2\).`,
      code: `String(geo.surface("a a").homology(1))`,
      expect: "Z/2",
      fix: "geo#11",
      note: "\\(\\partial_2 = 2a\\) is read from the word <code>a a</code>.",
    },
    {
      topic: "Homology of the Klein bottle",
      q: t`The Klein bottle is one 0-cell, 1-cells \(a, b\), and a 2-cell attached along \(aba^{-1}b\). Find \(H_1\).`,
      a: t`\(\partial_2 = a + b - a + b = 2b\): \(H_1 = \mathbb Z^2/\langle 2b\rangle = \mathbb Z \oplus \mathbb Z/2\).`,
      code: `String(geo.surface("a b a^-1 b").homology(1))`,
      expect: "Z/2 × Z",
      fix: "geo#11",
      note: "From the word: \\(\\partial_2 = a + b - a + b = 2b\\).",
    },
    {
      topic: "Smith normal form and torsion",
      q: t`A cell complex has \(\partial_2 = \begin{pmatrix}2&4\\6&8\end{pmatrix}\) (in bases of 2-cells and 1-cells) and \(\partial_1 = 0\). Find \(H_1\).`,
      a: t`The Smith form of \(\begin{pmatrix}2&4\\6&8\end{pmatrix}\) is \(\operatorname{diag}(2, 4)\) (gcd of entries 2, \(|\det| = 8\)). \(H_1 = \mathbb Z/2 \oplus \mathbb Z/4\).`,
      code: `[structures.smithForm([[2, 4], [6, 8]]).diagonal, String(structures.integerModule([[2, 4], [6, 8]], 2))]`,
      expect: `[[2, 4], "Z/2 × Z/4"]`,
    },
    {
      topic: "Classification of surfaces",
      q: t`A closed orientable surface has a triangulation with 10 vertices, 36 edges and 24 triangles. Check that these counts are possible, and say which surface it is.`,
      a: t`In a closed triangulated surface every triangle has 3 edges and every edge lies on exactly 2 triangles, so \(3F = 2E\): \(72 = 72\). Then \(\chi = 10 - 36 + 24 = -2 = 2 - 2g\): genus 2, the double torus. (This is the f-vector of a minimal genus-2 triangulation.)`,
      code: `const [V, E, F] = [10, 36, 24];
const s = geo.classifySurface({ euler: V - E + F, orientable: true });
[3 * F === 2 * E, s.eulerCharacteristic, s.genus]`,
      expect: "[true, -2, 2]",
      fix: "geo#11",
      note: "The incidence count \\(3F = 2E\\) is checked first (the earlier version of this exercise used 8, 24, 14, for which \\(3F = 42 \\ne 48 = 2E\\): no such triangulation exists). <code>classifySurface</code> then applies the classification theorem: orientable with \\(\\chi = -2\\) is the connected sum of 2 tori.",
    },
    {
      topic: "Genus of a graph",
      q: t`What is the genus of \(K_5\) (the least genus of a surface it embeds in)?`,
      a: t`It is not planar, and it embeds in the torus: genus 1. (\(\lceil (n-3)(n-4)/12 \rceil = 1\).)`,
      code: `const t = discrete.genus(discrete.complete(5));
[discrete.isPlanar(discrete.complete(5)), t.genus, t.proven, discrete.embeddingGenus(discrete.complete(5), t.blocks[0].rotation).faces.length]`,
      expect: "[false, 1, true, 5]",
      fix: "discrete#8",
      note: "<code>genus</code> searches rotation systems: it returns an embedding of \\(K_5\\) with 5 faces, so \\(V - E + F = 5 - 10 + 5 = 0\\) and the surface is a torus; not planar gives the lower bound.",
    },
    {
      topic: "The Cantor set",
      q: t`What is the total length of the \(n\)th stage of the Cantor construction? What is the measure of the Cantor set?`,
      a: t`\(2^n\) intervals of length \(3^{-n}\): \((2/3)^n\), e.g. \(\tfrac8{27}\) at stage 3. The limit is 0, yet the set is uncountable.`,
      code: `[chaos.cantor().measure(3), chaos.cantor().stage(2).length]`,
      expect: "[8/27, 4]",
    },
    {
      topic: "Fractal dimension",
      q: t`Find the similarity dimension of the Sierpinski carpet.`,
      a: t`8 copies at scale \(\tfrac13\): \(\log_3 8 \approx 1.8928\).`,
      code: `const d = chaos.attractors.carpet().similarityDimension();
[d.formula, d.interval[0]]`,
      check: (v) => v[0] === "log(8)/log(3)" && near(Math.log(8) / Math.log(3), 1e-9)(v[1]),
      expectText: "[log(8)/log(3), 1.8927893…]",
    },
    {
      topic: "Fundamental groups",
      q: t`What are the fundamental groups of the circle, the torus and \(\mathbb{RP}^2\)?`,
      a: t`\(\mathbb Z\), \(\mathbb Z^2\), \(\mathbb Z/2\).`,
      code: `[geo.simplicial.sphere(1), geo.surface("a b a^-1 b^-1"), geo.surface("a a")].map((X) => String(X.fundamentalGroup()))`,
      expect: `["⟨e3 | ⟩", "⟨a, b | aba⁻¹b⁻¹⟩", "⟨a | a²⟩"]`,
      fix: "geo#11",
      note: "<code>fundamentalGroup()</code> contracts a spanning tree and reads one relator per face (van Kampen), returning a presentation: free on one generator for the circle, \\(\\mathbb Z^2\\) for the torus, \\(\\mathbb Z/2\\) for \\(\\mathbb{RP}^2\\) (structures confirms the orders and abelianisations).",
    },
    {
      topic: "Stereographic projection",
      q: t`Under stereographic projection from the north pole of the unit sphere, where does the point \((\tfrac35, 0, \tfrac45)\) go?`,
      a: t`\((x, y, z) \mapsto \left(\dfrac{x}{1 - z}, \dfrac{y}{1 - z}\right) = (3, 0)\). The sphere minus a point is homeomorphic to the plane.`,
      code: `String(geo.spoint("3/5", 0, "4/5").stereographic)`,
      expect: "(3, 0)",
    },
    {
      topic: "A triangulated torus",
      q: t`Möbius and Császár's minimal triangulation of the torus has 7 vertices, 21 edges and 14 triangles. Check its Euler characteristic.`,
      a: t`\(7 - 21 + 14 = 0 = 2 - 2\cdot1\), as it must be for a torus. (Every pair of the 7 vertices is an edge: \(\binom72 = 21\).)`,
      code: `const T = geo.simplicial.torus();
[T.fVector, T.eulerCharacteristic, String(T.homology(1)), T.classify().name]`,
      expect: `[[7, 21, 14], 0, "Z^2", "torus"]`,
      fix: "geo#11",
      note: "The triangulation itself is built from its 14 triangles; the f-vector, χ, homology and the surface recognition all come from it.",
    },
  ],
};
