const t = String.raw;

export default {
  title: "Combinatorics",
  level: "University: upper level",
  short: "Binomial and multinomial counts, stars and bars, inclusion–exclusion, derangements and surjections, Stirling, Bell, Catalan and partition numbers, recurrences and generating functions, Pólya counting, designs.",
  blurb: "Arrangements of MISSISSIPPI, multisets, inclusion–exclusion on divisibility, derangements, surjections, Stirling numbers of both kinds, Bell, Eulerian, Catalan and partition numbers, compositions, Dyck words, Vandermonde's identity, linear recurrences solved in closed form, making change with a generating function, labelled trees, Burnside and Pólya counting of coloured squares, and the Fano plane as a Steiner triple system.",
  exercises: [
    {
      topic: "Multinomial coefficients",
      q: t`How many distinct arrangements of the letters of MISSISSIPPI are there?`,
      a: t`11 letters: M once, I four times, S four times, P twice. \(\dfrac{11!}{1!\,4!\,4!\,2!} = 34650\).`,
      code: `discrete.multinomial(4, 4, 2, 1)`,
      expect: "34650",
    },
    {
      topic: "Stars and bars",
      q: t`How many solutions in non-negative integers does \(x_1 + x_2 + x_3 + x_4 = 10\) have?`,
      a: t`\(\binom{10 + 3}{3} = 286\).`,
      code: `discrete.multichoose(4, 10)`,
      expect: "286",
    },
    {
      topic: "Inclusion–exclusion",
      q: t`How many integers from 1 to 100 are divisible by 2, 3 or 5?`,
      a: t`\(50 + 33 + 20 - 16 - 10 - 6 + 3 = 74\).`,
      code: `const by = (d) => Array.from({ length: 100 }, (_, i) => i + 1).filter((n) => n % d === 0);
discrete.inclusionExclusion([by(2), by(3), by(5)]).union`,
      expect: "74",
    },
    {
      topic: "Derangements",
      q: t`In how many ways can 5 letters go into 5 addressed envelopes with none in the right one?`,
      a: t`\(D_5 = 5!\left(1 - 1 + \tfrac12 - \tfrac16 + \tfrac1{24} - \tfrac1{120}\right) = 44\).`,
      code: `discrete.derangementCount(5)`,
      expect: "44",
    },
    {
      topic: "Surjections",
      q: t`How many functions from a 5-set onto a 3-set are there?`,
      a: t`\(3^5 - 3\cdot2^5 + 3\cdot1^5 = 243 - 96 + 3 = 150\) (\(= 3!\,S(5, 3)\)).`,
      code: `discrete.surjections(5, 3)`,
      expect: "150",
    },
    {
      topic: "Stirling and Bell numbers",
      q: t`Find \(S(5, 2)\) and the Bell number \(B_5\).`,
      a: t`\(S(5, 2) = 2^4 - 1 = 15\). \(B_5 = 1 + 15 + 25 + 10 + 1 = 52\).`,
      code: `[discrete.stirling2(5, 2), discrete.bell(5)]`,
      expect: "[15, 52]",
    },
    {
      topic: "Stirling numbers of the first kind",
      q: t`How many permutations of 5 elements have exactly 2 cycles?`,
      a: t`\(c(5, 2) = 50\): from \(x(x+1)(x+2)(x+3)(x+4) = x^5 + 10x^4 + 35x^3 + 50x^2 + 24x\).`,
      code: `discrete.stirling1(5, 2)`,
      expect: "50",
    },
    {
      topic: "Eulerian numbers",
      q: t`How many permutations of \(\{1, 2, 3, 4\}\) have exactly one descent?`,
      a: t`\(A(4, 1) = 2^4 - 5 = 11\).`,
      code: `discrete.eulerian(4, 1)`,
      expect: "11",
    },
    {
      topic: "Integer partitions",
      q: t`Find \(p(10)\), the number of partitions of 10.`,
      a: t`\(p(10) = 42\) (by the pentagonal-number recurrence: \(p(9) + p(8) - p(5) - p(3) = 30 + 22 - 7 - 3\)).`,
      code: `discrete.partitionCount(10)`,
      expect: "42",
    },
    {
      topic: "Compositions",
      q: t`How many ways can 6 be written as an ordered sum of 3 positive integers?`,
      a: t`\(\binom{5}{2} = 10\).`,
      code: `discrete.compositionCount(6, 3)`,
      expect: "10",
    },
    {
      topic: "Catalan numbers",
      q: t`How many balanced strings of 3 pairs of brackets are there? What is \(C_5\)?`,
      a: t`\(C_3 = 5\): ((())), (()()), (())(), ()(()), ()()(). \(C_5 = \dfrac1{6}\binom{10}{5} = 42\).`,
      code: `[discrete.dyckWords(3).count, discrete.catalan(5)]`,
      expect: "[5, 42]",
    },
    {
      topic: "Vandermonde's identity",
      q: t`Evaluate \(\displaystyle\sum_{k=0}^{10}\binom{10}{k}^2\).`,
      a: t`Choose 10 of 20 split into two groups of 10: \(\binom{20}{10} = 184756\).`,
      code: `let s = 0n;
for (let k = 0; k <= 10; k++) s += discrete.binomial(10, k) ** 2n;
[s, discrete.binomial(20, 10)]`,
      expect: "[184756, 184756]",
    },
    {
      topic: "Linear recurrences",
      q: t`Solve \(a_n = 5a_{n-1} - 6a_{n-2}\), \(a_0 = 1\), \(a_1 = 4\).`,
      a: t`Characteristic roots 2 and 3: \(a_n = A\,2^n + B\,3^n\), \(A + B = 1\), \(2A + 3B = 4\): \(B = 2\), \(A = -1\). \(a_n = 2\cdot3^n - 2^n\).`,
      code: `String(discrete.recurrence({ coefficients: [5, -6], initial: [1, 4] }).closedForm())`,
      expect: "a(n) = −2^n + 2·3^n",
    },
    {
      topic: "Jacobsthal numbers",
      q: t`Solve \(a_n = a_{n-1} + 2a_{n-2}\), \(a_0 = 0\), \(a_1 = 1\), and list \(a_0, \dots, a_7\).`,
      a: t`Roots 2 and \(-1\): \(a_n = \dfrac{2^n - (-1)^n}{3}\). Terms 0, 1, 1, 3, 5, 11, 21, 43.`,
      code: `const r = discrete.recurrence({ coefficients: [1, 2], initial: [0, 1] });
[String(r.closedForm()), r.terms(8)]`,
      expect: `["a(n) = −(1/3)·(−1)^n + (1/3)·2^n", [0, 1, 1, 3, 5, 11, 21, 43]]`,
    },
    {
      topic: "Generating functions",
      q: t`In how many ways can 25 cents be made from pennies, nickels and dimes?`,
      a: t`The coefficient of \(x^{25}\) in \(\dfrac{1}{(1 - x)(1 - x^5)(1 - x^{10})}\): with \(d\) dimes (0, 1, 2) the nickels range over \(0..\lfloor(25 - 10d)/5\rfloor\): \(6 + 4 + 2 = 12\).`,
      code: `const den = (k) => discrete.series(Array.from({ length: k + 1 }, (_, i) => (i === 0 ? 1 : i === k ? -1 : 0)));
den(1).multiply(den(5)).multiply(den(10)).reciprocal().coefficient(25)`,
      expect: "12",
    },
    {
      topic: "Labelled trees",
      q: t`How many labelled trees are there on 5 vertices?`,
      a: t`Cayley's formula: \(5^{5-2} = 125\).`,
      code: `discrete.labelledTrees(5).count`,
      expect: "125",
    },
    {
      topic: "Burnside counting",
      q: t`How many ways can the 4 vertices of a square be coloured with 3 colours, up to rotation? Up to rotation and reflection?`,
      a: t`Rotations: \((81 + 3 + 9 + 3)/4 = 24\). With reflections (two diagonal flips fix \(27\) each, two edge flips \(9\) each): \((81 + 3 + 9 + 3 + 27 + 27 + 9 + 9)/8 = 21\).`,
      code: `[discrete.countColourings(discrete.symmetry.cyclic(4), 3), discrete.countColourings(discrete.symmetry.dihedral(4), 3)]`,
      expect: "[24, 21]",
    },
    {
      topic: "Cycle index",
      q: t`Write the cycle index of the rotation group of a square acting on its vertices.`,
      a: t`Identity \(s_1^4\), quarter turns \(s_4\) (twice), half turn \(s_2^2\): \(Z = \tfrac14(s_1^4 + s_2^2 + 2s_4)\).`,
      code: `String(discrete.cycleIndex(discrete.symmetry.cyclic(4)))`,
      expect: "(1/2) s4 + (1/4) s2^2 + (1/4) s1^4",
    },
    {
      topic: "Binomial coefficients",
      q: t`How many lattice paths go from \((0, 0)\) to \((4, 3)\) with unit steps right and up?`,
      a: t`Choose which 3 of the 7 steps go up: \(\binom73 = 35\).`,
      code: `discrete.binomial(7, 3)`,
      expect: "35",
    },
    {
      topic: "Steiner triple systems",
      q: t`A Steiner triple system on 7 points has every pair in exactly one triple. How many triples does it have?`,
      a: t`\(\binom72/\binom32 = 21/3 = 7\) (the Fano plane).`,
      code: `const S = discrete.steinerTripleSystem(7);
Object.keys(S).length`,
      expect: "7",
      note: "The system comes back as a plain object of 7 triples keyed 0 to 6, not an array or a block design with its parameters.",
    },
  ],
};
