// Entry for the browser bundle: a plain script tag gives a global `Ratmath`.
import Ratmath from "../index.js";

globalThis.Ratmath = Ratmath;
