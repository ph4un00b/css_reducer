// port from tailwind-sorter
// todo: find out a better structure
function _classes_from_string(classes: string) {
  return classes
    .split(" ")
    .map((className) => className.trim())
    .filter(Boolean);
}

export function _sort_classes_list(classes: string[] | string): string[] {
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

// port from windi html parser with some modifications.
type ClassName = { result: string; start: number; end: number };
export function _match_classes(html: string, REGEX?: RegExp): ClassName[] {
  // Match all class properties
  if (!html) return [];
  const output: ClassName[] = [];
  let regex;
  if (!REGEX) {
    regex =
      /class(Name)?\s*=\s*{`[^]+`}|class(Name)?\s*=\s*"[^"]+"|class(Name)?\s*=\s*'[^']+'|class(Name)?\s*=\s*[^>\s]+/gim;
  } else {
    regex = REGEX;
  }
  let match;
  while ((match = regex.exec(html as string))) {
    if (match) {
      const raw = match[0];
      const sep = raw.indexOf("=");
      let value: string | string[] = raw.slice(sep + 1).trim();
      let start = match.index +
        sep +
        1 +
        (html.slice(sep + 1).match(/[^'"]/)?.index ?? 0);
      let end = regex.lastIndex;
      let first = value.charAt(0);
      while (['"', "'", "`", "{"].includes(first)) {
        value = value.slice(1, -1);
        first = value.charAt(0);
        end--;
        start++;
      }
      output.push({ result: value, start, end });
    }
  }
  return output;
}

// from windi
export function _simple_hash(str: string): string {
  str = str.replace(/\r/g, "");
  let hash = 5381;
  let i = str.length;

  while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
  return (hash >>> 0).toString(36);
}
