const t = String.raw;

export default {
  title: "Abstract algebra I: groups",
  level: "University: upper level",
  short: "Permutations, cyclic and dihedral groups, Lagrange, conjugacy and the class equation, Sylow, quotients, abelian groups, group actions.",
  blurb: "Orders and parity of permutations, subgroups of cyclic groups, the centre and class equation of dihedral groups, Sylow counts, the classification of finite abelian groups, normal subgroups and simplicity, isomorphism, quotients, groups of units, commutator subgroups, the quaternion group, the first rings (zero divisors, units, inverses, Gaussian integers) and Burnside's counting lemma.",
  exercises: [
    {
      topic: "Element orders in S4",
      q: t`How many elements of each order are there in \(S_4\)?`,
      a: t`Order 1: the identity. Order 2: 6 transpositions and 3 double transpositions, 9 in all. Order 3: \(\binom43\cdot2 = 8\) three-cycles. Order 4: \(3! = 6\) four-cycles. Total \(1 + 9 + 8 + 6 = 24\).`,
      code: `[...structures.symmetric(4).orderStatistics()]`,
      expect: "[[1, 1], [2, 9], [3, 8], [4, 6]]",
    },
    {
      topic: "Order of a permutation",
      q: t`Find the order of \((1\,2\,3)(4\,5)\) in \(S_5\).`,
      a: t`Disjoint cycles of lengths 3 and 2: order \(\operatorname{lcm}(3, 2) = 6\).`,
      code: `const G = structures.symmetric(5);
G.elementOrder(G.element("(1 2 3)(4 5)"))`,
      expect: "6",
    },
    {
      topic: "Parity",
      q: t`Is the 4-cycle \((1\,2\,3\,4)\) even or odd?`,
      a: t`\((1\,2\,3\,4) = (1\,4)(1\,3)(1\,2)\), three transpositions: odd.`,
      code: `const p = structures.fromCycles("(1 2 3 4)", 4);
structures.alternating(4).has(p)`,
      expect: "false",
      status: "partial",
      note: "There is no sign or parity of a single permutation; the code asks whether it lies in \\(A_4\\).",
    },
    {
      topic: "Subgroups of a cyclic group",
      q: t`How many subgroups does \(\mathbb Z_{12}\) have?`,
      a: t`One for each divisor of 12: 1, 2, 3, 4, 6, 12. Six subgroups.`,
      code: `structures.cyclic(12).subgroups().length`,
      expect: "6",
    },
    {
      topic: "Order in Z_n",
      q: t`What is the order of 8 in \(\mathbb Z_{20}\)?`,
      a: t`\(20/\gcd(8, 20) = 20/4 = 5\).`,
      code: `const G = structures.cyclic(20);
G.elementOrder(G.element(8))`,
      expect: "5",
    },
    {
      topic: "Centre and class equation of D4",
      q: t`For the dihedral group \(D_4\) of order 8, find the order of the centre and the class equation.`,
      a: t`\(Z(D_4) = \{e, r^2\}\), order 2. The other classes are \(\{r, r^3\}\), \(\{s, sr^2\}\), \(\{sr, sr^3\}\): \(8 = 2 + 2 + 2 + 2\) (centre first), i.e. \(1 + 1 + 2 + 2 + 2\).`,
      code: `const D = structures.dihedral(4);
[D.order, D.centre().order, D.classEquation()]`,
      expect: "[8, 2, 8 = 2 + 2 + 2 + 2]",
    },
    {
      topic: "Conjugacy classes of S3",
      q: t`Write the class equation of \(S_3\).`,
      a: t`Identity, three transpositions, two 3-cycles: \(6 = 1 + 2 + 3\).`,
      code: `structures.symmetric(3).classEquation()`,
      expect: "6 = 1 + 2 + 3",
    },
    {
      topic: "Sylow theorems",
      q: t`How many Sylow 3-subgroups and Sylow 2-subgroups does \(S_4\) have?`,
      a: t`\(n_3 \equiv 1 \pmod 3\), \(n_3 \mid 8\): \(n_3 \in \{1, 4\}\); the eight 3-cycles make four subgroups of order 3, so \(n_3 = 4\). \(n_2\) is odd and divides 3; the Sylow 2-subgroups are the three copies of \(D_4\): \(n_2 = 3\).`,
      code: `const G = structures.symmetric(4);
[G.sylowCount(3), G.sylowCount(2)]`,
      expect: "[4, 3]",
    },
    {
      topic: "Finite abelian groups",
      q: t`List the abelian groups of order 72 up to isomorphism.`,
      a: t`\(72 = 2^3\cdot3^2\): three partitions of 3 times two partitions of 2, six groups: \(\mathbb Z_{72}\), \(\mathbb Z_3\times\mathbb Z_{24}\), \(\mathbb Z_2\times\mathbb Z_{36}\), \(\mathbb Z_6\times\mathbb Z_{12}\), \(\mathbb Z_2\times\mathbb Z_2\times\mathbb Z_{18}\), \(\mathbb Z_2\times\mathbb Z_6\times\mathbb Z_6\).`,
      code: `structures.abelianGroups(72).map(String)`,
      expect: `["Z/72", "Z/3 × Z/24", "Z/2 × Z/36", "Z/6 × Z/12", "Z/2 × Z/2 × Z/18", "Z/2 × Z/6 × Z/6"]`,
    },
    {
      topic: "A4",
      q: t`Is \(A_4\) simple? What are the orders of its normal subgroups, and does it have a subgroup of order 6?`,
      a: t`No: the Klein four-group \(V\) is normal. Normal subgroups have orders 1, 4, 12. There is no subgroup of order 6 (the converse of Lagrange fails): subgroup orders are 1, 2, 3, 4, 12.`,
      code: `const A = structures.alternating(4);
[A.isSimple, A.normalSubgroups().map((h) => h.order), [...new Set(A.subgroups().map((h) => h.order))].sort((a, b) => a - b)]`,
      expect: "[false, [1, 4, 12], [1, 2, 3, 4, 12]]",
    },
    {
      topic: "Isomorphism",
      q: t`Is \(\mathbb Z_6 \cong \mathbb Z_2\times\mathbb Z_3\)? Is \(\mathbb Z_2\times\mathbb Z_2 \cong \mathbb Z_4\)?`,
      a: t`Yes, since \(\gcd(2, 3) = 1\) and \((1, 1)\) has order 6. No: \(\mathbb Z_2\times\mathbb Z_2\) has no element of order 4.`,
      code: `const S = structures;
[S.isIsomorphic(S.cyclic(6), S.directProduct(S.cyclic(2), S.cyclic(3))), S.isIsomorphic(S.kleinFour(), S.cyclic(4))]`,
      expect: "[true, false]",
    },
    {
      topic: "Quotient groups",
      q: t`Describe \(\mathbb Z_{12}/\langle 4\rangle\).`,
      a: t`\(\langle4\rangle = \{0, 4, 8\}\) has order 3, so the quotient has order 4, generated by \(1 + \langle4\rangle\): it is \(\mathbb Z_4\).`,
      code: `const G = structures.cyclic(12);
const Q = G.quotient(G.subgroup([G.element(4)]));
[Q.order, Q.isCyclic]`,
      expect: "[4, true]",
    },
    {
      topic: "Groups of units",
      q: t`Describe the group of units \(U(15)\).`,
      a: t`\(U(15) \cong U(3)\times U(5) \cong \mathbb Z_2\times\mathbb Z_4\), of order 8, not cyclic.`,
      code: `structures.Zn(15).unitGroup().text`,
      expect: "C2 × C4",
    },
    {
      topic: "Lagrange's theorem",
      q: t`What are \(|A_5|\) and the index \([S_5 : A_5]\)?`,
      a: t`\(|A_5| = 120/2 = 60\), index 2.`,
      code: `[structures.alternating(5).order, structures.symmetric(5).index(structures.alternating(5))]`,
      expect: "[60, 2]",
    },
    {
      topic: "Commutator subgroup",
      q: t`Find the commutator subgroup of \(S_3\).`,
      a: t`Commutators are even, and \([(1\,2), (1\,3)] = (1\,2\,3)^{\pm1}\), so \(S_3' = A_3\), of order 3.`,
      code: `structures.symmetric(3).derivedSubgroup().order`,
      expect: "3",
    },
    {
      topic: "Quaternion group",
      q: t`How many elements of order 4 are in the quaternion group \(Q_8\)?`,
      a: t`\(\pm i, \pm j, \pm k\): six. (\(-1\) has order 2 and \(1\) order 1.)`,
      code: `[...structures.quaternion().orderStatistics()]`,
      expect: "[[1, 1], [2, 1], [4, 6]]",
    },
    {
      topic: "Zero divisors and units",
      q: t`List the zero divisors and the units of \(\mathbb Z_6\).`,
      a: t`Zero divisors: 2, 3, 4 (\(2\cdot3 = 0\), \(4\cdot3 = 0\)), plus 0 if counted. Units: 1, 5.`,
      code: `const R = structures.Zn(6);
[R.elements().filter((x) => R.isZeroDivisor(x)).map(String), R.units().map(String)]`,
      expect: `[["0", "2", "3", "4"], ["1", "5"]]`,
    },
    {
      topic: "Inverses in a field",
      q: t`Is \(\mathbb Z_7\) a field? Find \(3^{-1}\) in it.`,
      a: t`Yes, 7 is prime. \(3\cdot5 = 15 \equiv 1\), so \(3^{-1} = 5\).`,
      code: `const R = structures.Zn(7);
[R.isField, String(R.inverse(3))]`,
      expect: `[true, "5"]`,
    },
    {
      topic: "Gaussian integers",
      q: t`Factor 5 into primes in \(\mathbb Z[i]\).`,
      a: t`\(5 = (2 + i)(2 - i)\), both of norm 5 and hence prime.`,
      code: `const f = structures.gaussianIntegers().factor(5);
[String(f.unit), f.factors.map((x) => \`\${x.prime}^\${x.exponent}\`)]`,
      expect: `["1", ["2 − i^1", "2 + i^1"]]`,
    },
    {
      topic: "Burnside's lemma",
      q: t`How many necklaces of 4 beads in 2 colours are there, up to rotation?`,
      a: t`Fixed colourings: identity 16, rotation by 2 fixes 4, rotations by 1 and 3 fix 2 each: \((16 + 2 + 4 + 2)/4 = 6\).`,
      code: `const C = structures.cyclic(4);
const strings = Array.from({ length: 16 }, (_, m) => m.toString(2).padStart(4, "0"));
structures.burnside(structures.action(C, strings, (g, s) => s.slice(Number(g)) + s.slice(0, Number(g))))`,
      expect: "(1/4)·(16 + 4 + 2 + 2) = 6",
    },
  ],
};
