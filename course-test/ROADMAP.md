# Course Test follow-up roadmap

Written 2026-11-27 from a review of the Course Test (`docs/course-test/`), and
agreed with James the same day. It lists the work that would turn the
exercises that are not clean agreements into agreements, who should do each
piece, and in what order.

## Where things stand

Of 740 exercises, built against the packages' main branches:
668 agree, 61 partial, 10 can't yet (gap), 1 disagree, 0 error.

None of the 72 is a wrong answer. In a partial, RatMath computes the answer
but the step a textbook names is missing, so it is assembled by hand. A gap has
no RatMath answer. The one disagreement is the rounding convention.

Planned outcome of this roadmap:

| Route | Rows |
| --- | --- |
| Step 0: fix the Course Test itself | 6 |
| Opus batches A1 to A11 | 49 |
| Fable items B2 to B9 | 13 |
| Stay gaps (proofs about infinitely many objects) | 4 |

## Decisions already made (James, 2026-11-27)

- **Rounding.** Core keeps round-half-even as the default. Document it
  prominently, with the `"half-up"` example. The calculator app can default to
  half up through a setting. K–2 #8 then stays in the test as a documented
  convention.
- **`round()`, `floor()`, `ceil()` on Rational keep returning a bigint.** Core
  is published, so add exact variants under new names instead.
- **Strict partials are accepted as correct.** See Step 0.
- **Topology** is split: chain complexes in structures, everything else in geo
  (a geo phase with a `topology` export). A separate package only if knots or
  persistent homology are added later.

## Rules for every batch

- The split between Opus and Fable follows roadmap section 18: a piece is held
  for Fable when a subtle mathematical mistake could still pass its own tests.
- One PR per package per batch. Merge Shelf PRs with a normal merge, not squash.
- Every new function gets an independent check: a second method or a known
  textbook answer.
- Update the package's docs topic pages and typings (`index.d.ts`, no duplicate
  type names).
- No version bumps until the npm publishing work says it is finished. Sibling
  dependencies use caret ranges that accept main's version.
- Dependency direction: symbolic depends on analytic, never the reverse. stats
  depends on analytic and discrete, not on symbolic. geo depends on structures;
  discrete does not.
- After each merge: switch the Course Test rows to the new function, drop the
  `status` and rewrite the note, then rebuild with
  `bun scripts/build-course-tests.js --root <umbrella> --report`.

## Step 0: Course Test corrections (Opus, no library code)

Done 2026-11-27: 674 agree, 55 partial, 10 gap, 1 disagree, 0 error.

| Row | Change |
| --- | --- |
| Graph theory #10 Euler's formula | Use `discrete.planarity(g).faces[0].length` (it returns the faces per block; 6 for the cube) |
| Calculus 2 #19 Remainder bound | Evaluate the Taylor polynomial in the code |
| Geometry #13 Inscribed angles | Mark agree, keep the note |
| Differential equations #20 Newton's cooling | Mark agree, keep the note |
| Theory of computation #14 Minimisation | Mark agree, keep the note |
| Theory of computation #17 Ripple-carry adder | Mark agree, keep the note |

## Opus batches, easiest first

| # | Package | Work | Rows closed |
| --- | --- | --- | --- |
| A1 | core | Rounding docs; exact `round`/`floor`/`ceil` variants (new names); coins in units; `digits` and `placeValue`; clock formatter | K–2 #6, #8, #11, #12 |
| A2 | numtheory, structures, complex | `factorialValuation(n, p)`; `perm.sign()` and `isEven()`; `cauchyRiemann(u, v)`; Gauss–Wantzel inside `constructible` | Number theory #19, Abstract algebra 1 #3, Complex analysis #8, Abstract algebra 2 #18 (gap) |
| A3 | stats | `{ n, mean, sd }` in `meanInterval`; `{ n, variance }` in `varianceInterval`; closed-form `power`; `sampleSize` | High-school statistics #15, Statistics #6, #14, #15 |
| A4 | geo | `interiorAngle` and `angleSum`; `slopeIntercept` and `pointSlope`; tangent length; box, cylinder and similar solids; `circleFromEquation` | Grade 7 #16, Grade 8 #9, Geometry #4, #11, #14 |
| A5 | geo | 3D `Vector` (dot, cross, norm); `plane(p, q, r)` with normal, equation, distance | Calculus 3 #1, #2 |
| A6 | analytic, algebraic | `termsForError`; exact Newton; `darboux`; `toFixed` on algebraic numbers; `pde.classify` | Real analysis #6, #13, Calculus 1 #15, Grade 8 #4, PDE #1 |
| A7 | geo | `conic.properties()` for any conic | Precalculus #15, #16 |
| A8 | discrete, analytic | `transportation`; 0–1 bounds on `integerProgram`; vertices of the core; `gradientDescent` | Optimisation #9, #18, Game theory #12 |
| A9 | symbolic | Nine school helpers | Algebra 1 #3, #15, Algebra 2 #17, Precalculus #3, #6, #7, Calculus 1 #7, #18, Fourier analysis #6 |
| A10 | stats | `fromDensity`, `transform`, `orderStatistic` | Probability #7, #17, #18 |
| A11 | structures, geo | Topology phase | Topology #1, #9, #10, #11, #12, #14, #18, #20 |

### A1 notes

- New names for the exact variants, for example `roundInteger()`,
  `floorInteger()`, `ceilInteger()` returning an Integer. The existing methods
  are untouched.
- Coins: quarter, dime, nickel, penny and the cent, as units of the dollar.
- Clock formatter: a duration to `h:mm` and `h:mm:ss`, exact.

### A2 notes

- Gauss–Wantzel: cos(2π/n) is constructible exactly when φ(n) is a power of 2.
  `constructible` may use it only for a polynomial proven to be the minimal
  polynomial of cos(2π/n): compare with `algebraic.cosMinimal(n)` for the
  finitely many n with φ(n)/2 equal to the degree. Also offer
  `constructiblePolygon(n)`.

### A6. Analytic and algebraic helpers

- `termsForError(ε)` on an alternating series: the first n with
  |a(n+1)| ≤ ε, by bisection once the terms are proven decreasing. Check against
  partial sums.
- Exact Newton: an `exact: true` option on `analytic.newton` that keeps Core
  rationals and returns the iterates. Check against the float path.
- `darboux(f, partition)`: lower and upper sums. Where f is proven monotone on
  a piece, inf and sup are endpoint values and the sums are exact. Otherwise use
  certified extrema and label the result an enclosure. Check
  lower ≤ integral ≤ upper.
- `toFixed(k, mode)` on algebraic numbers: refine until the rounding is
  decided; ties are decided exactly.
- `pde.classify`: the sign of B² − 4AC, coefficients may depend on x and y,
  returning the region for each type.

### A7. Conic properties

Input: Ax² + Bxy + Cy² + Dx + Ey + F = 0, or a graphics curve recognised as a
conic.

1. Classify with the 3×3 determinant and B² − 4AC, including the degenerate
   cases (point, two lines, empty), which return their type and stop.
2. Centre from the linear system (ellipse, hyperbola); vertex and axis for a
   parabola.
3. Axes from the eigenvectors of the quadratic part. With B = 0 results are
   rational or a single square root; with B ≠ 0 return algebraic numbers.
4. Vertices, foci, eccentricity, directrices, and asymptotes for a hyperbola.
5. `circleFromEquation` (A4) is the special case.

Checks: the focal-sum or focal-difference property at exact points on the
curve; rotate a known axis-aligned conic by a 3-4-5 rotation and recover its
properties.

### A8. Optimisation helpers

- `transportation(supply, demand, cost)` builds the LP and returns the shipping
  table; unbalanced problems get a dummy row or column.
- 0–1 bounds as an option on `integerProgram`, so a knapsack is one call.
- Vertices of the core polytope by the exact LP, reporting empty, one point or
  larger.
- `gradientDescent` in analytic: fixed step and backtracking; exact rational
  iterates for polynomial objectives; exact line search for quadratics. Label
  it simulated.

### A9. Symbolic school helpers

One PR, nine independent parts. Every rewrite is still verified.

| Part | Notes |
| --- | --- |
| `completeSquare(expr, x)` | a(x − h)² + k and the vertex; verify by expanding |
| `compose(f, g)` | With a domain note when g leaves f's domain |
| `sinusoid(expr)` | A, B, C, D of A sin(Bx + C) + D; also rewrites a sin + b cos |
| Inverse trig table | arcsin, arccos, arctan at the standard exact values |
| `within(a, b)` on solution families | The members in an interval, exactly |
| RealSet `intersect`, `union`, `complement` | Then parse chained inequalities as an intersection |
| `implicitDiff(F, x, y)` | −Fx/Fy, second derivative on request |
| Leibniz rule | d/dx of an integral with variable limits |
| Constant factors in `sum` | Pull index-free factors out before matching known series |

### A10. Distributions from a density

Uses analytic's integration (stats does not depend on symbolic).

1. `fromDensity(f, support)`: prove f ≥ 0 and total mass 1 first (exactly for
   piecewise polynomials, within an enclosure otherwise) and refuse if not.
   Then CDF, moments, quantiles and inverse-CDF sampling.
2. `dist.transform(g)` for g proven monotone on the support. Non-monotone g is
   refused in this batch.
3. `dist.orderStatistic(k, n)` as a distribution.

Checks: rebuild uniform, exponential and beta through `fromDensity`; the
maximum of n uniforms is Beta(n, 1); simulate with the seeded generator.

### A11. Topology

About one ordinary Shelf phase. Build in this order.

| Part | Where | Contents | Closes |
| --- | --- | --- | --- |
| T1 Chain complexes | structures | `chainComplex(boundaryMatrices)`: checks ∂∂ = 0; homology with torsion; Betti numbers; Euler characteristic; coefficients Z, Q, Z/p | Topology #10, #11, #12 |
| T2 Glued polygons | geo | `surface("a b a^-1 b^-1")`: cell structure from an edge word; homology; χ; orientability; classification; connected sums; one-relator fundamental group | Topology #14, #18 |
| T3 Simplicial complexes | geo | From maximal simplices: boundary maps, f-vector, χ, homology; named examples (spheres, 7-vertex torus, 6-vertex projective plane); recognise a triangulated surface; complex of a graph or a polyhedron; π₁ presentation from a spanning tree | Topology #9, #20 |
| T4 Finite spaces | geo | Open sets on a finite set: axioms, closure, interior, bases, continuity, connectedness, T₀ and T₁, counting through preorders | Topology #1 |

Textbooks give surfaces as glued polygons, not triangulations, so T2 comes
before T3.

Checks: the homology of every named space is known; χ equals the alternating
sum of Betti numbers; H₁ equals the abelianised π₁; a surface gets the same
classification from its word and from a triangulation.

Not in this phase: knot invariants, persistent homology, covering spaces.

## Fable items, after Opus

| # | Package | Work | Rows closed |
| --- | --- | --- | --- |
| B1 | all | Review the Opus PRs for mathematical edge cases | none directly |
| B2 | analytic | Certified limits of f(n)^g(n) forms; the ratio test and `monotone()` use them | Real analysis #5 (gap), #20 |
| B3 | analytic | `nFor(ε)`, `deltaFor(x₀, ε)`, `supremum()` with certificates | Real analysis #2, #3, #9 |
| B4 | analytic | `limsup` and `liminf`; a plain "oscillates" refusal from `limit()` | Real analysis #17 (gap) |
| B5 | analytic | Uniform convergence decided both ways | Real analysis #16 (gap) |
| B6 | symbolic | `eliminate` by resultants; reversing the order of integration | Precalculus #17, Calculus 3 #9 |
| B7 | analytic | First-order PDEs by characteristics; exact finite-mode Laplace solutions | PDE #2, Fourier analysis #18 |
| B8 | chaos | Lyapunov exponent from the invariant density | Dynamical systems #6 |
| B9 | discrete | Genus of small graphs by rotation systems (optional, low value) | Topology #15 |

### B1. Review list

- Conics: degenerate and nearly degenerate cases, rotated parabolas, sign
  conventions for the hyperbola's axes.
- `fromDensity` and `transform`: improper supports, integrable singularities,
  the monotonicity proofs.
- Symbolic helpers: domains in `compose` and the inverse trig table, branch
  choices in `sinusoid`.
- `darboux`: the label when monotonicity is not proven.
- Gauss–Wantzel: applied only to proven cos(2π/n) minimal polynomials.
- Topology: orientation conventions in boundary maps; non-manifold input to the
  surface recogniser.

### B2 to B5. Analysis certificates

Built in this order; each uses the one before.

1. **B2.** Extend analytic's limit engine to f(n)^g(n) through exp(g ln f) with
   a certified enclosure of the exponent near infinity. Gives the ratio limit
   1/e for n!/nⁿ and a proof that (1 + 1/n)ⁿ increases. This must live in
   analytic; calling `symbolic.limit` would create a dependency loop.
2. **B3.** `nFor(ε)` returns N and the proof that |a(n) − L| < ε for n ≥ N: a
   monotone tail bound where there is one, otherwise an explicit dominating
   sequence. `deltaFor(x₀, ε)` returns a δ checked by an interval enclosure, and
   the exact largest δ for polynomials. `supremum()` says whether it is
   attained. Each result carries a certificate a separate checker verifies.
3. **B4.** Split a sequence with periodic factors into finitely many
   subsequences, take each limit, return the largest and smallest. Refuse with
   a plain reason otherwise.
4. **B5.** Enclose sup|fₙ − f| as a function of n (exactly when the difference
   is monotone in x), then prove it tends to 0, or stays above a positive
   constant. Answers: uniform, not uniform, undecided, each with its reason.

### B6 to B8

- `eliminate`: resultants from structures, with sin and cos as s and c and
  s² + c² = 1. Test each factor of the resultant against the parametrisation and
  return only the true curve, noting when only part of it is covered.
- Reversing the order of integration: a region type holding its bounds as
  functions; reversal may split the region. Check that both iterated integrals
  agree.
- Characteristics: constant coefficients first, then variable ones through the
  ODE solver, stating where characteristics do not cross.
- Finite-mode Laplace: a trigonometric-polynomial boundary gives a finite
  series and an exact answer.
- Lyapunov: for the logistic map at r = 4, the integral of ln|f′(x)| against
  the invariant density 1/(π√(x(1 − x))), which is exactly ln 2. A certified
  integral for maps with a known invariant density, not a general conjugacy
  detector.

## Staying gaps

Theory of computation #10 (pumping lemma) and #15 (halting problem), Topology
#3 (a bounded metric) and #4 (connectedness and compactness). The pages
already say why.
