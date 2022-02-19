import { css_reducer_sync } from "./css_reducer.ts";
import { brightCyan } from "https://deno.land/std@0.125.0/fmt/colors.ts";

const [file, windi] = Deno.args;

if (file && windi === "--windi") {
  console.log(css_reducer_sync(file, { windi_shortcuts: true, cb: ask }));
} else if (file) {
  console.log(css_reducer_sync(file, { cb: ask }));
}

function ask() {
  const name = prompt(brightCyan("\nRefactor as: "));
  return name !== null ? name : "";
}
