import * as path from "https://deno.land/std@0.125.0/path/mod.ts";
import { css_reducer } from "./css_reducer.ts";
import {
    brightCyan
  } from "https://deno.land/std@0.125.0/fmt/colors.ts";
const [file, windi] = Deno.args;

if (file && windi === "--windi") {
    const filename = path.join(Deno.cwd(), file);
  const fileReader = await Deno.open(filename);
  await css_reducer(fileReader, ask, { windi_shortcuts: true });
} else if (file) {
  const filename = path.join(Deno.cwd(), file);
  const fileReader = await Deno.open(filename);
  console.log(await css_reducer(fileReader, ask));
}

function ask() {
  const name = prompt(brightCyan("Refactor as: "));
  return name !== null ? name : "";
}
