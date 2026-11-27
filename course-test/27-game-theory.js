const t = String.raw;

const map = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));

export default {
  title: "Game theory",
  level: "University: upper level",
  short: "Pure and mixed Nash equilibria, zero-sum games and saddle points, extensive form and backward induction, combinatorial games and Nim, cooperative games, voting, matching and apportionment.",
  blurb: "The prisoner's dilemma, matching pennies and rock–paper–scissors, a 2×2 zero-sum game solved by mixing, saddle points, the battle of the sexes with its mixed equilibrium, an entry game by backward induction, Nim and the Sprague–Grundy values of a subtraction game, short partizan games, the glove game's Shapley value and core, Shapley–Shubik and Banzhaf power, plurality, Borda and Condorcet winners, Gale–Shapley matching, Hamilton apportionment and the assignment problem.",
  exercises: [
    {
      topic: "Prisoner's dilemma",
      q: t`Each prisoner can Cooperate or Defect. Payoffs (row, column): CC \((-1, -1)\), CD \((-3, 0)\), DC \((0, -3)\), DD \((-2, -2)\). Find the pure Nash equilibria.`,
      a: t`Defect strictly dominates Cooperate for both (\(0 > -1\), \(-2 > -3\)), so the only equilibrium is (D, D), paying \((-2, -2)\).`,
      code: `const g = discrete.bimatrixGame([[-1, -3], [0, -2]], [[-1, 0], [-3, -2]], { rows: ["C", "D"], columns: ["C", "D"] });
g.equilibria().map(String)`,
      expect: `["(D; D) paying -2 and -2"]`,
    },
    {
      topic: "Matching pennies",
      q: t`Solve the zero-sum game \(\begin{pmatrix}1&-1\\-1&1\end{pmatrix}\).`,
      a: t`No saddle point; each player mixes \(\tfrac12, \tfrac12\) and the value is 0.`,
      code: `String(discrete.matrixGame([[1, -1], [-1, 1]]))`,
      expect: "value 0; row plays r1 1/2, r2 1/2; column plays c1 1/2, c2 1/2",
    },
    {
      topic: "A 2×2 zero-sum game",
      q: t`Solve the zero-sum game \(\begin{pmatrix}3&-1\\-2&4\end{pmatrix}\).`,
      a: t`No saddle point (row minima \(-1, -2\); column maxima 3, 4). Row plays \(p\) on row 1: \(3p - 2(1-p) = -p + 4(1-p)\) gives \(p = \tfrac35\). Column: \(3q - (1-q) = -2q + 4(1-q)\) gives \(q = \tfrac12\). Value \(= \tfrac{3\cdot4 - (-1)(-2)}{3 + 4 + 1 + 2} = 1\).`,
      code: `String(discrete.matrixGame([[3, -1], [-2, 4]]))`,
      expect: "value 1; row plays r1 3/5, r2 2/5; column plays c1 1/2, c2 1/2",
    },
    {
      topic: "Saddle points",
      q: t`Find the saddle points of \(\begin{pmatrix}4&2&3\\1&0&-1\\5&1&2\end{pmatrix}\).`,
      a: t`Row minima 2, \(-1\), 1: maximin 2. Column maxima 5, 2, 3: minimax 2. Saddle at row 1, column 2, value 2.`,
      code: `discrete.saddlePoints([[4, 2, 3], [1, 0, -1], [5, 1, 2]])`,
      expect: "[{ row: 0, column: 1, value: 2 }]",
    },
    {
      topic: "Rock, paper, scissors",
      q: t`Solve rock–paper–scissors as a zero-sum game (win 1, lose \(-1\), tie 0).`,
      a: t`By symmetry the value is 0 and each player mixes \(\tfrac13, \tfrac13, \tfrac13\).`,
      code: `String(discrete.matrixGame([[0, -1, 1], [1, 0, -1], [-1, 1, 0]]))`,
      expect: "value 0; row plays r1 1/3, r2 1/3, r3 1/3; column plays c1 1/3, c2 1/3, c3 1/3",
    },
    {
      topic: "Battle of the sexes",
      q: t`Row payoffs \(\begin{pmatrix}2&0\\0&1\end{pmatrix}\), column payoffs \(\begin{pmatrix}1&0\\0&2\end{pmatrix}\). Find all Nash equilibria.`,
      a: t`Pure: (r1, c1) paying (2, 1) and (r2, c2) paying (1, 2). Mixed: column makes row indifferent with \(2q = 1 - q\), \(q = \tfrac13\); row makes column indifferent with \(p = 2(1 - p)\), \(p = \tfrac23\). Both expect \(\tfrac23\).`,
      code: `discrete.bimatrixGame([[2, 0], [0, 1]], [[1, 0], [0, 2]]).equilibria().map(String)`,
      expect: `["(r1; c1) paying 2 and 1", "(r2; c2) paying 1 and 2", "(2/3 r1 + 1/3 r2; 1/3 c1 + 2/3 c2) paying 2/3 and 2/3"]`,
    },
    {
      topic: "Backward induction",
      q: t`An entrant E chooses Out (payoffs E 0, incumbent I 2) or In. After In, I chooses Fight (\(-1, -1\)) or Accommodate (1, 1). Find the subgame perfect equilibrium.`,
      a: t`After In, I prefers Accommodate (\(1 > -1\)); knowing that, E prefers In (\(1 > 0\)). Play: In, Accommodate, payoffs (1, 1). The threat to fight is not credible.`,
      code: `const tree = { player: "E", moves: {
  out: { payoff: { E: 0, I: 2 } },
  in: { player: "I", moves: { fight: { payoff: { E: -1, I: -1 } }, accommodate: { payoff: { E: 1, I: 1 } } } },
} };
const b = discrete.backwardInduction(tree);
[b.path, (${map})(b.value)]`,
      expect: `[["in", "accommodate"], { E: "1", I: "1" }]`,
    },
    {
      topic: "Nim",
      q: t`In Nim with heaps 3, 4, 5, is the first player winning? Give a winning move.`,
      a: t`\(3 \oplus 4 \oplus 5 = 011 \oplus 100 \oplus 101 = 010 = 2 \ne 0\): winning. Reduce the heap of 3 to \(3 \oplus 2 = 1\).`,
      code: `const n = discrete.nim([3, 4, 5]);
[n.nimSum, n.losing, n.winningMoves.map((m) => [m.from, m.to])]`,
      expect: "[2, false, [[3, 1]]]",
    },
    {
      topic: "Sprague–Grundy values",
      q: t`In the subtraction game where a move removes 1, 2 or 3 counters, find the Grundy values of heaps 0 to 11.`,
      a: t`\(g(n) = \operatorname{mex}\{g(n-1), g(n-2), g(n-3)\} = n \bmod 4\): 0, 1, 2, 3 repeating. The P-positions are multiples of 4.`,
      code: `const s = discrete.subtractionGame([1, 2, 3], 12);
[s.values, s.period.length]`,
      expect: "[[0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3], 4]",
    },
    {
      topic: "Partizan games",
      q: t`Find the values of the games \(\{0 \mid\ \}\), \(\{\ \mid 0\}\) and \(\{0 \mid 0\}\).`,
      a: t`\(\{0\mid\} = 1\) (a free move for Left), \(\{\mid0\} = -1\), and \(\{0\mid0\} = {*}\) (star: whoever moves first wins).`,
      code: `const c = discrete.cgame;
[c([0], []), c([], [0]), c([0], [0])].map(String)`,
      expect: `["1", "-1", "*"]`,
    },
    {
      topic: "Shapley value",
      q: t`In the glove game, player L owns a left glove and R1, R2 each own a right glove; a coalition is worth 1 if it can make a pair. Find the Shapley value.`,
      a: t`L is pivotal unless it comes first (in 4 of 6 orders): \(\tfrac23\). R1 is pivotal only in the order L, R1, R2: \(\tfrac16\); likewise R2.`,
      code: `const g = discrete.cooperativeGame(["L", "R1", "R2"], (S) => (S.includes("L") && (S.includes("R1") || S.includes("R2")) ? 1 : 0));
(${map})(discrete.shapley(g))`,
      expect: `{ L: "2/3", R1: "1/6", R2: "1/6" }`,
    },
    {
      topic: "The core",
      q: t`Find the core of the glove game.`,
      a: t`Core constraints \(x_L + x_{R1} \ge 1\), \(x_L + x_{R2} \ge 1\), total 1, all \(\ge 0\), force \(x_{R1} = x_{R2} = 0\): the core is the single point \((1, 0, 0)\). Competition between the right gloves gives L everything.`,
      code: `const g = discrete.cooperativeGame(["L", "R1", "R2"], (S) => (S.includes("L") && (S.includes("R1") || S.includes("R2")) ? 1 : 0));
const c = discrete.core(g);
[c.empty, (${map})(c.allocation)]`,
      expect: `[false, { L: "1", R1: "0", R2: "0" }]`,
      status: "partial",
      note: "<code>core</code> says the core is non-empty and returns one allocation in it; that it is the only one is shown by hand.",
    },
    {
      topic: "Voting power",
      q: t`Three voters have weights 50, 49, 1 and the quota is 51. Find the Shapley–Shubik and Banzhaf power indices.`,
      a: t`Winning coalitions: \(\{1,2\}, \{1,3\}, \{1,2,3\}\). Shapley–Shubik: voter 1 is pivotal in 4 of 6 orders: \((\tfrac23, \tfrac16, \tfrac16)\). Banzhaf swings: voter 1 in 3, voters 2 and 3 in 1 each: \((\tfrac35, \tfrac15, \tfrac15)\). Weight 49 has no more power than weight 1.`,
      code: `const w = discrete.weightedVoting({ quota: 51, weights: [50, 49, 1] });
[Object.values(w.shapleyShubik), Object.values(w.banzhaf)]`,
      expect: "[[2/3, 1/6, 1/6], [3/5, 1/5, 1/5]]",
    },
    {
      topic: "Voting methods",
      q: t`Nine voters: 4 rank A > B > C, 3 rank B > C > A, 2 rank C > B > A. Find the plurality, Borda and Condorcet winners.`,
      a: t`Plurality: A (4 first places). Borda (2, 1, 0 points): A 8, B 12, C 7, so B. Pairwise: B beats A 5–4 and C 7–2, so B is the Condorcet winner.`,
      code: `const b = [{ count: 4, ranking: ["A", "B", "C"] }, { count: 3, ranking: ["B", "C", "A"] }, { count: 2, ranking: ["C", "B", "A"] }];
[discrete.plurality(b).winners, discrete.borda(b).winners, discrete.condorcet(b).winner]`,
      expect: `[["A"], ["B"], "B"]`,
    },
    {
      topic: "Stable matching",
      q: t`Proposers A: x > y and B: y > x; receivers x: B > A and y: A > B. Run Gale–Shapley with A and B proposing.`,
      a: t`A proposes to x, B to y; both are accepted and nobody is rejected. Matching A–x, B–y: stable (and best for the proposers), with no blocking pair.`,
      code: `const m = discrete.stableMatching({ A: ["x", "y"], B: ["y", "x"] }, { x: ["B", "A"], y: ["A", "B"] });
[m.matching, m.blockingPairs]`,
      expect: `[{ A: "x", B: "y" }, []]`,
    },
    {
      topic: "Apportionment",
      q: t`Apportion 10 seats among states of population 120, 230 and 650 by Hamilton's method.`,
      a: t`Quotas 1.2, 2.3, 6.5: floors 1, 2, 6 (9 seats); the largest remainder (0.5) gets the last seat. Seats \(1, 2, 7\).`,
      code: `Object.values(discrete.apportion([120, 230, 650], 10).seats)`,
      expect: "[1, 2, 7]",
    },
    {
      topic: "Assignment problem",
      q: t`Assign three workers to three jobs at minimum total cost with cost matrix \(\begin{pmatrix}4&1&3\\2&0&5\\3&2&2\end{pmatrix}\).`,
      a: t`Of the 6 assignments, worker 1→job 2, 2→1, 3→3 costs \(1 + 2 + 2 = 5\), the least (the next best cost 6).`,
      code: `const r = discrete.assignment([[4, 1, 3], [2, 0, 5], [3, 2, 2]]);
[r.assignment, r.cost]`,
      expect: "[[1, 0, 2], 5]",
    },
    {
      topic: "Iterated dominance",
      q: t`Row payoffs \(\begin{pmatrix}3&1&0\\2&2&1\\1&0&2\end{pmatrix}\) in a zero-sum game (row maximises). Does any strategy dominate another? Find the value.`,
      a: t`For the minimising column player, column 1 \((3, 2, 1)\) is at least column 2 \((1, 2, 0)\) entry by entry, so column 1 is dominated and dropped. In \(\begin{pmatrix}1&0\\2&1\\0&2\end{pmatrix}\) row 1 is dominated by row 2. That leaves \(\begin{pmatrix}2&1\\0&2\end{pmatrix}\) (rows 2, 3; columns 2, 3), with no saddle point. Row: \(2p = p + 2(1 - p)\), \(p = \tfrac23\) on row 2. Column: \(2q + (1 - q) = 2(1 - q)\), \(q = \tfrac13\) on column 2. Value \(\tfrac{2\cdot2 - 1\cdot0}{2 + 2 - 1 - 0} = \tfrac43\).`,
      code: `String(discrete.matrixGame([[3, 1, 0], [2, 2, 1], [1, 0, 2]]))`,
      expect: "value 4/3; row plays r2 2/3, r3 1/3; column plays c2 1/3, c3 2/3",
    },
    {
      topic: "Mixed strategies by indifference",
      q: t`In \(\begin{pmatrix}5&1\\2&4\end{pmatrix}\) (zero-sum, row maximises), find the optimal strategies and value.`,
      a: t`No saddle point. \(5p + 2(1-p) = p + 4(1-p)\): \(p = \tfrac13\). \(5q + (1 - q) = 2q + 4(1 - q)\): \(q = \tfrac12\). Value \(= \tfrac{5\cdot4 - 1\cdot2}{5 + 4 - 1 - 2} = 3\).`,
      code: `String(discrete.matrixGame([[5, 1], [2, 4]]))`,
      expect: "value 3; row plays r1 1/3, r2 2/3; column plays c1 1/2, c2 1/2",
    },
    {
      topic: "Pure equilibria",
      q: t`Find the pure Nash equilibria of the coordination game with row payoffs \(\begin{pmatrix}3&0\\0&2\end{pmatrix}\) and the same for the column player.`,
      a: t`(r1, c1) paying (3, 3) and (r2, c2) paying (2, 2): neither player gains by deviating alone in either. The off-diagonal cells are not equilibria.`,
      code: `discrete.bimatrixGame([[3, 0], [0, 2]], [[3, 0], [0, 2]]).pureEquilibria().length`,
      expect: "2",
    },
  ],
};
