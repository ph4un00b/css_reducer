import { assertEquals } from "https://deno.land/std@0.125.0/testing/asserts.ts";
import * as path from "https://deno.land/std@0.125.0/path/mod.ts";
import { css_reducer, css_reducer_sync, Namer } from "./css_reducer.ts";

async function from_file(
  filepath: string,
  order_default = false,
  fn: undefined | Namer = undefined,
  windi_shortcuts = false,
) {
  const filename = path.join(Deno.cwd(), filepath);
  const fileReader = await Deno.open(filename);
  const classes = await css_reducer(fileReader, fn, {
    order_default,
    windi_shortcuts,
  });
  Deno.close(fileReader.rid);
  return classes;
}

async function from_file_sync(
  filepath: string,
  order_default = false,
  fn: undefined | Namer = undefined,
  windi_shortcuts = false,
) {
  const filename = path.join(Deno.cwd(), filepath);
  const text = Deno.readTextFileSync(filename);
  const classes = await css_reducer_sync(text, fn, {
    order_default,
    windi_shortcuts,
  });
  return classes;
}
// await from_file("chunk.html");
Deno.test("can sort.", async function () {
  const classes = [
    ["a47d9e", "bg-rose-500"],
    ["cddfbc", "bg-pink-500"],
    [
      "bd1d2e",
      "text-[0.9em] font-mono text-light-300 flex flex-row justify-around pb-1",
    ],
    [
      "8f032c",
      "text-[#333] inline-block text-[0.85em] px-[2px] py-[4px] bg-[#eee] rounded-[3px] border-solid border-1 shadow-sm shadow-black border-[#b4b4b4]",
    ],
    [
      "8f032c",
      "text-[#333] inline-block text-[0.85em] px-[2px] py-[4px] bg-[#eee] rounded-[3px] border-solid border-1 shadow-sm shadow-black border-[#b4b4b4]",
    ],
    [
      "8f032c",
      "text-[#333] inline-block text-[0.85em] px-[2px] py-[4px] bg-[#eee] rounded-[3px] border-solid border-1 shadow-sm shadow-black border-[#b4b4b4]",
    ],
    ["465c4c", "overflow-hidden text-xl flex flex-col items-center"],
    [
      "493769",
      "placeholder-purple-500 text-6xl py-8 px-3 w-[88%] border-b-2 border-gray-400 outline-none focus:border-purple-500",
    ],
    [
      "802e55",
      "placehol placeholder-rose-500 text-6xl py-8 px-3 w-[88%] border-b-2 border-gray-400 outline-none focus:border-purple-500",
    ],
    ["2ee675", "w-[98%]"],
    [
      "f613d2",
      "bg-indigo-50 border-solid border-2 py-4 pl-2 border-rose-400 border-opacity-60 list-none",
    ],
    ["52a76c", "bg-blue-50 p-[8px]"],
    [
      "bc2bc9",
      "relative cursor-pointer p-1 focus-within:bg-rose-100 focus-within:outline-solid-rose-500",
    ],
    [
      "cfa92d",
      "outline-transparent absolute top-0 right-0 text-[0.5em] text-transparent inline-block px-[2px] py-[4px] bg-transparent rounded-[3px] border-solid border-1 shadow-sm shadow-transparent border-transparent focus:border-[#b4b4b4] focus:text-[#333] focus:bg-[#eee] focus:shadow-black",
    ],
    ["71292b", "flex flex-row"],
    ["0ea18b", "p-1"],
    ["6e2356", "flex flex-col justify-around"],
    ["27c77a", "text-[0.7em]"],
    ["8b494a", "inline-block"],
    ["27196b", "ml-2 mr-3 text-[0.8em]"],
    ["4f722a", "bg-gray-900 text-light-100 flex flex-col items-center"],
    ["28818e", "rounded"],
    ["52fcd8", "flex flex-col"],
    ["fc227c", "bg-rose-500 py-1.5 px-2 rounded-md my-3 text-sm"],
    ["28818e", "rounded"],
  ];
  assertEquals(await from_file("chunk.html", true, undefined), classes);
  assertEquals(await from_file_sync("chunk.html", true, undefined), classes);
});

Deno.test("can put a naming procedure.", async function () {
  const classes = [
    ["named", "bg-rose-500"],
    ["named", "bg-pink-500"],
    [
      "named",
      "text-[0.9em] font-mono text-light-300 flex flex-row justify-around pb-1",
    ],
    [
      "named",
      "text-[#333] inline-block text-[0.85em] px-[2px] py-[4px] bg-[#eee] rounded-[3px] border-solid border-1 shadow-sm shadow-black border-[#b4b4b4]",
    ],
    [
      "named",
      "text-[#333] inline-block text-[0.85em] px-[2px] py-[4px] bg-[#eee] rounded-[3px] border-solid border-1 shadow-sm shadow-black border-[#b4b4b4]",
    ],
    [
      "named",
      "text-[#333] inline-block text-[0.85em] px-[2px] py-[4px] bg-[#eee] rounded-[3px] border-solid border-1 shadow-sm shadow-black border-[#b4b4b4]",
    ],
    ["named", "overflow-hidden text-xl flex flex-col items-center"],
    [
      "named",
      "placeholder-purple-500 text-6xl py-8 px-3 w-[88%] border-b-2 border-gray-400 outline-none focus:border-purple-500",
    ],
    [
      "named",
      "placehol placeholder-rose-500 text-6xl py-8 px-3 w-[88%] border-b-2 border-gray-400 outline-none focus:border-purple-500",
    ],
    ["named", "w-[98%]"],
    [
      "named",
      "bg-indigo-50 border-solid border-2 py-4 pl-2 border-rose-400 border-opacity-60 list-none",
    ],
    ["named", "bg-blue-50 p-[8px]"],
    [
      "named",
      "relative cursor-pointer p-1 focus-within:bg-rose-100 focus-within:outline-solid-rose-500",
    ],
    [
      "named",
      "outline-transparent absolute top-0 right-0 text-[0.5em] text-transparent inline-block px-[2px] py-[4px] bg-transparent rounded-[3px] border-solid border-1 shadow-sm shadow-transparent border-transparent focus:border-[#b4b4b4] focus:text-[#333] focus:bg-[#eee] focus:shadow-black",
    ],
    ["named", "flex flex-row"],
    ["named", "p-1"],
    ["named", "flex flex-col justify-around"],
    ["named", "text-[0.7em]"],
    ["named", "inline-block"],
    ["named", "ml-2 mr-3 text-[0.8em]"],
    ["named", "bg-gray-900 text-light-100 flex flex-col items-center"],
    ["named", "rounded"],
    ["named", "flex flex-col"],
    ["named", "bg-rose-500 py-1.5 px-2 rounded-md my-3 text-sm"],
    ["named", "rounded"],
  ];

  assertEquals(await from_file("chunk.html", true, () => "named"), classes);
  assertEquals(
    await from_file_sync("chunk.html", true, () => "named"),
    classes,
  );
});

Deno.test({
  ignore: true,
  name: "can order the tailwindcss way",
  fn: async function () {
    const html = [
      ["a47d9e", "bg-rose-500"],
      ["cddfbc", "bg-pink-500"],
      [
        "2eef9a",
        "text-light-300 flex flex-row justify-around pb-1 font-mono text-[0.9em]",
      ],
      [
        "6798d8",
        "border-1 inline-block rounded-[3px] border-solid border-[#b4b4b4] bg-[#eee] px-[2px] py-[4px] text-[0.85em] text-[#333] shadow-sm shadow-black",
      ],
      [
        "6798d8",
        "border-1 inline-block rounded-[3px] border-solid border-[#b4b4b4] bg-[#eee] px-[2px] py-[4px] text-[0.85em] text-[#333] shadow-sm shadow-black",
      ],
      [
        "6798d8",
        "border-1 inline-block rounded-[3px] border-solid border-[#b4b4b4] bg-[#eee] px-[2px] py-[4px] text-[0.85em] text-[#333] shadow-sm shadow-black",
      ],
      ["cc0a12", "flex flex-col items-center overflow-hidden text-xl"],
      [
        "8a82af",
        "w-[88%] border-b-2 border-gray-400 py-8 px-3 text-6xl placeholder-purple-500 outline-none focus:border-purple-500",
      ],
      [
        "90b2bf",
        "placehol w-[88%] border-b-2 border-gray-400 py-8 px-3 text-6xl placeholder-rose-500 outline-none focus:border-purple-500",
      ],
      ["2ee675", "w-[98%]"],
      [
        "244dcf",
        "list-none border-2 border-solid border-rose-400 border-opacity-60 bg-indigo-50 py-4 pl-2",
      ],
      ["52a76c", "bg-blue-50 p-[8px]"],
      [
        "299bfd",
        "focus-within:outline-solid-rose-500 relative cursor-pointer p-1 focus-within:bg-rose-100",
      ],
      [
        "7f416a",
        "border-1 absolute top-0 right-0 inline-block rounded-[3px] border-solid border-transparent bg-transparent px-[2px] py-[4px] text-[0.5em] text-transparent shadow-sm shadow-transparent outline-transparent focus:border-[#b4b4b4] focus:bg-[#eee] focus:text-[#333] focus:shadow-black",
      ],
      ["71292b", "flex flex-row"],
      ["0ea18b", "p-1"],
      ["6e2356", "flex flex-col justify-around"],
      ["27c77a", "text-[0.7em]"],
      ["8b494a", "inline-block"],
      ["27196b", "ml-2 mr-3 text-[0.8em]"],
      ["33f616", "text-light-100 flex flex-col items-center bg-gray-900"],
      ["28818e", "rounded"],
      ["52fcd8", "flex flex-col"],
      ["afeb01", "my-3 rounded-md bg-rose-500 py-1.5 px-2 text-sm"],
      ["28818e", "rounded"],
    ];
    assertEquals(await from_file("chunk_tw.html", true, undefined), html);
    assertEquals(await from_file_sync("chunk_tw.html", true, undefined), html);
  },
});

Deno.test("can create windicss shortcuts.", async function () {
  const json = {
    a47d9e: "bg-rose-500",
    cddfbc: "bg-pink-500",
    "2eef9a":
      "text-light-300 flex flex-row justify-around pb-1 font-mono text-[0.9em]",
    "6798d8":
      "border-1 inline-block rounded-[3px] border-solid border-[#b4b4b4] bg-[#eee] px-[2px] py-[4px] text-[0.85em] text-[#333] shadow-sm shadow-black",
    cc0a12: "flex flex-col items-center overflow-hidden text-xl",
    "8a82af":
      "w-[88%] border-b-2 border-gray-400 py-8 px-3 text-6xl placeholder-purple-500 outline-none focus:border-purple-500",
    "90b2bf":
      "placehol w-[88%] border-b-2 border-gray-400 py-8 px-3 text-6xl placeholder-rose-500 outline-none focus:border-purple-500",
    "2ee675": "w-[98%]",
    "244dcf":
      "list-none border-2 border-solid border-rose-400 border-opacity-60 bg-indigo-50 py-4 pl-2",
    "52a76c": "bg-blue-50 p-[8px]",
    "299bfd":
      "focus-within:outline-solid-rose-500 relative cursor-pointer p-1 focus-within:bg-rose-100",
    "7f416a":
      "border-1 absolute top-0 right-0 inline-block rounded-[3px] border-solid border-transparent bg-transparent px-[2px] py-[4px] text-[0.5em] text-transparent shadow-sm shadow-transparent outline-transparent focus:border-[#b4b4b4] focus:bg-[#eee] focus:text-[#333] focus:shadow-black",
    "71292b": "flex flex-row",
    "0ea18b": "p-1",
    "6e2356": "flex flex-col justify-around",
    "27c77a": "text-[0.7em]",
    "8b494a": "inline-block",
    "27196b": "ml-2 mr-3 text-[0.8em]",
    "33f616": "text-light-100 flex flex-col items-center bg-gray-900",
    "28818e": "rounded",
    "52fcd8": "flex flex-col",
    afeb01: "my-3 rounded-md bg-rose-500 py-1.5 px-2 text-sm",
  };
  const file = "shortcuts.json";
  Deno.removeSync(file);
  await from_file("chunk_tw.html", true, undefined, true);
  assertEquals(JSON.parse(Deno.readTextFileSync(file)), json);

  Deno.removeSync(file);
  await from_file_sync("chunk_tw.html", true, undefined, true);
  assertEquals(JSON.parse(Deno.readTextFileSync(file)), json);
  // Deno.removeSync(file);
});
