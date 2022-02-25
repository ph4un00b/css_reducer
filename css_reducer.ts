import * as path from "https://deno.land/std@0.125.0/path/mod.ts";

import { brightGreen } from "https://deno.land/std@0.125.0/fmt/colors.ts";

import {
  _create_windi_shortcuts,
  _css_classes,
  _simple_hash,
  _sort_classes,
  CLASSES_REGEX,
  ClassName,
  CLIOptions,
  NameCallback,
  PrefixCallback,
  te,
} from "./lib.ts";

export function css_reducer_sync(
  filename: string,
  options: CLIOptions = {},
) {
  const {
    order_default = true,
    windi = false,
    output,
    callback,
    prefix,
    unpack = false,
  } = options;

  if (unpack) {
    let styles_stack;
    if (windi) {
      const shortcuts: { [key: string]: string } = JSON.parse(
        Deno.readTextFileSync("shortcuts.json"),
      );

      styles_stack = Object.entries(shortcuts);
    } else {
      styles_stack = JSON.parse(Deno.readTextFileSync("styles.json"));
    }

    let pointer = 0;
    const html: string[] = [];
    const input_html = _html(filename);
    for (const class_line of _css_classes(input_html, CLASSES_REGEX)) {
      const before = { from: pointer, until: class_line.start };
      html.push(_chunk_before(input_html, before));

      for (const [hash, content] of styles_stack) {
        if (class_line.result === hash) {
          html.push(content);
        }
      }

      pointer = class_line.end;
    }
    html.push(_chunk_after(input_html, pointer));

    output
      ? Deno.writeTextFileSync(output, html.join(""))
      : Deno.writeTextFileSync(filename, html.join(""));

    if (windi) {
      Deno.writeTextFileSync("shortcuts.json", JSON.stringify({}, null, 2));
    } else {
      Deno.writeTextFileSync(
        "styles.json",
        JSON.stringify({ status: "unpacked" }, null, 2),
      );
    }
  } else {
    const { data, html } = _process(
      _html(filename),
      order_default,
      callback,
      prefix,
    );

    output
      ? Deno.writeTextFileSync(output, html)
      : Deno.writeTextFileSync(filename, html);

    Deno.writeTextFileSync("styles.json", JSON.stringify(data, null, 2));
    windi && _create_windi_shortcuts(data);

    return data;
  }
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
