import { expect, test } from "bun:test";
import { GLOBAL_BUILD } from "../scripts/global-build.js";
import { runInNewContext } from "node:vm";
import * as Ratmath from "../index.js";
import RatmathDefault, { Rational, core, shelf } from "../index.js";
import * as Core from "@ratmath/core";
import * as CoreOnly from "../core.js";

test("named imports are Core's own exports, not copies", () => {
  expect(Rational).toBe(Core.Rational);
  expect(Ratmath.R).toBe(Core.R);
  expect(core.Integer).toBe(Core.Integer);
  expect(CoreOnly.RationalInterval).toBe(Core.RationalInterval);
});

test("every Core name is reachable three ways", () => {
  for (const name of Object.keys(Core)) {
    if (name === "default") continue;
    expect(Ratmath[name]).toBe(Core[name]);
    expect(Ratmath.core[name]).toBe(Core[name]);
    expect(RatmathDefault[name]).toBe(Core[name]);
  }
});

test("the default object holds everything and cannot be changed", () => {
  expect(RatmathDefault.core).toBe(core);
  expect(RatmathDefault.shelf).toBe(shelf);
  expect("default" in RatmathDefault).toBe(false);
  expect(Object.isFrozen(RatmathDefault)).toBe(true);
  expect(new RatmathDefault.Rational(1, 3).add(new Core.Rational(1, 6)).toString()).toBe("1/2");
});

const LIBS = [
  "algebraic", "analytic", "discrete", "logic",
  "structures", "linalg", "numtheory", "geo", "complex", "chaos", "stats",
  "symbolic", "graphics", "finance",
];

test("the shelf list names every library, all included", () => {
  expect(shelf.map((s) => s.name)).toEqual(LIBS);
  for (const s of shelf) {
    expect(s.package).toBe(`@ratmath/${s.name}`);
    expect(s.included).toBe(true);
  }
  expect(Object.isFrozen(shelf)).toBe(true);
});

test("each library is its own namespace, three ways in, never a copy", async () => {
  for (const name of LIBS) {
    const lib = await import(`@ratmath/${name}`);
    const sub = await import(`../${name}.js`);
    expect(Ratmath[name]).toBe(lib);
    expect(RatmathDefault[name]).toBe(lib);
    for (const key of Object.keys(lib)) expect(sub[key]).toBe(lib[key]);
  }
});

test("no library name hides a Core name", () => {
  for (const name of LIBS) expect(name in Core).toBe(false);
});

test("the libraries share Core's Rational", () => {
  const x = Ratmath.linalg.Matrix.from([[1, "1/2"], [0, 3]]).get(0, 1);
  expect(x instanceof Core.Rational).toBe(true);
  expect(x.add(new Ratmath.Rational(1, 2)).toString()).toBe("1");
});

test("the browser bundle sets a global Ratmath", async () => {
  // Built in memory with the same options as dist/ratmath.global.js, so the
  // test needs no build step first (the umbrella runs it with plain bun test).
  const out = await Bun.build(GLOBAL_BUILD);
  expect(out.success).toBe(true);
  const code = await out.outputs[0].text();
  const sandbox = {};
  runInNewContext(code, sandbox);
  const G = sandbox.Ratmath;
  expect(typeof G).toBe("object");
  expect(G.R`1/3 + 1/6`.toString()).toBe("1/2");
  expect(G.core.Rational).toBe(G.Rational);
  expect(G.shelf.length).toBe(14);
  for (const name of LIBS) expect(typeof G[name]).toBe("object");
});
