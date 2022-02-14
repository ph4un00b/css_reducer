import { crypto } from "https://deno.land/std@0.125.0/crypto/mod.ts";
import { encode as he } from "https://deno.land/std@0.125.0/encoding/hex.ts";
import * as path from "https://deno.land/std@0.125.0/path/mod.ts";
import { readLines } from "https://deno.land/std@0.125.0/io/mod.ts";
import {
  bgBlack,
  brightGreen,
  brightRed,
  inverse,
} from "https://deno.land/std@0.125.0/fmt/colors.ts";
import { _match_classes, _simple_hash, _sort_classes_list } from "./lib.ts";

const te = (s: string) => new TextEncoder().encode(s);
const td = (d: Uint8Array) => new TextDecoder().decode(d);
export type Namer = (message?: string) => string;
type Options = {
  order_default?: boolean;
  order_tailwind?: boolean;
  windi_shortcuts?: boolean;
};

const _CLASSES_REGEX = /class="\s*([a-z:A-Z\s\-\[\#\d\.\%\]]+)\s*"/g;

export function css_reducer_sync(
  html: string,
  namer: Namer | undefined,
  { order_default = true, windi_shortcuts = false }: Options = {}
) {
  const _DATA_: string[][] = _matcher_sync(html, order_default, namer);
  if (windi_shortcuts) {
    _create_windi_shortcuts(_DATA_);
    return _DATA_;
  }
  return _DATA_;
}

function _matcher_sync(
  html: string,
  order_default: boolean,
  namer?: Namer
) {
  const FRAME = 300;
  const _DATA_: string[][] = [];
  for (const match of _match_classes(html, _CLASSES_REGEX)) {
    // console.log(">>>>>>>> ",brightRed(match.result))
    let group = match.result.trim();
    if (order_default) {
      group = _sort_classes_list(group).join(" ");
    }
    const hash: string = _simple_hash(group);
    console.clear();

    if (namer) {
      if (match.start > FRAME) {
        l(html.substring(match.start - FRAME, match.start));
      } else {
        l(html.substring(0, match.start));
      }

      l(brightGreen(html.substring(match.start, match.end)));
      l(html.substring(match.end, match.end + FRAME));
      const name = namer() ?? "";

      _DATA_.push([name, group]);
    } else {
      _DATA_.push([hash, group]);
    }
  }
  return _DATA_;
}

function l(s: string) {
  Deno.stdout.writeSync(te(s));
}

// todo improve UX
export async function css_reducer(
  fileReader: Deno.File,
  namer: Namer | undefined,
  { order_default = true, windi_shortcuts = false }: Options = {}
) {
  let line_buffer = [];
  // _NAME_ just to spot quickly the data
  const _DATA_: string[][] = [];
  let cache: { [key: string]: string } = {};
  const opts = { order_default, windi_shortcuts };
  for await (const line of readLines(fileReader)) {
    let match;
    if (line_buffer.length > 0) {
      line_buffer.push(line);
      match = _matcher(line_buffer.join("\n"), namer, cache, opts);

      if (match) {
        cache = { ...cache, ...match.cache };
        _DATA_.push(match.data);
        line_buffer = [];
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

  if (windi_shortcuts) {
    _create_windi_shortcuts(_DATA_);
    return _DATA_;
  }
  return _DATA_;
}

function _matcher(
  html: string,
  namer: Namer | undefined,
  cache: { [key: string]: string } = {},
  { order_default = true }: Options = {}
) {
  // todo: not the best regex I bet
  const css = html.matchAll(_CLASSES_REGEX);
  if (!css) return;

  for (let [_match, group] of css) {
    if (order_default) {
      group = _sort_classes_list(group.trim()).join(" ");
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
  namer: Namer
) {
  // todo: do something better for green log
  // _naming_logs(html, group, hash, cache);
  const name = namer();
  return name;
}

function _naming_logs(
  html: string,
  group: string,
  hash: string,
  cache: { [key: string]: string }
) {
  const init = html.indexOf(group);
  const end = html.indexOf('"', html.indexOf(group, +1));
  if (hash in cache) {
    console.log(
      brightRed("Already in shorcuts as: ") + bgBlack(inverse(cache[hash]))
    );
  }

  console.log(
    html.slice(0, init) + brightGreen(html.slice(init, end)) + html.slice(end)
  );
}

async function _hash(group: string) {
  const data = await crypto.subtle.digest("SHA-384", te(group));
  const hash: string = td(he(new Uint8Array(data))).slice(0, 6);
  return hash;
}

function _create_windi_shortcuts(classes: string[][]) {
  const shotcuts: { [key: string]: string } = {};

  for (const [hash, string] of classes) {
    shotcuts[hash] = string;
  }

  Deno.writeTextFileSync(
    path.join(Deno.cwd(), "shortcuts.json"),
    JSON.stringify(shotcuts, undefined, 2)
  );
}
