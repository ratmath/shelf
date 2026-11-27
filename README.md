# ratmath

All of RatMath in one import: [RatMath Core](https://ratmath.com/core/) (exact
integers, fractions and rational intervals) and the subject libraries of the
[RatMath Shelf](https://ratmath.com/shelf/), each under its own name.

```sh
npm install ratmath
```

```js
import * as Ratmath from "ratmath";      // one object, still tree-shaken

Ratmath.R`1/3 + 1/6`;                     // 1/2, exactly
// Ratmath.linalg, Ratmath.stats, ... as each library is published
```

The first releases hold Core only. Each Shelf library joins as soon as it is on
npm; `Ratmath.shelf` lists all fourteen and says which this release includes.

## Ways in

| Form | Gives |
| --- | --- |
| `import * as Ratmath from "ratmath"` | One object; bundlers keep only what is used. Start here. |
| `import { R, Rational, core } from "ratmath"` | Just the names you use. |
| `import Ratmath from "ratmath"` | A plain frozen object with everything. Handy in scripts and notebooks; bundlers keep all of it. |
| `import { Rational } from "ratmath/core"` | One library only (`ratmath/<library>` as each joins). |
| `<script src="https://cdn.jsdelivr.net/npm/ratmath/dist/ratmath.global.js">` | A global `Ratmath` in a page with no build step. |

All of these hand out the libraries' own objects, never copies, so a
`Rational` from `ratmath` is a `Rational` to every library.

## Versions

- Each library keeps its own version number.
- The libraries list `@ratmath/core` as a peer dependency with an explicit
  range (`">=0.10.0 <0.12.0"`), so a program has exactly one Core.
- `ratmath` follows Core: `ratmath` 0.11 is Core 0.11 plus library versions
  tested with it.

## This repository

- `index.js`, `index.d.ts`: the package. `core.js`: the `ratmath/core` subpath.
- `scripts/build.js`: builds `dist/ratmath.global.js` (not committed; built by
  `bun run build`, and before every publish).
- `tests/`: checks every way in against Core itself, including the browser file.
- `docs/`: the site at [ratmath.com/shelf](https://ratmath.com/shelf/), served by
  GitHub Pages from `main`, `/docs`.

```sh
bun install
bun run test          # builds dist/, then runs the tests
bun run docs:build    # builds docs/ and runs every page's code box
```

### The Shelf page

`docs/index.html` is the Shelf page itself, written by hand (it has its own
styles and no build step). "On the shelf" has one `<article class="pkg">` per
library and one `<li>` per topic, each linking to that topic's documentation
page. "Planned" mirrors the roadmap in `ratmath/ratmath`
(`docs/design/library-roadmap.md`).

When a planned topic is built and its documentation page exists, move it: add
its `<li>` with the link under "On the shelf" (adding the library's article if
it is the library's first topic), and remove it from "Planned" here and from
the roadmap. A topic is never listed as available before its page is live.

The other pages are written in `docs/src/` and built into `docs/` by
`bun run docs:build`, with the runnable code box shared with the library docs
sites (`docs/assets/runbox.js`, `scripts/docs-kit.js`: keep them in step with
the other repositories). Add each new page to `PAGES` in `docs/assets/site.js`.

### PDFs of the docs

`bun run pdf` prints every library's docs site to PDF, and joins them into one
PDF of the whole Shelf. It runs locally only, typically before an npm publish,
and writes to `pdf/`, which is gitignored: the PDFs are never committed.

It expects each library as a sibling checkout of this repository, with its
docs built, and Google Chrome installed (it drives Chrome through
`playwright-core`; set `CHROME_PATH` to use another Chromium-based browser):

```text
ai-repos/
  shelf/        this repository
  algebraic/    git clone https://github.com/ratmath/algebraic
  analytic/
  ...           all fourteen libraries
```

```sh
# in each library you want fresh: bun install && bun run docs:build
bun install
bun run pdf                  # all fourteen libraries, then the Shelf PDF (about 5 minutes)
bun run pdf linalg stats     # just these, then the Shelf PDF again
bun run pdf --combine        # only rebuild the Shelf PDF and the list
bun run pdf --from ~/elsewhere   # libraries in another folder
open pdf/index.html          # what was built, with version, commit and date
```

Each page is opened in Chrome so the demos appear and every code box runs, so
the PDF shows their output. Each PDF gets a cover (version, commit, build
time), a contents page with page numbers, bookmarks and page numbers. The
output:

- `pdf/<library>.pdf`, one per library.
- `pdf/ratmath-shelf.pdf`, all of them, with a bookmark per library and page.
- `pdf/index.html`, a list of the PDFs with the version, commit and date each
  was built from (`pdf/manifest.json` holds the same data). A `*` after a
  commit means the library had uncommitted changes to its docs or source.

### Adding a library when it is published

1. Add `"@ratmath/<name>": "^x.y.z"` to `dependencies`.
2. In `index.js` and `index.d.ts`: `import * as <name> from "@ratmath/<name>"`,
   export it, add it to the default object, and set `included: true` in `shelf`.
3. Add a `./<name>` subpath (a one-line `<name>.js` re-export, like `core.js`).
4. Extend the tests, and the "What is in this release" text in `docs/src/using.html`.

## Licence

MIT
