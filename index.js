// ratmath: all of RatMath in one import.
//
//   import * as Ratmath from "ratmath";   // one object, still tree-shaken
//   import { Rational, core } from "ratmath";
//   import Ratmath from "ratmath";        // a plain object with everything (not tree-shaken)
//
// Core's names sit at the top level and also under `core`. Each RatMath Shelf
// library joins as its own namespace (`Ratmath.linalg`, `Ratmath.stats`, ...)
// once it is published on npm; see `shelf` for the list and its state.
import * as core from "@ratmath/core";

export * from "@ratmath/core";
export { core };

/** The RatMath Shelf libraries and whether this release includes them yet. */
export const shelf = Object.freeze(
  [
    "algebraic", "analytic", "discrete", "logic",
    "structures", "linalg", "numtheory", "geo", "complex", "chaos", "stats",
    "symbolic", "graphics", "finance",
  ].map((name) => Object.freeze({ name, package: `@ratmath/${name}`, included: false, docs: `https://ratmath.com/${name}/` })),
);

const { default: _coreDefault, ...coreNames } = core;
const Ratmath = Object.freeze({ ...coreNames, core, shelf });
export default Ratmath;
