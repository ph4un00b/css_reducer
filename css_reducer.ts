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
import { _css_classes, _simple_hash, _sort_classes, ClassName } from "./lib.ts";

function te(s: string) {
  return new TextEncoder().encode(s);
}
function td(d: Uint8Array) {
  return new TextDecoder().decode(d);
}
export type NameCallback = (message?: string) => string;
export type PrefixCallback = () => string;

type CLIOptions = {
  order_default?: boolean;
  order_tailwind?: boolean;
  windi_shortcuts?: boolean;
  output_file?: string;
  cb?: NameCallback;
  prefix?: PrefixCallback;
};

const CLASSES_REGEX = /class="\s*([a-z:A-Z\s\-\[\#\d\.\%\]]+)\s*"/g;

export function css_reducer_sync(
  filename: string,
  options: CLIOptions = {},
) {
  const {
    order_default = true,
    windi_shortcuts = false,
    output_file,
    cb,
    prefix,
  } = options;
  const { data, html } = _process(_html(filename), order_default, cb, prefix);

  output_file
    ? Deno.writeTextFileSync(output_file, html)
    : Deno.writeTextFileSync(filename, html);

  windi_shortcuts && _create_windi_shortcuts(data);

  return data;
}

function _html(filename: string) {
  const filepath = path.join(Deno.cwd(), filename);
  const html = Deno.readTextFileSync(filepath);
  return html;
}

function _process(
  input_html: string,
  order_default: boolean,
  callback?: NameCallback,
  prefix?: PrefixCallback,
) {
  let pointer = 0;
  const html: string[] = [];
  const data: string[][] = [];

  for (const class_line of _css_classes(input_html, CLASSES_REGEX)) {
    const before = { from: pointer, until: class_line.start };
    html.push(_chunk_before(input_html, before));

    let raw_classes = class_line.result.trim();
    if (order_default) {
      raw_classes = _sort_classes(raw_classes).join(" ");
    }

    if (callback) {
      console.clear();
      _logs(input_html, class_line);
      data.push(_data_from_cb(callback, raw_classes));
    } else {
      data.push(_data_with_hash(raw_classes, prefix));
    }

    if (prefix) {
      html.push(prefix() + "-" + _chunk_class(raw_classes));
    } else if (callback) {
      html.push(callback());
    } else {
      html.push(_chunk_class(raw_classes));
    }

    pointer = class_line.end;
  }

  html.push(_chunk_after(input_html, pointer));
  return { data, html: html.join("") };
}

function _chunk_after(input_html: string, pointer: number): string {
  return input_html.substring(pointer);
}

function _chunk_class(name: string): string {
  return [_simple_hash(name)].join(" ");
}

function _data_with_hash(name: string, prefix?: PrefixCallback): string[] {
  if (prefix) {
    return [prefix() + "-" + _simple_hash(name), name];
  }
  return [_simple_hash(name), name];
}

function _data_from_cb(cb: NameCallback, name: string): string[] {
  return [cb() ?? "", name];
}

function _noop() {
  return () => {};
}

function _chunk_before(html: string, chunk: Chunk) {
  return _chunk(html, chunk);
}
function _logs(
  html: string,
  name: ClassName,
) {
  _log_chunk_before(name, 300, html);
  _log_class(html, name);
  _log_chunk_after(html, name, 300);
}

function _log_chunk_after(
  html: string,
  name: ClassName,
  FRAME: number,
) {
  const chunk = { from: name.end, until: name.end + FRAME };
  l(_chunk(html, chunk));
}

function _log_class(
  html: string,
  name: ClassName,
) {
  const chunk = { from: name.start, until: name.end };
  l(brightGreen(_chunk(html, chunk)));
}

function _log_chunk_before(
  name: ClassName,
  FRAME: number,
  html: string,
) {
  if (name.start > FRAME) {
    const chunk = { from: name.start - FRAME, until: name.start };
    l(_chunk(html, chunk));
  } else {
    const chunk = { from: 0, until: name.start };
    l(_chunk(html, chunk));
  }
}

type Chunk = { from: number; until: number };
function _chunk(html: string, chunk: Chunk): string {
  return html.substring(chunk.from, chunk.until);
}

function l(s: string) {
  Deno.stdout.writeSync(te(s));
}

// todo improve UX
export async function css_reducer(
  fileReader: Deno.File,
  namer: NameCallback | undefined,
  { order_default = true, windi_shortcuts = false, output_file }: CLIOptions =
    {},
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
  if (output_file) {
    // Deno.writeTextFileSync(output_file, result.html);
  } else {
    // Deno.writeTextFileSync(filename, result.html);
  }

  if (windi_shortcuts) {
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
  // _naming_logs(html, group, hash, cache);
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
      brightRed("Already in shorcuts as: ") + bgBlack(inverse(cache[hash])),
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

function _create_windi_shortcuts(classes: string[][]) {
  const shotcuts: { [key: string]: string } = {};

  for (const [hash, string] of classes) {
    shotcuts[hash] = string;
  }

  Deno.writeTextFileSync(
    path.join(Deno.cwd(), "shortcuts.json"),
    JSON.stringify(shotcuts, undefined, 2),
  );
}
