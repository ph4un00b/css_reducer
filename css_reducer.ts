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

export const fns = {
  _unpack_for_windi,
  _unpack,
  _reduce_for_windi,
  _reduce,
  _jp,
};

export function css_reducer_sync(
  filename: string | undefined,
  options: CLIOptions = {},
) {
  const {
    output,
    prefix,
    callback,
    display = false,
    windi = false,
    unpack = false,
    order_default = true,
  } = options;
  if (!filename) {
    if (display && windi) {
      return fns._jp(_rf(path.join(Deno.cwd(), "shortcuts.json")));
    } else {
      return fns._jp(_rf(path.join(Deno.cwd(), "styles.json")));
    }
  } else if (unpack && windi) {
    fns._unpack_for_windi(filename, output);
  } else if (unpack) {
    fns._unpack(filename, output);
  } else if (windi) {
    fns._reduce_for_windi(filename, order_default, callback, prefix, output);
  } else {
    return fns._reduce(filename, order_default, callback, prefix, output);
  }
}

function _reduce(
  filename: string,
  order_default: boolean,
  callback: NameCallback | undefined,
  prefix: PrefixCallback | undefined,
  output: string | undefined,
) {
  const { data, html } = _process(
    _html(filename),
    order_default,
    callback,
    prefix,
  );

  output ? _wf(output, html) : _wf(filename, html);

  _wf("styles.json", _js(data));

  return data;
}

function _reduce_for_windi(
  filename: string,
  order_default: boolean,
  callback: NameCallback | undefined,
  prefix: PrefixCallback | undefined,
  output: string | undefined,
) {
  const { data, html } = _process(
    _html(filename),
    order_default,
    callback,
    prefix,
  );

  output ? _wf(output, html) : _wf(filename, html);

  _create_windi_shortcuts(data);
}

function _unpack_for_windi(
  filename: string,
  output?: string,
) {
  const styles_data = Object.entries(_jp(_rf("shortcuts.json")));

  output
    ? _wf(output, _out_html(filename, styles_data))
    : _wf(filename, _out_html(filename, styles_data));

  _wf("shortcuts.json", _js({}));
}

function _unpack(
  filename: string,
  output?: string,
) {
  const styles_data = _jp(_rf("styles.json"));

  output
    ? _wf(output, _out_html(filename, styles_data))
    : _wf(filename, _out_html(filename, styles_data));

  _wf("styles.json", _js({ status: "unpacked" }));
}

function _out_html(filename: string, styles: any) {
  let pointer = 0;
  const in_html = _html(filename);
  const html_chunks: string[] = [];
  for (const class_line of _css_classes(in_html, CLASSES_REGEX)) {
    const chunk_before = _chunk_before(in_html, {
      from: pointer,
      until: class_line.start,
    });

    html_chunks.push(chunk_before);
    for (const [hash_id, classes] of styles) {
      if (class_line.result === hash_id) html_chunks.push(classes);
    }
    pointer = class_line.end;
  }

  html_chunks.push(_chunk_after(in_html, pointer));
  return html_chunks.join("");
}

function _html(filename: string) {
  const filepath = path.join(Deno.cwd(), filename);
  return _rf(filepath);
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

function _data_from_cb(
  name_from_callback: NameCallback,
  name: string,
): string[] {
  return [name_from_callback() ?? "", name];
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

export function _rf(name: string) {
  return Deno.readTextFileSync(name);
}

export function _wf(name: string, data: string) {
  return Deno.writeTextFileSync(name, data);
}

export function _rm(name: string) {
  Deno.removeSync(name);
}

export function _jp(name: string) {
  return JSON.parse(name);
}

export function _js(data: unknown) {
  return JSON.stringify(data, undefined, 2);
}
