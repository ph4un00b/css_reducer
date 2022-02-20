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
import {
  _css_classes,
  _simple_hash,
  _sort_classes_list,
  ClassName,
} from "./lib.ts";

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
  cb?: NameCallback,
  prefix?: PrefixCallback,
) {
  let pointer = 0;
  const html: string[] = [];
  const data: string[][] = [];

  for (const classname of _css_classes(input_html, CLASSES_REGEX)) {
    html.push(_chunk_before(input_html, pointer, classname.start));

    let raw_class = classname.result.trim();
    if (order_default) {
      raw_class = _sort_classes_list(raw_class).join(" ");
    }

    cb ? console.clear() : _noop();
    cb ? _logs(input_html, classname) : _noop();
    cb
      ? data.push(_data_from_cb(cb, raw_class))
      : data.push(_data_with_hash(raw_class, prefix));

    if (prefix) {
      html.push(prefix() + "-" + _chunk_class(raw_class));
    } else if (cb) {
      html.push(cb());
    } else {
      html.push(_chunk_class(raw_class));
    }

    pointer = classname.end;
  }

  html.push(_chunk_after(input_html, pointer));
  return { data, html: html.join("") };
}

function _chunk_after(input_html: string, pointer: number): string {
  return input_html.substring(pointer);
}

function _chunk_class(raw_class: string): string {
  return [_simple_hash(raw_class)].join(" ");
}

function _data_with_hash(raw_class: string, prefix?: PrefixCallback): string[] {
  if (prefix) {
    return [prefix() + "-" + _simple_hash(raw_class), raw_class];
  }
  return [_simple_hash(raw_class), raw_class];
}

function _data_from_cb(cb: NameCallback, raw_class: string): string[] {
  return [cb() ?? "", raw_class];
}

function _noop() {
  return () => {};
}

function _chunk_before(html: string, from: number, until: number) {
  return _chunk(html, { from, until });
}
function _logs(
  html: string,
  classname: { result: string; start: number; end: number },
) {
  _log_chunk_before(classname, 300, html);
  _log_class(html, classname);
  _log_chunk_after(html, classname, 300);
}

function _log_chunk_after(
  html: string,
  classname: { result: string; start: number; end: number },
  FRAME: number,
) {
  l(_chunk(html, { from: classname.end, until: classname.end + FRAME }));
}

function _log_class(
  html: string,
  classname: { result: string; start: number; end: number },
) {
  l(brightGreen(_chunk(html, { from: classname.start, until: classname.end })));
}

function _log_chunk_before(
  classname: { result: string; start: number; end: number },
  FRAME: number,
  html: string,
) {
  if (classname.start > FRAME) {
    l(_chunk(html, { from: classname.start - FRAME, until: classname.start }));
  } else {
    l(_chunk(html, { from: 0, until: classname.start }));
  }
}

function _chunk(html: string, chunk: { from: number; until: number }): string {
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
