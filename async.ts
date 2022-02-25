import {
  _create_windi_shortcuts,
  _simple_hash,
  _sort_classes,
  CLASSES_REGEX,
  CLIOptions,
  NameCallback,
  td,
  te,
} from "./lib.ts";
import { readLines } from "https://deno.land/std@0.125.0/io/mod.ts";
import { crypto } from "https://deno.land/std@0.125.0/crypto/mod.ts";
import { encode as he } from "https://deno.land/std@0.125.0/encoding/hex.ts";
import {
  bgBlack,
  brightGreen,
  brightRed,
  inverse,
} from "https://deno.land/std@0.125.0/fmt/colors.ts";

// todo improve UX
export async function css_reducer(
  fileReader: Deno.File,
  namer: NameCallback | undefined,
  { order_default = true, windi = false, output }: CLIOptions = {},
) {
  let line_buffer = [];
  // _NAME_ just to spot quickly the data
  const _DATA_: string[][] = [];
  let cache: { [key: string]: string } = {};
  const opts = { order_default, windi };
  for await (const line of readLines(fileReader)) {
    let match;
    if (line_buffer.length > 0) {
      line_buffer.push(line);
      match = _matcher(line_buffer.join("\n"), namer, cache, opts);

      if (match) {
        cache = { ...cache, ...match.cache };
        _DATA_.push(match.data);
        line_buffer.length = 0;
      } else {
        line_buffer.push(line);
      }
    } else {
      match = _matcher(line, namer, cache, opts);
      if (match) {
        cache = { ...cache, ...match.cache };
        _DATA_.push(match.data);
      } else {
        line_buffer.push(line);
      }
    }
  }

  // todo
  if (output) {
    // Deno.writeTextFileSync(output_file, result.html);
  } else {
    // Deno.writeTextFileSync(filename, result.html);
  }

  if (windi) {
    _create_windi_shortcuts(_DATA_);
    return _DATA_;
  }
  return _DATA_;
}

function _matcher(
  html: string,
  namer: NameCallback | undefined,
  cache: { [key: string]: string } = {},
  { order_default = true }: CLIOptions = {},
) {
  // todo: not the best regex I bet
  const css = html.matchAll(CLASSES_REGEX);
  if (!css) return;

  for (let [_match, group] of css) {
    if (order_default) {
      group = _sort_classes(group.trim()).join(" ");
    }

    const hash: string = _simple_hash(group);

    if (namer) {
      const name = _name(html, group, hash, cache, namer);
      return { data: [name, group], cache: { [hash]: name } };
    } else {
      return { data: [hash, group], cache: { [hash]: group } };
    }
  }
}

function _name(
  html: string,
  group: string,
  hash: string,
  cache: { [key: string]: string },
  namer: NameCallback,
) {
  // todo: do something better for green log
  _naming_logs(html, group, hash, cache);
  const name = namer();
  return name;
}

function _naming_logs(
  html: string,
  group: string,
  hash: string,
  cache: { [key: string]: string },
) {
  const init = html.indexOf(group);
  const end = html.indexOf('"', html.indexOf(group, +1));
  if (hash in cache) {
    console.log(
      brightRed("Already in shortcuts as: ") + bgBlack(inverse(cache[hash])),
    );
  }

  console.log(
    html.slice(0, init) + brightGreen(html.slice(init, end)) + html.slice(end),
  );
}

async function _hash(group: string) {
  const data = await crypto.subtle.digest("SHA-384", te(group));
  const hash: string = td(he(new Uint8Array(data))).slice(0, 6);
  return hash;
}
