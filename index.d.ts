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
export { algebraic, analytic, discrete, logic, structures, linalg, numtheory, geo, complex, chaos, stats, symbolic, graphics, finance };

export interface ShelfEntry {
  readonly name: string;
  readonly package: string;
  readonly included: boolean;
  readonly docs: string;
}

/** The RatMath Shelf libraries and whether this release includes them. */
export declare const shelf: readonly ShelfEntry[];

declare const Ratmath: Omit<typeof core, "default"> & {
  readonly core: typeof core;
  readonly algebraic: typeof algebraic;
  readonly analytic: typeof analytic;
  readonly discrete: typeof discrete;
  readonly logic: typeof logic;
  readonly structures: typeof structures;
  readonly linalg: typeof linalg;
  readonly numtheory: typeof numtheory;
  readonly geo: typeof geo;
  readonly complex: typeof complex;
  readonly chaos: typeof chaos;
  readonly stats: typeof stats;
  readonly symbolic: typeof symbolic;
  readonly graphics: typeof graphics;
  readonly finance: typeof finance;
  readonly shelf: readonly ShelfEntry[];
};
export default Ratmath;
