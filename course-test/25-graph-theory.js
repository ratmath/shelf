const t = String.raw;

export default {
  title: "Graph theory",
  level: "University: upper level",
  short: "Degrees, connectivity, trees and spanning trees, Euler and Hamilton, planarity, colouring and chromatic polynomials, matchings and flows, spectra, extremal graphs.",
  blurb: "The handshake lemma, bridges and cut vertices, Prüfer codes and Cayley's formula, the matrix-tree theorem, Euler tours and Hamilton cycles, the Petersen graph, Kuratowski's theorem and Euler's formula, chromatic numbers and polynomials, maximum matchings, max-flow min-cut, isomorphism, walks and the adjacency matrix, spectra, and Turán's theorem.",
  exercises: [
    {
      topic: "Handshake lemma",
      q: t`A graph has degree sequence \(3, 3, 2, 2, 2\). How many edges does it have? Build one and check.`,
      a: t`\(\sum \deg = 12 = 2|E|\), so 6 edges. For example a 5-cycle plus one chord.`,
      code: `const g = discrete.graph([[1, 2], [2, 3], [3, 4], [4, 5], [5, 1], [1, 3]]);
[g.size, g.degreeSequence()]`,
      expect: "[6, [3, 3, 2, 2, 2]]",
    },
    {
      topic: "Bridges and cut vertices",
      q: t`Two triangles \(\{1,2,3\}\) and \(\{4,5,6\}\) are joined by the edge \(3\text{–}4\). Find the bridges and cut vertices.`,
      a: t`Only \(3\text{–}4\) lies on no cycle: it is the one bridge. Removing 3 or 4 disconnects the graph: the cut vertices are 3 and 4.`,
      code: `const g = discrete.graph([[1, 2], [2, 3], [3, 1], [3, 4], [4, 5], [5, 6], [6, 4]]);
[discrete.bridges(g).map((e) => [e.from, e.to]), discrete.cutVertices(g)]`,
      expect: "[[[3, 4]], [3, 4]]",
    },
    {
      topic: "Prüfer codes",
      q: t`Find the Prüfer code of the tree with edges \(1\text{–}4, 2\text{–}4, 3\text{–}4, 4\text{–}5, 5\text{–}6\).`,
      a: t`Remove the smallest leaf each time and record its neighbour: 1 (4), 2 (4), 3 (4), then 4 is a leaf (5). Code \((4, 4, 4, 5)\).`,
      code: `discrete.prufer(discrete.graph([[1, 4], [2, 4], [3, 4], [4, 5], [5, 6]]))`,
      expect: "[4, 4, 4, 5]",
    },
    {
      topic: "Counting spanning trees",
      q: t`How many spanning trees do \(K_4\) and \(C_5\) have?`,
      a: t`Cayley: \(4^{4-2} = 16\). A cycle loses any one of its 5 edges: 5.`,
      code: `[discrete.spanningTreeCount(discrete.complete(4)), discrete.spanningTreeCount(discrete.cycleGraph(5))]`,
      expect: "[16, 5]",
    },
    {
      topic: "Euler tours",
      q: t`Does \(K_5\) have a closed Euler tour? Does \(K_4\)?`,
      a: t`\(K_5\) is connected and every degree is 4 (even): yes, a tour of all 10 edges (11 vertices listed). In \(K_4\) every degree is 3 (odd): no.`,
      code: `const a = discrete.eulerTour(discrete.complete(5), { closed: true });
const b = discrete.eulerTour(discrete.complete(4), { closed: true });
[a.exists, a.vertices.length, b.exists]`,
      expect: "[true, 11, false]",
    },
    {
      topic: "Hamilton cycles",
      q: t`Is the cube graph \(Q_3\) Hamiltonian? Give a cycle.`,
      a: t`Yes: the Gray code \(000, 001, 011, 010, 110, 111, 101, 100\) and back.`,
      code: `const h = discrete.hamiltonCycle(discrete.hypercube(3));
[h.exists, h.cycle.length]`,
      expect: "[true, 9]",
    },
    {
      topic: "The Petersen graph",
      q: t`For the Petersen graph give the order, size, girth, diameter, chromatic number, independence number, and whether it is Hamiltonian.`,
      a: t`10 vertices, 15 edges, girth 5, diameter 2, \(\chi = 3\), \(\alpha = 4\), and it has no Hamilton cycle.`,
      code: `const P = discrete.petersen();
[P.order, P.size, discrete.girth(P).girth, discrete.diameter(P), discrete.chromaticNumber(P).number, discrete.maximumIndependentSet(P).length, discrete.hamiltonCycle(P).exists]`,
      expect: "[10, 15, 5, 2, 3, 4, false]",
    },
    {
      topic: "Planarity",
      q: t`Which of \(K_4\), \(K_5\), \(K_{3,3}\) are planar?`,
      a: t`\(K_4\) is planar. \(K_5\) has \(10 > 3\cdot5 - 6 = 9\) edges, and \(K_{3,3}\) (triangle-free) has \(9 > 2\cdot6 - 4 = 8\): neither is planar.`,
      code: `const D = discrete;
[D.isPlanar(D.complete(4)), D.isPlanar(D.complete(5)), D.isPlanar(D.completeBipartite(3, 3))]`,
      expect: "[true, false, false]",
    },
    {
      topic: "Kuratowski's theorem",
      q: t`Show the Petersen graph is not planar by finding a Kuratowski subgraph.`,
      a: t`It contains a subdivision of \(K_{3,3}\) (it also has \(K_5\) as a minor, but no subdivided \(K_5\), since its degrees are 3).`,
      code: `const r = discrete.planarity(discrete.petersen());
[r.planar, r.kuratowski.kind]`,
      expect: `[false, "K3,3"]`,
    },
    {
      topic: "Euler's formula",
      q: t`The cube graph is planar with 8 vertices and 12 edges. How many faces does a plane drawing have?`,
      a: t`\(V - E + F = 2\): \(F = 2 - 8 + 12 = 6\).`,
      code: `const g = discrete.platonic("cube");
[discrete.isPlanar(g), 2 - g.order + g.size]`,
      expect: "[true, 6]",
      status: "partial",
      note: "Planarity is tested; the face count comes from Euler's formula by hand (no embedding or face list is returned).",
    },
    {
      topic: "Chromatic number",
      q: t`Find the chromatic number of the wheel with 5 spokes (a hub joined to every vertex of \(C_5\)).`,
      a: t`The odd rim needs 3 colours and the hub, adjacent to all of them, needs a fourth: \(\chi = 4\).`,
      code: `discrete.chromaticNumber(discrete.wheel(5)).number`,
      expect: "4",
    },
    {
      topic: "Chromatic polynomial",
      q: t`Find the chromatic polynomial of \(C_4\).`,
      a: t`\(P(C_n, k) = (k - 1)^n + (-1)^n(k - 1)\): \((k-1)^4 + (k - 1) = k^4 - 4k^3 + 6k^2 - 3k\).`,
      code: `String(discrete.chromaticPolynomial(discrete.cycleGraph(4)))`,
      expect: "k^4 − 4k^3 + 6k^2 − 3k",
    },
    {
      topic: "Matchings",
      q: t`What is the size of a maximum matching in \(K_{3,3}\)? Is it perfect?`,
      a: t`Hall's condition holds (every set of \(k\) left vertices has 3 neighbours), so there is a perfect matching of size 3.`,
      code: `const m = discrete.maximumMatching(discrete.completeBipartite(3, 3));
[m.size, m.perfect]`,
      expect: "[3, true]",
    },
    {
      topic: "Max flow, min cut",
      q: t`In the network \(s\to a\) (3), \(s\to b\) (2), \(a\to b\) (1), \(a\to t\) (2), \(b\to t\) (3), find the maximum flow from \(s\) to \(t\).`,
      a: t`The cut \(\{s\}\) has capacity \(3 + 2 = 5\). Flow: \(s\!\to\!a\!\to\!t\) 2, \(s\!\to\!a\!\to\!b\!\to\!t\) 1, \(s\!\to\!b\!\to\!t\) 2: total 5. Max flow \(=\) min cut \(= 5\).`,
      code: `const g = discrete.digraph([["s", "a", 3], ["s", "b", 2], ["a", "b", 1], ["a", "t", 2], ["b", "t", 3]]);
discrete.maxFlow(g, "s", "t").value`,
      expect: "5",
    },
    {
      topic: "Isomorphism",
      q: t`\(C_6\) and two disjoint triangles are both 2-regular on 6 vertices. Are they isomorphic?`,
      a: t`No: \(C_6\) is connected and the triangles are not (also, one has girth 6 and the other 3).`,
      code: `discrete.isIsomorphic(discrete.cycleGraph(6), discrete.disjointUnion(discrete.cycleGraph(3), discrete.cycleGraph(3)))`,
      expect: "false",
    },
    {
      topic: "Counting walks",
      q: t`How many closed walks of length 3 start and end at a given vertex of \(K_4\)? How many walks of length 3 join two different vertices?`,
      a: t`With \(A = J - I\) and \(J^2 = 4J\): \(A^3 = J^3 - 3J^2 + 3J - I = 16J - 12J + 3J - I = 7J - I\). So \((A^3)_{vv} = 6\) (the \(3\cdot2\) ordered triangles through \(v\)) and \((A^3)_{uv} = 7\).`,
      code: `const W = discrete.walks(discrete.complete(4), 3).matrix;
[W[0][0], W[0][1]]`,
      expect: "[6, 7]",
    },
    {
      topic: "Spectrum",
      q: t`Find the eigenvalues of the adjacency matrix of \(K_4\).`,
      a: t`\(A = J - I\); \(J\) has eigenvalues 4, 0, 0, 0, so \(A\) has 3 and \(-1\) (three times).`,
      code: `discrete.spectrum(discrete.complete(4)).eigenvalues.map((e) => [e.text, e.multiplicity])`,
      expect: `[["−1", 3], ["3", 1]]`,
    },
    {
      topic: "Turán's theorem",
      q: t`What is the largest number of edges in a triangle-free graph on 6 vertices?`,
      a: t`Mantel/Turán: \(\lfloor 6^2/4\rfloor = 9\), attained by \(K_{3,3}\).`,
      code: `discrete.turan(6, 2).size`,
      expect: "9",
    },
    {
      topic: "Cliques and independence",
      q: t`Find the clique number of the Petersen graph and of its complement.`,
      a: t`Petersen has girth 5, so it has no triangle: \(\omega = 2\). A clique in the complement is an independent set in \(P\), so \(\omega(\bar P) = \alpha(P) = 4\).`,
      code: `const P = discrete.petersen();
[discrete.maximumClique(P).length, discrete.maximumClique(P.complement()).length]`,
      expect: "[2, 4]",
    },
    {
      topic: "Bipartite graphs",
      q: t`Is the cube graph \(Q_3\) bipartite? Is the Petersen graph?`,
      a: t`\(Q_3\): yes, split by the parity of the number of 1s. Petersen: no, it has 5-cycles.`,
      code: `[discrete.isBipartite(discrete.hypercube(3)), discrete.isBipartite(discrete.petersen())]`,
      expect: "[true, false]",
    },
  ],
};
