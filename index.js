// ratmath: all of RatMath in one import.
//
//   import * as Ratmath from "ratmath";   // one object, still tree-shaken
//   import { Rational, core } from "ratmath";
//   import Ratmath from "ratmath";        // a plain object with everything (not tree-shaken)
//
// Core's names sit at the top level and also under `core`. Each RatMath Shelf
// library is its own namespace (`Ratmath.linalg`, `Ratmath.stats`, ...), never
// merged into the top level: some names (factor, format, norm, ...) mean different things
// in different libraries. `shelf` lists them all.
import * as core from "@ratmath/core";
import * as algebraic from "@ratmath/algebraic";
import * as analytic from "@ratmath/analytic";
import * as discrete from "@ratmath/discrete";
import * as logic from "@ratmath/logic";
import * as structures from "@ratmath/structures";
import * as linalg from "@ratmath/linalg";
import * as numtheory from "@ratmath/numtheory";
import * as geo from "@ratmath/geo";
import * as complex from "@ratmath/complex";
import * as chaos from "@ratmath/chaos";
import * as stats from "@ratmath/stats";
import * as symbolic from "@ratmath/symbolic";
import * as graphics from "@ratmath/graphics";
import * as finance from "@ratmath/finance";

export * from "@ratmath/core";
export { core };
export {
  algebraic,
  analytic,
  discrete,
  logic,
  structures,
  linalg,
  numtheory,
  geo,
  complex,
  chaos,
  stats,
  symbolic,
  graphics,
  finance,
};

/** The RatMath Shelf libraries and whether this release includes them. */
export const shelf = Object.freeze(
  [
    "algebraic", "analytic", "discrete", "logic",
    "structures", "linalg", "numtheory", "geo", "complex", "chaos", "stats",
    "symbolic", "graphics", "finance",
  ].map((name) => Object.freeze({ name, package: `@ratmath/${name}`, included: true, docs: `https://ratmath.com/${name}/` })),
);

const { default: _coreDefault, ...coreNames } = core;
const Ratmath = Object.freeze({
  ...coreNames,
  core,
  algebraic,
  analytic,
  discrete,
  logic,
  structures,
  linalg,
  numtheory,
  geo,
  complex,
  chaos,
  stats,
  symbolic,
  graphics,
  finance,
  shelf,
});
export default Ratmath;
