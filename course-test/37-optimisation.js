import { near } from "./lib.js";
const t = String.raw;

export default {
  title: "Optimisation",
  level: "University: upper level",
  short: "Linear programming and duality, integer programs, assignment and transportation, unconstrained and constrained calculus optimisation, convexity.",
  blurb: "Linear programs solved by the simplex method with their dual prices, infeasible and unbounded programs, integer programs and knapsacks, the assignment and transportation problems, critical points and the Hessian test, Lagrange multipliers, convexity, least squares and a gradient step.",
  exercises: [
    {
      topic: "A linear program",
      q: t`Maximise \(3x + 5y\) subject to \(x \le 4\), \(2y \le 12\), \(3x + 2y \le 18\), \(x, y \ge 0\).`,
      a: t`The corners are \((0,0), (4,0), (4,3), (2,6), (0,6)\) with values \(0, 12, 27, 36, 30\): the maximum is 36 at \((2, 6)\).`,
      code: `const lp = discrete.linearProgram({ maximize: [3, 5], constraints: [[[1, 0], "<=", 4], [[0, 2], "<=", 12], [[3, 2], "<=", 18]] });
[lp.status, lp.value, lp.x]`,
      expect: '["optimal", 36, [2, 6]]',
    },
    {
      topic: "Shadow prices",
      q: t`For the same program, find the dual solution (shadow prices) and check that the dual value equals 36.`,
      a: t`At \((2,6)\) the second and third constraints are tight. Solving \(y_1 \cdot 1 + 3y_3 = 3\), \(2y_2 + 2y_3 = 5\) with \(y_1 = 0\) gives \(y = (0, \tfrac32, 1)\); \(4 \cdot 0 + 12 \cdot \tfrac32 + 18 \cdot 1 = 36\).`,
      code: `const lp = discrete.linearProgram({ maximize: [3, 5], constraints: [[[1, 0], "<=", 4], [[0, 2], "<=", 12], [[3, 2], "<=", 18]] });
[lp.dual, lp.check()]`,
      expect: "[[0, 3/2, 1], true]",
    },
    {
      topic: "Minimising",
      q: t`Minimise \(3x + 2y\) subject to \(x + y \ge 4\), \(x + 3y \ge 6\), \(x, y \ge 0\).`,
      a: t`The corners are \((6,0), (3,1), (0,4)\) with values \(18, 11, 8\): the minimum is 8 at \((0, 4)\).`,
      code: `const lp = discrete.linearProgram({ minimize: [3, 2], constraints: [[[1, 1], ">=", 4], [[1, 3], ">=", 6]] });
[lp.value, lp.x]`,
      expect: "[8, [0, 4]]",
    },
    {
      topic: "Infeasibility",
      q: t`Show that \(x + y \le 1\), \(x + y \ge 2\), \(x, y \ge 0\) has no solution.`,
      a: t`Adding the first inequality to the negative of the second gives \(0 \le -1\).`,
      code: `discrete.linearProgram({ maximize: [1, 1], constraints: [[[1, 1], "<=", 1], [[1, 1], ">=", 2]] }).status`,
      expect: "infeasible",
    },
    {
      topic: "Unboundedness",
      q: t`Show that maximising \(x + y\) subject to \(x - y \le 1\), \(x, y \ge 0\) is unbounded.`,
      a: t`Along \((0, t)\) every constraint holds and \(x + y = t\) grows without bound.`,
      code: `discrete.linearProgram({ maximize: [1, 1], constraints: [[[1, -1], "<=", 1]] }).status`,
      expect: "unbounded",
    },
    {
      topic: "Integer programming",
      q: t`Maximise \(5x + 4y\) subject to \(6x + 4y \le 24\), \(x + 2y \le 6\), \(x, y \ge 0\) integers. Compare with the LP relaxation.`,
      a: t`The relaxation peaks at \((3, \tfrac32)\) with value 21. Among integer points, \((4, 0)\) gives 20, \((3, 1)\) 19, \((2, 2)\) 18: the integer optimum is 20 at \((4, 0)\).`,
      code: `const ip = discrete.integerProgram({ maximize: [5, 4], constraints: [[[6, 4], "<=", 24], [[1, 2], "<=", 6]] });
[ip.value, ip.x, ip.relaxation.value]`,
      expect: "[20, [4, 0], 21]",
    },
    {
      topic: "Knapsack",
      q: t`Items weigh 2, 3, 4, 5 and are worth 3, 4, 5, 6. Which should go in a knapsack holding weight 5?`,
      a: t`The pairs within weight 5: only \(\{1, 2\}\) (weight 5, worth 7); single items are worth at most 6. Take items 1 and 2, worth 7.`,
      code: `const ip = discrete.integerProgram({ maximize: [3, 4, 5, 6], constraints: [[[2, 3, 4, 5], "<=", 5], [[1, 0, 0, 0], "<=", 1], [[0, 1, 0, 0], "<=", 1], [[0, 0, 1, 0], "<=", 1], [[0, 0, 0, 1], "<=", 1]] });
[ip.value, ip.x]`,
      expect: "[7, [1, 1, 0, 0]]",
      note: "There is no 0–1 bound option, so each \\(x_i \\le 1\\) is written as a constraint.",
    },
    {
      topic: "Assignment problem",
      q: t`Assign four workers to four jobs at least total cost, with costs \(\begin{pmatrix} 9&2&7&8\\6&4&3&7\\5&8&1&8\\7&6&9&4 \end{pmatrix}\).`,
      a: t`By the Hungarian method: worker 1 → job 2, 2 → 1, 3 → 3, 4 → 4, cost \(2 + 6 + 1 + 4 = 13\).`,
      code: `const a = discrete.assignment([[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]]);
[a.cost, a.assignment]`,
      expect: "[13, [1, 0, 2, 3]]",
    },
    {
      topic: "Transportation problem",
      q: t`Two warehouses hold 20 and 30 units; three stores need 10, 25 and 15. Shipping costs per unit are \(\begin{pmatrix} 8&6&10\\9&12&13 \end{pmatrix}\). Find the cheapest plan's cost.`,
      a: t`Warehouse 1 sends 20 to store 2; warehouse 2 sends 10, 5, 15. Cost \(120 + 90 + 60 + 195 = 465\) (checked by the stepping-stone test: every unused route has nonnegative reduced cost).`,
      code: `const cost = [8, 6, 10, 9, 12, 13];
const lp = discrete.linearProgram({ minimize: cost, constraints: [
  [[1, 1, 1, 0, 0, 0], "=", 20], [[0, 0, 0, 1, 1, 1], "=", 30],
  [[1, 0, 0, 1, 0, 0], "=", 10], [[0, 1, 0, 0, 1, 0], "=", 25], [[0, 0, 1, 0, 0, 1], "=", 15]] });
lp.value`,
      expect: "465",
      status: "partial",
      note: "No transportation-problem helper: the program is written out as a linear program in the six shipping amounts.",
    },
    {
      topic: "Optimising a rectangle",
      q: t`A rectangle has perimeter 20. What is the largest area it can have?`,
      a: t`With sides \(x\) and \(10 - x\), \(A = x(10 - x)\) is largest at \(x = 5\): area 25.`,
      code: `analytic.extrema("x*(10 - x)", [0, 10]).exact().filter((e) => e.kind === "max").map((e) => [e.at, e.value])`,
      expect: "[[5, 25]]",
    },
    {
      topic: "One-variable minimum",
      q: t`Find the minimum of \(f(x) = x^4 - 3x^3 + 2\).`,
      a: t`\(f'(x) = x^2(4x - 9)\): critical points 0 (not an extremum) and \(\tfrac94\). \(f(\tfrac94) = -\tfrac{1675}{256} \approx -6.5430\).`,
      code: `analytic.extrema("x^4 - 3*x^3 + 2", [-2, 4]).exact().filter((e) => e.kind === "min").map((e) => [e.at, e.value])`,
      expect: "[[9/4, -1675/256]]",
    },
    {
      topic: "Critical points in the plane",
      q: t`Find and classify the critical point of \(f = x^2 + xy + y^2 - 3x\).`,
      a: t`\(f_x = 2x + y - 3 = 0\), \(f_y = x + 2y = 0\): \((2, -1)\). The Hessian \(\begin{pmatrix}2&1\\1&2\end{pmatrix}\) is positive definite, so it is a minimum, \(f = -3\).`,
      code: `analytic.field("x^2 + x*y + y^2 - 3*x", ["x", "y"]).criticalPoints({ x: [-5, 5], y: [-5, 5] }).exact().map((c) => [c.kind, c.point.map((v) => Math.round(1e9 * ((v.low.toNumber() + v.high.toNumber()) / 2)) / 1e9), Math.round(1e9 * ((c.value.low.toNumber() + c.value.high.toNumber()) / 2)) / 1e9])`,
      expect: '[["min", [2, -1], -3]]',
    },
    {
      topic: "Second-derivative test",
      q: t`Classify the critical points of \(f = x^3 - 3x + y^2\).`,
      a: t`\(f_x = 3x^2 - 3\), \(f_y = 2y\): \((\pm1, 0)\). The Hessian is \(\operatorname{diag}(6x, 2)\): at \((1, 0)\) a minimum, at \((-1, 0)\) a saddle.`,
      code: `analytic.field("x^3 - 3*x + y^2", ["x", "y"]).criticalPoints({ x: [-3, 3], y: [-3, 3] }).exact().map((c) => [c.kind, Math.round((c.point[0].low.toNumber() + c.point[0].high.toNumber()) / 2)]).sort((a, b) => a[1] - b[1])`,
      expect: '[["saddle", -1], ["min", 1]]',
    },
    {
      topic: "Lagrange multipliers",
      q: t`Find the point of the line \(x + 2y = 5\) closest to the origin.`,
      a: t`Minimise \(x^2 + y^2\): \(2x = \lambda\), \(2y = 2\lambda\), so \(y = 2x\) and \(x = 1\), \(y = 2\); distance squared 5.`,
      code: `const mid = (v) => (v.low.toNumber() + v.high.toNumber()) / 2;
const r = analytic.lagrange("x^2 + y^2", "x + 2*y - 5", ["x", "y"], { x: [-10, 10], y: [-10, 10] });
const c = r.candidates[0];
[...Object.values(c.point).map(mid), mid(c.value), r.candidates.length]   // x, y, value, how many candidates`,
      check: near([1, 2, 5, 1], 1e-9),
      note: "The line is not bounded, so the library proves this is the only candidate in the box and leaves the minimum to the reader: <code>max</code>/<code>min</code> are only guaranteed on a closed bounded constraint set.",
    },
    {
      topic: "A constrained maximum",
      q: t`Maximise \(xyz\) on the plane \(x + y + z = 3\) with \(x, y, z > 0\).`,
      a: t`By symmetry (or AM–GM, \(\sqrt[3]{xyz} \le 1\)), the maximum is 1 at \((1, 1, 1)\).`,
      code: `const mid = (v) => (v.low.toNumber() + v.high.toNumber()) / 2;
const r = analytic.lagrange("x*y*z", "x + y + z - 3", ["x", "y", "z"], { x: ["1/2", 2], y: ["1/2", 2], z: ["1/2", 2] });
[...Object.values(r.candidates[0].point).map(mid), mid(r.candidates[0].value), r.candidates.length]   // x, y, z, value, how many candidates`,
      check: near([1, 1, 1, 1, 1], 1e-9),
    },
    {
      topic: "Convexity",
      q: t`Is \(f = 2x^2 + 2xy + 3y^2\) convex? Give the Hessian's eigenvalues.`,
      a: t`The Hessian \(\begin{pmatrix}4&2\\2&6\end{pmatrix}\) has eigenvalues \(5 \pm \sqrt5 \approx 2.7639, 7.2361\), both positive: strictly convex.`,
      code: `const H = [[4, 2], [2, 6]];
[linalg.definiteness(H).exact().kind, linalg.eigenvalues(H).exact().real.map((e) => e.value)]`,
      expectText: '"positive-definite", with eigenvalues 5 − √5 ≈ 2.763932 and 5 + √5 ≈ 7.236068',
      check: (v) => v[0] === "positive-definite" && Math.abs(v[1][0].toNumber() - (5 - Math.sqrt(5))) < 1e-9 && Math.abs(v[1][1].toNumber() - (5 + Math.sqrt(5))) < 1e-9,
    },
    {
      topic: "Least squares",
      q: t`Fit a line \(y = a + bx\) to \((0, 1), (1, 3), (2, 4), (3, 4)\) by least squares.`,
      a: t`\(\bar x = 1.5\), \(\bar y = 3\), \(S_{xy} = 5\), \(S_{xx} = 5\): \(b = 1\), \(a = 1.5\).`,
      code: `linalg.leastSquares([[1, 0], [1, 1], [1, 2], [1, 3]], [1, 3, 4, 4]).exact().x.toArray().flat()`,
      expect: "[3/2, 1]",
    },
    {
      topic: "Gradient descent",
      q: t`Take one gradient-descent step of size 0.1 from \((1, 1)\) on \(f = x^2 + 4y^2\).`,
      a: t`\(\nabla f = (2x, 8y) = (2, 8)\), so the step lands at \((1, 1) - 0.1(2, 8) = (0.8, 0.2)\).`,
      code: `const f = analytic.field("x^2 + 4*y^2", ["x", "y"]);
const g = f.gradient().map((c) => c.value({ x: 1, y: 1 }).exact());
[R\`1\`.subtract(R\`1/10\`.multiply(g[0].low)), R\`1\`.subtract(R\`1/10\`.multiply(g[1].low))]`,
      expect: "[4/5, 1/5]",
      status: "partial",
      note: "There is no descent routine: the step is taken by hand from the library's gradient.",
    },
    {
      topic: "Newton's method for a minimum",
      q: t`Take two Newton steps for minimising \(f(x) = x^2 - \ln x\) from \(x_0 = 1\). What is the exact minimiser?`,
      a: t`\(f' = 2x - 1/x\), \(f'' = 2 + 1/x^2\). \(x_1 = 1 - \tfrac{1}{3} = \tfrac23\), \(x_2 = \tfrac23 - \frac{4/3 - 3/2}{2 + 9/4} = \tfrac23 + \tfrac{2}{51} = \tfrac{12}{17} \approx 0.70588\). The minimiser is \(1/\sqrt2 \approx 0.707107\).`,
      code: `const r = analytic.newton("2*x - 1/x", 1);   // Newton's method on f'
[r.iterations[1].x, r.iterations[2].x, r.root]`,
      check: near([2 / 3, 12 / 17, Math.SQRT1_2], 1e-12),
      note: "The iterates are shown in floating point (\\(x_2 = 0.70588235\\ldots = 12/17\\)); the root is a proven enclosure.",
    },
    {
      topic: "Duality",
      q: t`Write the dual of: maximise \(x + y\) subject to \(x + 2y \le 4\), \(3x + y \le 6\), \(x, y \ge 0\); show both optimal values agree.`,
      a: t`Dual: minimise \(4u + 6v\) with \(u + 3v \ge 1\), \(2u + v \ge 1\), \(u, v \ge 0\). Primal optimum at \((\tfrac85, \tfrac65)\) is \(\tfrac{14}{5}\); dual optimum at \((\tfrac25, \tfrac15)\) is \(\tfrac{8}{5} + \tfrac65 = \tfrac{14}{5}\).`,
      code: `const p = discrete.linearProgram({ maximize: [1, 1], constraints: [[[1, 2], "<=", 4], [[3, 1], "<=", 6]] });
const d = discrete.linearProgram({ minimize: [4, 6], constraints: [[[1, 3], ">=", 1], [[2, 1], ">=", 1]] });
[p.value, p.x, d.value, d.x]`,
      expect: "[14/5, [8/5, 6/5], 14/5, [2/5, 1/5]]",
    },
  ],
};
