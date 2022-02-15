import * as path from "https://deno.land/std@0.125.0/path/mod.ts";
import { css_reducer_sync } from "./css_reducer.ts";
import {
  brightCyan,
  brightGreen,
} from "https://deno.land/std@0.125.0/fmt/colors.ts";

const [file, windi] = Deno.args;

if (file && windi === "--windi") {
  const filename = path.join(Deno.cwd(), file);
  const html = Deno.readTextFileSync(filename);
  console.log(css_reducer_sync(html, ask, { windi_shortcuts: true }));
} else if (file) {
  const filename = path.join(Deno.cwd(), file);
  const html = Deno.readTextFileSync(filename);
  console.log(css_reducer_sync(html, ask));
}

function ask() {
  const name = prompt(brightCyan("\nRefactor as: "));
  return name !== null ? name : "";
}
