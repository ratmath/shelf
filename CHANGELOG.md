# Changelog

## 0.11.0

- All fourteen RatMath Shelf libraries are in: `Ratmath.algebraic`,
  `.analytic`, `.chaos`, `.complex`, `.discrete`, `.finance`, `.geo`,
  `.graphics`, `.linalg`, `.logic`, `.numtheory`, `.stats`, `.structures` and
  `.symbolic`, in the default object and the browser global too, and each at
  its own subpath (`ratmath/linalg`, ...). They are the libraries' own objects,
  never copies, and all share one Core.
- Core 0.11 (`^0.11.1`): `ratmath` now follows Core's minor version.
- `scripts/check-ranges.js`, run in CI: checks that the libraries' published
  version ranges fit together, so `npm install ratmath` always resolves.

## 0.0.1

- First release, to hold the name: `ratmath` re-exports RatMath Core
  (`@ratmath/core` 0.10 or 0.11) at the top level, as `core`, as a default
  object and at `ratmath/core`, and ships `dist/ratmath.global.js` for a
  plain script tag. `shelf` lists the fourteen Shelf libraries, none included yet.
