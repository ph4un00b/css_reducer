import { css_reducer_sync } from "./css_reducer.ts";
import { brightCyan } from "https://deno.land/std@0.125.0/fmt/colors.ts";
import { parse } from "https://deno.land/std@0.125.0/flags/mod.ts";

const { _, display, windi, unpack } = parse(Deno.args);
const [first] = _;
const file = first ? first.toString() : undefined;

if (display && windi) {
  console.log(css_reducer_sync(undefined, { windi: true, display: true }));
} else if (display) {
  console.log(css_reducer_sync(undefined, { display: true }));
} else if (file && windi && unpack) {
  console.log(css_reducer_sync(file, { unpack: true, windi: true }));
} else if (file && unpack) {
  console.log(css_reducer_sync(file, { unpack: true }));
} else if (file && windi) {
  console.log(css_reducer_sync(file, { windi: true, callback: ask }));
} else if (file) console.log(css_reducer_sync(file, { callback: ask }));

function ask() {
  const name = prompt(brightCyan("\nRefactor as: "));
  return name !== null ? name : "";
}
