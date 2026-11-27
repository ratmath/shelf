// Type-checked in CI with tsc --strict and no skipLibCheck, so a clash or error
// in any library's index.d.ts fails here before it reaches npm.
import * as Ratmath from "ratmath";
import Default, { core, shelf, linalg } from "ratmath";
import { Matrix } from "ratmath/linalg";
import { Rational } from "ratmath/core";

const m: Matrix = Ratmath.linalg.Matrix.from([[1, "1/2"], [0, 3]]);
const same: typeof linalg = Default.linalg;
const r: Rational = new Ratmath.Rational(1, 3);
const names: string[] = shelf.map((s) => s.name);
export { m, same, r, names, core };
export const libraries = [
  Ratmath.algebraic, Ratmath.analytic, Ratmath.chaos, Ratmath.complex, Ratmath.discrete,
  Ratmath.finance, Ratmath.geo, Ratmath.graphics, Ratmath.linalg, Ratmath.logic,
  Ratmath.numtheory, Ratmath.stats, Ratmath.structures, Ratmath.symbolic,
];
