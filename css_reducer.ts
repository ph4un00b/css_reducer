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

const te = (s: string) => new TextEncoder().encode(s);
const td = (d: Uint8Array) => new TextDecoder().decode(d);
export type Namer = () => string;
type Options = {
  order_default?: boolean;
  order_tailwind?: boolean;
  windi_shortcuts?: boolean;
};

export async function css_reducer(
  fileReader: Deno.File,
  namer: Namer | undefined,
  { order_default = true, windi_shortcuts = false }: Options = {},
) {
  let line_buffer = [];
  const result: string[][] = [];
  let cache: { [key: string]: string } = {};
  const opts = { order_default, windi_shortcuts };
  for await (const line of readLines(fileReader)) {
    let match;
    if (line_buffer.length > 0) {
      line_buffer.push(line);
      match = await _matcher(line_buffer.join("\n"), namer, cache, opts);

      if (match) {
        cache = { ...cache, ...match.cache };
        result.push(match.data);
        line_buffer = [];
      } else {
        line_buffer.push(line);
      }
    } else {
      match = await _matcher(line, namer, cache, opts);
      if (match) {
        cache = { ...cache, ...match.cache };
        result.push(match.data);
      } else {
        line_buffer.push(line);
      }
    }
  }

  if (windi_shortcuts) {
    _create_windi_shortcuts(result);
    return result;
  }
  return result;
}

async function _matcher(
  html: string,
  namer: Namer | undefined,
  cache: { [key: string]: string } = {},
  { order_default = true }: Options = {},
) {
  // todo: not the best regex I bet
  const re = /class="\s*([a-z:A-Z\s\-\[\#\d\.\%\]]+)\s*"/g;
  const css = html.matchAll(re);
  if (!css) return;

  for (let [_match, group] of css) {
    if (order_default) {
      group = _sort_classes_list(group).join(" ");
    }

    const encoded = te(group);
    const data = await crypto.subtle.digest("SHA-384", encoded);
    const hash: string = td(he(new Uint8Array(data))).slice(0, 6);

    if (namer) {
      // todo: do something better for green log
      const init = html.indexOf(group);
      const end = html.indexOf('"', html.indexOf(group, +1));
      if (hash in cache) {
        console.log(
          brightRed("Already in shorcuts as: ") + bgBlack(inverse(cache[hash])),
        );
      }

      console.log(
        html.slice(0, init) +
          brightGreen(html.slice(init, end)) +
          html.slice(end),
      );
      const name = namer();
      return { data: [name, group], cache: { [hash]: name } };
    } else {
      return { data: [hash, group], cache: { [hash]: group } };
    }
  }
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

// port from tailwind-sorter
// todo: find out a better structure
function _classes_from_string(classes: string) {
  return classes
    .split(" ")
    .map((className) => className.trim())
    .filter(Boolean);
}

function _sort_classes_list(classes: string[] | string): string[] {
  const classesArray = typeof classes === "string"
    ? _classes_from_string(classes)
    : classes.slice();

  return classesArray.sort((a, b) => {
    const aParts = _getClassParts(a);
    // console.log(aParts)
    const bParts = _getClassParts(b);

    const aClassBaseIndex = _getAllSelectors("components-first").indexOf(
      aParts.classBase,
    );
    const bClassBaseIndex = _getAllSelectors("components-first").indexOf(
      bParts.classBase,
    );

    const aHasMediaQuery = Boolean(aParts.mediaQuery) &&
      ["sm", "md", "lg", "xl"].indexOf(String(aParts.mediaQuery)) !== -1;
    const bHasMediaQuery = Boolean(bParts.mediaQuery) &&
      ["sm", "md", "lg", "xl"].indexOf(String(bParts.mediaQuery)) !== -1;

    const aMediaQueryIndex = ["sm", "md", "lg", "xl"].indexOf(
      String(aParts.mediaQuery),
    );
    const bMediaQueryIndex = ["sm", "md", "lg", "xl"].indexOf(
      String(bParts.mediaQuery),
    );

    // A or B have unknown selector
    if (aClassBaseIndex !== -1 && bClassBaseIndex === -1) {
      // B has unknown class
      return "start" === "start" ? 1 : -1;
    }
    if (aClassBaseIndex === -1 && bClassBaseIndex !== -1) {
      // A has unknown class
      return "start" === "start" ? -1 : 1;
    }

    // Sort by media query
    if (!aHasMediaQuery && bHasMediaQuery) {
      return -1;
    }
    if (aHasMediaQuery && !bHasMediaQuery) {
      return 1;
    }

    // Both or none have MQ at this point
    if (aHasMediaQuery && bHasMediaQuery) {
      if (aMediaQueryIndex < bMediaQueryIndex) {
        return -1;
      }
      if (
        ["sm", "md", "lg", "xl"].indexOf(String(aParts.mediaQuery)) >
          ["sm", "md", "lg", "xl"].indexOf(String(bParts.mediaQuery))
      ) {
        return 1;
      }
    }

    // Sort based on sorted selector
    if (aClassBaseIndex !== -1 && bClassBaseIndex !== -1) {
      if (aClassBaseIndex < bClassBaseIndex) {
        return -1;
      }
      if (aClassBaseIndex > bClassBaseIndex) {
        return 1;
      }
    }

    return 0;
  });
}

interface ClassParts {
  classBase: string;
  mediaQuery: string | false;
}

function _getClassParts(className: string): ClassParts {
  if (className.indexOf(":") === -1) {
    return {
      classBase: className,
      mediaQuery: false,
    };
  }

  const parts = className.split(":");
  if (parts.length === 1) {
    return {
      classBase: parts[0],
      mediaQuery: false,
    };
  }

  return {
    classBase: parts[1],
    mediaQuery: parts[0],
  };
}

function _getAllSelectors(
  classes_position: "as-is" | "components-first" | "components-last",
): string[] {
  const allSelectors: string[] = [];
  const allComponentSelectors: string[] = [];
  const allUtilitySelectors: string[] = [];

  switch (classes_position) {
    case "as-is":
      return allSelectors;

    case "components-first":
      return [...allComponentSelectors, ...allUtilitySelectors];

    case "components-last":
      return [...allUtilitySelectors, ...allComponentSelectors];
  }
}
