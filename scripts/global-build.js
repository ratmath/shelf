// The Bun.build options for the browser file, shared by scripts/build.js
// (which writes dist/ratmath.global.js) and the tests (which build in memory).
export const GLOBAL_BUILD = {
  entrypoints: [new URL("./global-entry.js", import.meta.url).pathname],
  target: "browser",
  format: "iife",
  minify: { whitespace: true, syntax: true, identifiers: true, keepNames: true },
};
