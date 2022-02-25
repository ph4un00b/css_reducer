import { css_reducer_sync } from "./css_reducer.ts";
import { brightCyan } from "https://deno.land/std@0.125.0/fmt/colors.ts";
import { parse } from "https://deno.land/std@0.125.0/flags/mod.ts";

start(parse(Deno.args));

export function start({ _, display, windi, unpack }: any) {
  const [first] = _;
  const file = first ? first.toString() : undefined;
  console.log(
    css_reducer_sync(file, { display, unpack, windi, callback: ask }),
  );
}

export function ask() {
  const name = prompt(brightCyan("\nRefactor as: "));
  return name !== null ? name : "";
}
