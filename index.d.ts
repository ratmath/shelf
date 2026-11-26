import * as core from "@ratmath/core";

export * from "@ratmath/core";
export { core };

export interface ShelfEntry {
  readonly name: string;
  readonly package: string;
  readonly included: boolean;
  readonly docs: string;
}

/** The RatMath Shelf libraries and whether this release includes them yet. */
export declare const shelf: readonly ShelfEntry[];

declare const Ratmath: Omit<typeof core, "default"> & { readonly core: typeof core; readonly shelf: readonly ShelfEntry[] };
export default Ratmath;
