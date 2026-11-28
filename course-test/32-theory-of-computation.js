const t = String.raw;

export default {
  title: "Theory of computation",
  level: "University: upper level",
  short: "Finite automata, regular expressions, the subset construction and minimisation, closure properties, context-free grammars and Chomsky normal form, pushdown automata, Turing machines, recursive functions, decidability, recurrences for running time.",
  blurb: "A DFA for parity, the minimal DFA for words ending in 01, the subset construction for \((a|b)^*abb\), equivalence of regular expressions, intersecting languages with a product automaton, a regular expression from a DFA, the grammar and PDA for \(a^nb^n\), Chomsky normal form, a Turing machine adding one in binary, primitive recursive and \(\mu\)-recursive functions, the pumping lemma and the halting problem (where no computation can stand in for the proof), a full adder, and the master theorem.",
  exercises: [
    {
      topic: "Deterministic automata",
      q: t`Design a DFA over \(\{0, 1\}\) accepting words with an even number of 1s. Does it accept 1011? 1001?`,
      a: t`Two states, even (start, accepting) and odd, swapped by each 1. 1011 has three 1s: rejected. 1001 has two: accepted.`,
      code: `const M = logic.automaton({ states: ["e", "o"], alphabet: "01", start: "e", accept: ["e"],
  delta: { e: { 0: "e", 1: "o" }, o: { 0: "o", 1: "e" } } });
[M.accepts("1011"), M.accepts("1001")]`,
      expect: "[false, true]",
    },
    {
      topic: "Minimal DFA",
      q: t`How many states does the minimal DFA for binary words ending in 01 have?`,
      a: t`It must remember whether the word ends in nothing useful, in 0, or in 01: three states, which are pairwise distinguishable (by the suffixes 01, 1, and \(\varepsilon\)).`,
      code: `logic.minimizeAutomaton(logic.toDFA(logic.regexToNFA("(0|1)*01"))).states.length`,
      expect: "3",
    },
    {
      topic: "Subset construction",
      q: t`Convert \((a|b)^*abb\) to a DFA and minimise it. How many states? Does it accept \(aababb\) and \(abab\)?`,
      a: t`The minimal DFA tracks the longest suffix that is a prefix of \(abb\): \(\varepsilon, a, ab, abb\): 4 states. \(aababb\) ends in \(abb\): yes; \(abab\): no.`,
      code: `const D = logic.minimizeAutomaton(logic.toDFA(logic.regexToNFA("(a|b)*abb")));
[D.states.length, D.accepts("aababb"), D.accepts("abab")]`,
      expect: "[4, true, false]",
    },
    {
      topic: "Equivalent regular expressions",
      q: t`Are \((a|b)^*\) and \((a^*b^*)^*\) equivalent?`,
      a: t`Yes: both denote all words over \(\{a, b\}\) (every letter is an \(a^*b^*\) block).`,
      code: `logic.equivalentAutomata(logic.regexToNFA("(a|b)*"), logic.regexToNFA("(a*b*)*")).equivalent`,
      expect: "true",
    },
    {
      topic: "Product construction",
      q: t`Build an automaton for words over \(\{a, b\}\) with an even number of \(a\)s and an odd number of \(b\)s. Test \(aab\) and \(ab\).`,
      a: t`Pair the two 2-state parity automata: 4 states, accepting (even, odd). \(aab\): 2 \(a\)s, 1 \(b\): yes. \(ab\): no.`,
      code: `const par = (letter, acc) => logic.automaton({ states: ["e", "o"], alphabet: "ab", start: "e", accept: [acc],
  delta: { e: { a: letter === "a" ? "o" : "e", b: letter === "b" ? "o" : "e" }, o: { a: letter === "a" ? "e" : "o", b: letter === "b" ? "e" : "o" } } });
const P = logic.product(par("a", "e"), par("b", "o"));
[P.states.length, P.accepts("aab"), P.accepts("ab")]`,
      expect: "[4, true, false]",
    },
    {
      topic: "From DFA to regular expression",
      q: t`Give a regular expression for binary words with an even number of 1s.`,
      a: t`\(0^*(10^*10^*)^*\), or equivalently \(0^* \mid 0^*1(0 \mid 10^*1)^*10^*\).`,
      code: `const M = logic.automaton({ states: ["e", "o"], alphabet: "01", start: "e", accept: ["e"],
  delta: { e: { 0: "e", 1: "o" }, o: { 0: "o", 1: "e" } } });
const r = String(logic.toRegex(M));
[r, logic.equivalentAutomata(logic.regexToNFA(r), logic.regexToNFA("0*(10*10*)*")).equivalent]`,
      expect: `["0*|0*1((0|10*1)*)10*", true]`,
    },
    {
      topic: "Context-free grammars",
      q: t`Give a grammar for \(\{a^nb^n : n \ge 0\}\). Does it generate \(aabb\)? \(aab\)? List its words of length at most 6.`,
      a: t`\(S \to aSb \mid \varepsilon\). \(aabb\): yes; \(aab\): no. Words: \(\varepsilon, ab, aabb, aaabbb\).`,
      code: `const g = logic.grammar("S -> a S b | ε");
[g.accepts("aabb"), g.accepts("aab"), g.words(6).words]`,
      expect: `[true, false, ["", "ab", "aabb", "aaabbb"]]`,
    },
    {
      topic: "Chomsky normal form",
      q: t`Convert \(S \to aSb \mid \varepsilon\) to Chomsky normal form.`,
      a: t`New start \(S_0 \to \varepsilon \mid S\); remove \(\varepsilon\): \(S \to aSb \mid ab\); terminals \(A \to a\), \(B \to b\); split: \(S \to AX \mid AB\), \(X \to SB\), and \(S_0 \to \varepsilon \mid AX \mid AB\).`,
      code: `String(logic.grammar("S -> a S b | ε").toCNF())`,
      expect: "S → T0 X0 | T0 T1 X0 → S T1 S0 → ε | T0 X0 | T0 T1 T0 → a T1 → b",
      note: "The rules print one per line (line breaks shown here as spaces).",
    },
    {
      topic: "Pushdown automata",
      q: t`Run a PDA for \(a^nb^n\) (push on \(a\), pop on \(b\)) on \(aabb\) and \(aab\).`,
      a: t`\(aabb\): push, push, pop, pop, the stack is back to its bottom: accept. \(aab\): one \(A\) is left: reject.`,
      code: `const P = logic.pda({ start: "q0", accept: ["q2"], moves: [
  ["q0", "a", "ε", "q0", "A"], ["q0", "ε", "ε", "q1", "ε"],
  ["q1", "b", "A", "q1", "ε"], ["q1", "ε", "Z", "q2", "Z"]] });
[P.accepts("aabb"), P.accepts("aab")]`,
      expect: "[true, false]",
    },
    {
      topic: "Pumping lemma",
      q: t`Prove that \(\{a^nb^n\}\) is not regular.`,
      a: t`If it were, with pumping length \(p\), write \(a^pb^p = xyz\) with \(|xy| \le p\), \(|y| \ge 1\). Then \(y = a^k\), and \(xy^2z = a^{p+k}b^p\) is not in the language. Contradiction.`,
      code: `// No proof tool: a finite check only. The minimal DFA for words a^n b^n with n ≤ N needs more states as N grows.
[2, 4, 6].map((N) => logic.minimizeAutomaton(logic.toDFA(logic.regexToNFA(Array.from({ length: N + 1 }, (_, n) => "a".repeat(n) + "b".repeat(n) || "ε").join("|")))).states.length)`,
      expect: "not regular (a proof)",
      status: "gap",
      note: "Proofs about all words are out of reach; the code only shows the minimal DFA for the finite pieces \\(n \\le N\\) growing with \\(N\\), which is evidence, not the pumping argument.",
    },
    {
      topic: "Turing machines",
      q: t`Run a Turing machine that adds one to a binary number on the input 1011.`,
      a: t`Move to the right end, turn trailing 1s into 0s moving left, then turn the first 0 into 1: \(1011 + 1 = 1100\).`,
      code: `const r = logic.binaryIncrement().run("1011");
[r.status, r.tape]`,
      check: (v) => String(v[1]).replace(/_/g, "") === "1100" && ["halted", "accepted"].includes(v[0]),
      expectText: "[halted, 1100]",
    },
    {
      topic: "Primitive recursion",
      q: t`Using only primitive recursive building blocks, compute \(3 + 4\), \(2^{10}\) and \(7!\).`,
      a: t`\(7\), \(1024\), \(5040\).`,
      code: `const { add, power, factorial } = logic.recursive.examples;
[add.at(3, 4), power.at(2, 10), factorial.at(7)]`,
      expect: "[7, 1024, 5040]",
    },
    {
      topic: "Composition of recursive functions",
      q: t`Define \(d(x) = x + x\) by composing addition with projections, and evaluate \(d(21)\).`,
      a: t`\(d = \operatorname{add}\circ(\pi^1_1, \pi^1_1)\), \(d(21) = 42\).`,
      code: `const { compose, proj, examples } = logic.recursive;
compose(examples.add, [proj(1, 1), proj(1, 1)]).at(21)`,
      expect: "42",
    },
    {
      topic: "Minimisation",
      q: t`Use the \(\mu\) operator to compute the integer square root of 30: the least \(y\) with \((y + 1)^2 > 30\).`,
      a: t`\(5^2 = 25 \le 30 < 36 = 6^2\): \(\lfloor\sqrt{30}\rfloor = 5\).`,
      code: `const { mu } = logic.recursive;
// mu(f) finds the least y with f(y, x) = 0 (the searched argument comes first); here f = 0 exactly when (y + 1)^2 > x
const f = { arity: 2, name: "gt", at: (y, x) => ((y + 1n) * (y + 1n) > x ? 0n : 1n) };
mu(f).at(30)`,
      expect: "5",
      note: "The test function is written in JavaScript rather than built from the primitive recursive pieces.",
    },
    {
      topic: "The halting problem",
      q: t`Is there an algorithm that decides, for every program and input, whether the program halts?`,
      a: t`No (Turing). If \(H\) decided halting, the program \(D\) that runs \(H\) on its own code and does the opposite would halt exactly when it does not.`,
      code: `// A run with a budget can only report "running" for a machine that has not stopped yet.
const loop = logic.turing({ start: "s", accept: "y", reject: "n", delta: { "s,_": ["s", "_", "R"] } });
loop.run("", { budget: 1000 }).status`,
      expect: "undecidable (a proof)",
      status: "gap",
      note: "No computation can stand in for the diagonal argument; <code>run</code> with a budget reports <code>running</code>, as the documentation says it must.",
    },
    {
      topic: "Circuits",
      q: t`A full adder adds bits \(a, b\) and a carry \(c_{in}\). What are the sum and carry for \(1 + 1 + 1\)?`,
      a: t`\(1 + 1 + 1 = 3 = 11_2\): sum 1, carry 1.`,
      code: `logic.adders.full().evaluate({ a: 1, b: 1, cin: 1 })`,
      expect: "{ sum: 1, cout: 1 }",
    },
    {
      topic: "Ripple-carry adder",
      q: t`How many gates and what depth does a ripple-carry adder for 4-bit numbers have, built from full adders of 5 gates and depth 3?`,
      a: t`Four full adders: about 20 gates; the carry passes through each stage, so the depth grows linearly (roughly \(2n + 1 = 9\) for the carry chain).`,
      code: `const c = logic.adders.ripple(4);
[c.size, c.depth]`,
      check: (v) => v[0] >= 16 && v[0] <= 24 && v[1] >= 7 && v[1] <= 12,
      expectText: "about 20 gates, depth about 9",
      note: "The exact counts depend on how the half and full adders are built; the check accepts the textbook range.",
    },
    {
      topic: "Master theorem",
      q: t`Solve \(T(n) = 2T(n/2) + n\) and \(T(n) = 8T(n/2) + n^2\) asymptotically.`,
      a: t`\(n^{\log_2 2} = n\) matches \(f(n) = n\): \(\Theta(n\log n)\). \(n^{\log_2 8} = n^3\) beats \(n^2\): \(\Theta(n^3)\).`,
      code: `[discrete.masterTheorem({ a: 2, b: 2, d: 1 }).bound, discrete.masterTheorem({ a: 8, b: 2, d: 2 }).bound]`,
      expect: `["Θ(n log n)", "Θ(n^3)"]`,
    },
    {
      topic: "SAT as a decision problem",
      q: t`Is \((x_1 \lor x_2) \land (\lnot x_1 \lor x_3) \land (\lnot x_2 \lor \lnot x_3) \land (x_1 \lor \lnot x_3)\) satisfiable? Give a satisfying assignment.`,
      a: t`Try \(x_1 = 1\): then \(x_3 = 1\) (clause 2), so \(x_2 = 0\) (clause 3); clause 1 holds by \(x_1\), clause 4 by \(x_1\). Satisfiable with \(x_1 = 1, x_2 = 0, x_3 = 1\).`,
      code: `const r = logic.satisfiable("(x1 | x2) & (~x1 | x3) & (~x2 | ~x3) & (x1 | ~x3)");
[r.status, r.model ?? r.assignment]`,
      check: (v) => v[0] === "satisfiable" && JSON.stringify(v[1]).replace(/\s/g, "").includes('"x1":true') && JSON.stringify(v[1]).includes('"x2":false') && JSON.stringify(v[1]).includes('"x3":true'),
      expectText: "[satisfiable, x1 = 1, x2 = 0, x3 = 1]",
    },
    {
      topic: "Counting accepted words",
      q: t`How many binary words of length 4 have an even number of 1s?`,
      a: t`Half of the 16: \(\binom40 + \binom42 + \binom44 = 1 + 6 + 1 = 8\).`,
      code: `const M = logic.automaton({ states: ["e", "o"], alphabet: "01", start: "e", accept: ["e"],
  delta: { e: { 0: "e", 1: "o" }, o: { 0: "o", 1: "e" } } });
M.words(4).filter((w) => w.length === 4).length`,
      expect: "8",
    },
  ],
};
