import { css_reducer_sync } from "./css_reducer.ts";
import { brightCyan } from "https://deno.land/std@0.125.0/fmt/colors.ts";

const [file, windi] = Deno.args;

if (file && windi === "--windi") {
  console.log(css_reducer_sync(file, ask, { windi_shortcuts: true }));
} else if (file) {
  console.log(css_reducer_sync(file, ask));
}

function ask() {
  const name = prompt(brightCyan("\nRefactor as: "));
  return name !== null ? name : "";
}
