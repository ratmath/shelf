import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
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

test("the shelf list names every planned library, none included yet", () => {
  expect(shelf.map((s) => s.name)).toEqual([
    "algebraic", "analytic", "discrete", "logic",
    "structures", "linalg", "numtheory", "geo", "complex", "chaos", "stats",
    "symbolic", "graphics", "finance",
  ]);
  for (const s of shelf) {
    expect(s.package).toBe(`@ratmath/${s.name}`);
    expect(s.included).toBe(false);
    expect(s.name in Ratmath).toBe(false);
  }
  expect(Object.isFrozen(shelf)).toBe(true);
});

test("the browser bundle sets a global Ratmath", () => {
  const code = readFileSync(new URL("../dist/ratmath.global.js", import.meta.url), "utf8");
  const sandbox = {};
  runInNewContext(code, sandbox);
  const G = sandbox.Ratmath;
  expect(typeof G).toBe("object");
  expect(G.R`1/3 + 1/6`.toString()).toBe("1/2");
  expect(G.core.Rational).toBe(G.Rational);
  expect(G.shelf.length).toBe(14);
});
