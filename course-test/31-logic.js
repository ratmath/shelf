const t = String.raw;

export default {
  title: "Mathematical logic",
  level: "University: upper level",
  short: "Propositional semantics and normal forms, satisfiability, natural deduction, resolution, intuitionistic logic, first-order semantics, prenex and Skolem forms, models and countermodels, modal logic, syllogisms.",
  blurb: "Unsatisfiable clause sets, entailment, CNF, model counting, minimal DNF, natural-deduction proofs found and checked, resolution refutations, the gap between classical and intuitionistic logic (excluded middle, double negation, Peirce's law), first-order validity and a two-element countermodel for swapping quantifiers, prenex and Skolem normal forms, evaluating sentences in finite structures, finding models, the K axiom and the T and S5 frame axioms, and counting the valid syllogisms with and without existential import.",
  exercises: [
    {
      topic: "Satisfiability",
      q: t`Is \((p \lor q) \land (\lnot p \lor q) \land (p \lor \lnot q) \land (\lnot p \lor \lnot q)\) satisfiable?`,
      a: t`The four clauses rule out each of the four assignments to \(p, q\): unsatisfiable.`,
      code: `logic.satisfiable("(p | q) & (~p | q) & (p | ~q) & (~p | ~q)").status`,
      expect: "unsatisfiable",
    },
    {
      topic: "Entailment",
      q: t`Show \(p \to q,\ \lnot q \models \lnot p\).`,
      a: t`In any valuation with \(p\) true, \(p \to q\) forces \(q\) true, contradicting \(\lnot q\). So \(p\) is false (modus tollens).`,
      code: `logic.entails("p -> q, ~q", "~p").status`,
      expect: "valid",
    },
    {
      topic: "Conjunctive normal form",
      q: t`Put \(p \leftrightarrow q\) in conjunctive normal form.`,
      a: t`\((p \to q) \land (q \to p) \equiv (\lnot p \lor q) \land (p \lor \lnot q)\).`,
      code: `String(logic.cnf("p <-> q"))`,
      expect: "(p ∨ ¬q) ∧ (¬p ∨ q)",
    },
    {
      topic: "Counting models",
      q: t`How many of the 8 valuations of \(p, q, r\) satisfy \(p \lor q \lor r\)?`,
      a: t`All but the all-false one: 7.`,
      code: `logic.countModels("p | q | r", ["p", "q", "r"])`,
      expect: "7",
    },
    {
      topic: "Minimal DNF",
      q: t`Find a minimal sum of products for \(f(a, b, c) = \sum m(0, 1, 2, 5, 6, 7)\).`,
      a: t`The minterms form a 6-cycle on the cube; it is covered by three of its edges, e.g. \(\bar a\bar b + b\bar c + ac\) (the other cover is \(\bar a\bar c + \bar bc + ab\)). Three terms of two literals.`,
      code: `String(logic.minimize(logic.fromMinterms(["a", "b", "c"], [0, 1, 2, 5, 6, 7])).formula)`,
      expect: ["(a ∧ c) ∨ (b ∧ ¬c) ∨ (¬a ∧ ¬b)", "(a ∧ b) ∨ (¬b ∧ c) ∨ (¬a ∧ ¬c)"],
    },
    {
      topic: "Natural deduction",
      q: t`Give a natural-deduction proof of \((p \to q) \to (\lnot q \to \lnot p)\).`,
      a: t`Assume \(p \to q\); assume \(\lnot q\); assume \(p\); then \(q\) by \(\to\)E, contradiction with \(\lnot q\); so \(\lnot p\) by \(\lnot\)I; discharge twice with \(\to\)I.`,
      code: `const r = logic.prove("", "(p -> q) -> (~q -> ~p)");
[r.status, logic.checkProof(String(r.proof)).status]`,
      expect: `["proved", "proof"]`,
    },
    {
      topic: "Checking a proof",
      q: t`Check this proof of \(p \to q,\ \lnot q \vdash \lnot p\): 1. \(p \to q\) premise; 2. \(\lnot q\) premise; 3. \(\mid p\) assumption; 4. \(\mid q\) \(\to\)E 1, 3; 5. \(\mid \bot\) \(\lnot\)E 4, 2; 6. \(\lnot p\) \(\lnot\)I 3–5.`,
      a: t`Each line follows by the rule cited; the assumption at 3 is discharged at 6. It is a correct proof of \(p \to q, \lnot q \vdash \lnot p\).`,
      code: `const r = logic.checkProof(\`1. p -> q      premise
2. ~q          premise
3. | p         assumption
4. | q         ->E 1, 3
5. | _|_       ~E 4, 2
6. ~p          ~I 3-5\`);
[r.status, r.proves]`,
      expect: `["proof", "p → q, ¬q ⊢ ¬p"]`,
    },
    {
      topic: "Resolution",
      q: t`Use resolution to show \(p \lor q,\ \lnot p \lor q \models q\).`,
      a: t`Add \(\lnot q\). Resolve \(p \lor q\) with \(\lnot p \lor q\) on \(p\): \(q\). Resolve \(q\) with \(\lnot q\): the empty clause.`,
      code: `const r = logic.entails("p | q, ~p | q", "q");
[r.status, logic.checkResolution(r.refutation).ok ?? logic.checkResolution(r.refutation).status]`,
      check: (v) => v[0] === "valid" && (v[1] === true || v[1] === "refutation" || v[1] === "proof" || v[1] === "valid"),
      expectText: "[valid, the refutation checks]",
    },
    {
      topic: "Intuitionistic logic",
      q: t`Which of these are provable intuitionistically: \(p \lor \lnot p\); \(\lnot\lnot(p \lor \lnot p)\); Peirce's law \(((p \to q) \to p) \to p\)? Which classically?`,
      a: t`Intuitionistically only \(\lnot\lnot(p \lor \lnot p)\): assume \(\lnot(p \lor \lnot p)\); then \(p\) gives a contradiction, so \(\lnot p\), so \(p \lor \lnot p\), a contradiction. Excluded middle and Peirce's law are classical tautologies but not intuitionistic theorems.`,
      code: `const P = (f, logic_) => logic.prove("", f, { logic: logic_ }).status;
[P("p | ~p", "intuitionistic"), P("~~(p | ~p)", "intuitionistic"), P("((p -> q) -> p) -> p", "intuitionistic"), P("((p -> q) -> p) -> p", "classical")]`,
      expect: `["unprovable", "proved", "unprovable", "proved"]`,
    },
    {
      topic: "First-order validity",
      q: t`Is \(\forall x\,P(x) \to \exists x\,P(x)\) valid?`,
      a: t`Yes, given that domains are non-empty: pick any element \(a\); \(P(a)\) holds, so \(\exists x\,P(x)\).`,
      code: `logic.foEntails([], "(forall x. P(x)) -> exists x. P(x)").status`,
      expect: "valid",
    },
    {
      topic: "Swapping quantifiers",
      q: t`Show \(\exists x\forall y\,R(x, y) \models \forall y\exists x\,R(x, y)\), and that the converse fails.`,
      a: t`If \(a\) is related to every \(y\), then every \(y\) has \(a\). Converse: on \(\{0, 1\}\) with \(R = \{(0, 0), (1, 1)\}\) every \(y\) has some \(x\), but no \(x\) works for all \(y\).`,
      code: `const fwd = logic.foEntails(["exists x. forall y. R(x,y)"], "forall y. exists x. R(x,y)");
const back = logic.foEntails(["forall y. exists x. R(x,y)"], "exists x. forall y. R(x,y)");
[fwd.status, back.status, back.countermodel.size]`,
      expect: `["valid", "invalid", 2]`,
    },
    {
      topic: "Prenex normal form",
      q: t`Put \(\forall x\,P(x) \to \exists y\,Q(y)\) in prenex form.`,
      a: t`\(\lnot\forall x\,P(x) \lor \exists y\,Q(y) \equiv \exists x\exists y\,(\lnot P(x) \lor Q(y))\).`,
      code: `String(logic.prenex("(forall x. P(x)) -> exists y. Q(y)"))`,
      expect: "∃x ∃y (¬P(x) ∨ Q(y))",
    },
    {
      topic: "Skolem normal form",
      q: t`Skolemize \(\forall x\exists y\,R(x, y)\).`,
      a: t`Replace \(y\) by a new function of the universally quantified \(x\): \(\forall x\,R(x, f(x))\). Equisatisfiable, not equivalent.`,
      code: `String(logic.skolemize("forall x. exists y. R(x,y)"))`,
      expect: "∀x R(x, sk1(x))",
    },
    {
      topic: "Truth in a structure",
      q: t`On the domain \(\{1, 2, 3\}\) let \(L = \{(1,2), (2,3), (3,1)\}\). Evaluate \(\forall x\exists y\,L(x, y)\) and \(\exists x\forall y\,L(x, y)\).`,
      a: t`Each element has a successor in the cycle: the first is true. No element is related to all three: the second is false.`,
      code: `const M = logic.structure({ domain: [1, 2, 3], predicates: { L: [[1, 2], [2, 3], [3, 1]] } });
[logic.evaluate("forall x. exists y. L(x, y)", M).value, logic.evaluate("exists x. forall y. L(x, y)", M).value]`,
      expect: "[true, false]",
    },
    {
      topic: "Finding a model",
      q: t`What is the smallest model of \(\forall x\exists y\,R(x, y) \land \forall x\,\lnot R(x, x)\)?`,
      a: t`One element cannot work (it would need \(R(a, a)\)). Two do: \(R = \{(0, 1), (1, 0)\}\). Smallest size 2.`,
      code: `logic.findModel("(forall x. exists y. R(x,y)) & forall x. ~R(x,x)").size`,
      expect: "2",
    },
    {
      topic: "Modal logic: K",
      q: t`Is the distribution axiom \(\Box(p \to q) \to (\Box p \to \Box q)\) valid in every Kripke model? Is \(\Box p \to p\)?`,
      a: t`The first is valid on all frames (axiom K). \(\Box p \to p\) fails at a world \(w\) where \(p\) is false but every world \(w\) sees has \(p\) (for example, \(w\) sees nothing, so \(\Box p\) holds vacuously).`,
      code: `[logic.modalValid("[](p -> q) -> ([]p -> []q)").status, logic.modalValid("[]p -> p").status]`,
      expect: `["valid", "invalid"]`,
    },
    {
      topic: "Modal systems T and S5",
      q: t`Is \(\Box p \to p\) valid in T (reflexive frames)? Is \(\Diamond p \to \Box\Diamond p\) valid in S5?`,
      a: t`Yes: every world sees itself. Yes: in an equivalence class every world sees the same worlds, so if some reachable world has \(p\), every world reaches it.`,
      code: `[logic.modalValid("[]p -> p", { system: "T" }).status, logic.modalValid("<>p -> []<>p", { system: "S5" }).status]`,
      expect: `["valid", "valid"]`,
    },
    {
      topic: "Syllogisms",
      q: t`Is "All M are P; all S are M; therefore all S are P" valid? What is its traditional name?`,
      a: t`Valid: mood AAA in the first figure, Barbara.`,
      code: `const r = logic.syllogism("All M are P", "All S are M", "All S are P");
[r.valid, r.form, r.name]`,
      expect: `[true, "AAA-1", "Barbara"]`,
    },
    {
      topic: "Counting valid syllogisms",
      q: t`Of the 256 syllogistic forms, how many are valid in modern logic, and how many with Aristotle's existential import?`,
      a: t`15 unconditionally valid; with existential import 9 more (the weakened and strengthened moods such as Darapti and Barbari): 24.`,
      code: `[logic.validSyllogisms().length, logic.validSyllogisms({ existentialImport: true }).length]`,
      expect: "[15, 24]",
    },
    {
      topic: "Tautologies",
      q: t`Is \(((p \to q) \land (q \to r)) \to (p \to r)\) a tautology?`,
      a: t`Yes (hypothetical syllogism): if \(p\) then \(q\), then \(r\).`,
      code: `logic.valid("((p -> q) & (q -> r)) -> (p -> r)").status`,
      expect: "valid",
    },
  ],
};
