import { assertEquals } from "https://deno.land/std@0.125.0/testing/asserts.ts";
import * as path from "https://deno.land/std@0.125.0/path/mod.ts";
import { css_reducer, css_reducer_sync, NameCallback } from "./css_reducer.ts";

async function from_file(
  filepath: string,
  order_default = false,
  fn: undefined | NameCallback = undefined,
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

function from_file_sync(
  filename: string,
  order_default = false,
  cb: undefined | NameCallback = undefined,
  windi_shortcuts = false,
  output_file?: string,
) {
  return css_reducer_sync(filename, {
    output_file,
    order_default,
    windi_shortcuts,
    cb,
  });
}
// await from_file("chunk.html");
Deno.test("can sort.", async function () {
  const classes = [
    ["1pwdgta", "bg-rose-500"],
    ["m8onlr", "bg-pink-500"],
    [
      "vwxuvc",
      "text-[0.9em] font-mono text-light-300 flex flex-row justify-around pb-1",
    ],
    [
      "9hj02u",
      "text-[#333] inline-block text-[0.85em] px-[2px] py-[4px] bg-[#eee] rounded-[3px] border-solid border-1 shadow-sm shadow-black border-[#b4b4b4]",
    ],
    [
      "9hj02u",
      "text-[#333] inline-block text-[0.85em] px-[2px] py-[4px] bg-[#eee] rounded-[3px] border-solid border-1 shadow-sm shadow-black border-[#b4b4b4]",
    ],
    [
      "9hj02u",
      "text-[#333] inline-block text-[0.85em] px-[2px] py-[4px] bg-[#eee] rounded-[3px] border-solid border-1 shadow-sm shadow-black border-[#b4b4b4]",
    ],
    ["1668mtl", "overflow-hidden text-xl flex flex-col items-center"],
    [
      "erwy95",
      "placeholder-purple-500 text-6xl py-8 px-3 w-[88%] border-b-2 border-gray-400 outline-none focus:border-purple-500",
    ],
    [
      "1r2vyti",
      "placehol placeholder-rose-500 text-6xl py-8 px-3 w-[88%] border-b-2 border-gray-400 outline-none focus:border-purple-500",
    ],
    ["fgs58h", "w-[98%]"],
    [
      "a2hca2",
      "bg-indigo-50 border-solid border-2 py-4 pl-2 border-rose-400 border-opacity-60 list-none",
    ],
    ["7j6lfa", "bg-blue-50 p-[8px]"],
    [
      "1io9zto",
      "relative cursor-pointer p-1 focus-within:bg-rose-100 focus-within:outline-solid-rose-500",
    ],
    [
      "1t29g2h",
      "outline-transparent absolute top-0 right-0 text-[0.5em] text-transparent inline-block px-[2px] py-[4px] bg-transparent rounded-[3px] border-solid border-1 shadow-sm shadow-transparent border-transparent focus:border-[#b4b4b4] focus:text-[#333] focus:bg-[#eee] focus:shadow-black",
    ],
    ["4ehd8i", "flex flex-row"],
    ["2ng8gl", "p-1"],
    ["1kdt430", "flex flex-col justify-around"],
    ["1fsjxcq", "text-[0.7em]"],
    ["vp7xu4", "inline-block"],
    ["1krqszm", "ml-2 mr-3 text-[0.8em]"],
    ["yhkz7l", "bg-gray-900 text-light-100 flex flex-col items-center"],
    ["112vb5c", "rounded"],
    ["14o1ml0", "flex flex-col"],
    ["1yz4ldi", "bg-rose-500 py-1.5 px-2 rounded-md my-3 text-sm"],
    ["112vb5c", "rounded"],
  ];
  assertEquals(await from_file("chunk.html", true, undefined, false), classes);
  assertEquals(
    from_file_sync("chunk.html", true, undefined, false, "__dev"),
    classes,
  );
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
    from_file_sync("chunk.html", true, () => "named", false, "__dev"),
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
    assertEquals(
      from_file_sync("chunk_tw.html", true, undefined, false, "__dev"),
      html,
    );
  },
});

Deno.test("can create windicss shortcuts.", async function () {
  const json = {
    "1pwdgta": "bg-rose-500",
    m8onlr: "bg-pink-500",
    "1n9xcto":
      "text-light-300 flex flex-row justify-around pb-1 font-mono text-[0.9em]",
    y5zz4c:
      "border-1 inline-block rounded-[3px] border-solid border-[#b4b4b4] bg-[#eee] px-[2px] py-[4px] text-[0.85em] text-[#333] shadow-sm shadow-black",
    z6cyaj: "flex flex-col items-center overflow-hidden text-xl",
    "1hk193x":
      "w-[88%] border-b-2 border-gray-400 py-8 px-3 text-6xl placeholder-purple-500 outline-none focus:border-purple-500",
    ynkwri:
      "placehol w-[88%] border-b-2 border-gray-400 py-8 px-3 text-6xl placeholder-rose-500 outline-none focus:border-purple-500",
    fgs58h: "w-[98%]",
    "1q0fdk0":
      "list-none border-2 border-solid border-rose-400 border-opacity-60 bg-indigo-50 py-4 pl-2",
    "7j6lfa": "bg-blue-50 p-[8px]",
    "17dc87g":
      "focus-within:outline-solid-rose-500 relative cursor-pointer p-1 focus-within:bg-rose-100",
    m1wztv:
      "border-1 absolute top-0 right-0 inline-block rounded-[3px] border-solid border-transparent bg-transparent px-[2px] py-[4px] text-[0.5em] text-transparent shadow-sm shadow-transparent outline-transparent focus:border-[#b4b4b4] focus:bg-[#eee] focus:text-[#333] focus:shadow-black",
    "4ehd8i": "flex flex-row",
    "2ng8gl": "p-1",
    "1kdt430": "flex flex-col justify-around",
    "1fsjxcq": "text-[0.7em]",
    vp7xu4: "inline-block",
    "1krqszm": "ml-2 mr-3 text-[0.8em]",
    "5bxm0p": "text-light-100 flex flex-col items-center bg-gray-900",
    "112vb5c": "rounded",
    "14o1ml0": "flex flex-col",
    "4fbogc": "my-3 rounded-md bg-rose-500 py-1.5 px-2 text-sm",
  };
  const file = "shortcuts.json";
  Deno.removeSync(file);
  await from_file("chunk_tw.html", true, undefined, true);
  assertEquals(JSON.parse(Deno.readTextFileSync(file)), json);

  Deno.removeSync(file);
  from_file_sync("chunk_tw.html", true, undefined, true, "__dev");
  assertEquals(JSON.parse(Deno.readTextFileSync(file)), json);
});

Deno.test("can rewrite html file.", function () {
  const html = `<body class="1pwdgta">
    <!-- <div id="id">0ybFZ2Ab08V8hueghSXm6E</div> -->
    <!-- <div id="name" class="m8onlr">Opeth</div> -->
    <main class="">
        <section class="vwxuvc">
            <div class=""><kbd
                    class="9hj02u"><code>shift</code></kbd>+<kbd
                    class="9hj02u"><code>tab</code></kbd>
                backward</div>
            <div class=""><kbd
                    class="9hj02u"><code>tab</code></kbd>
                forward</div>
        </section>
        <div id="countapp" @vue:mounted="init('ramm')" v-scope="Fuzzy()"
            class="1668mtl">
            <!-- <pre v-effect="$el.textContent = entries"></pre> -->
            <input ref="main_runner" v-if="program === 'main'" placeholder="Type"
                class="erwy95"
                type="text" @input="search">

            <input ref="runner" v-else placeholder="Type"
                class="1r2vyti"
                type="text" @change="execute">


            <!-- <pre>program: {{program}}</pre> -->
            <section class="fgs58h">
                <h2 @focus="result_selected = false; store.id = undefined" tabindex="0"
                    :class="program === 'main' ? 'text-purple-300' : 'text-rose-200'"
                    v-effect="$el.textContent = \`> \${program}\`">
                </h2>
                <h1 v-if="program === 'main'">select program</h1>
                <!-- options -->
                <div v-show="program === 'main'" tabindex="0" @keyup.enter="handle_enter(item)"
                    v-for="({item, positions}) in entries"
                    class="a2hca2">
                    <!-- <pre v-effect="$el.textContent = item"></pre> -->
                    <!-- highlight -->
                    <span v-for="(char, pos) in item.split('')">
                        <b v-if="positions.includes(pos)" v-effect="$el.textContent = char"></b>
                        <span v-else v-effect="$el.textContent = char"></span>
                    </span>
                </div>

                <section v-show="program !== 'main' && !result_selected">
                    <div class="7j6lfa" v-for="({name, id, genres, images}) in results">
                        <section @keyup.enter="store.artist_id = id; result_selected = true"
                            class="1io9zto">

                            <kbd tabindex="0"
                                class="1t29g2h"><code>enter</code></kbd>
                            <!-- basic info -->
                            <section class="4ehd8i">
                                <img class="2ng8gl" :src="images[0]?.url ?? 'https://www.fillmurray.com/g/200/200'"
                                    width="70" height="70" alt="">
                                <section class="1kdt430">
                                    <strong>{{name}}</strong>
                                    <i class="1fsjxcq">{{id}}</i>
                                </section>
                            </section>
                            <!-- genres -->
                            <section class="vp7xu4" v-for="(genre, idx) in genres">
                                <span class="1krqszm" v-if="idx < 2"
                                    v-effect="$el.textContent = genre"></span>
                            </section>
                        </section>
                    </div>
                </section>
            </section>
            <!-- <button @click="search('pt')">Increment</button> -->

        </div>

        <article v-if="store.id" id="artista" class="yhkz7l">
            <h1 v-effect="$el.textContent = store.id"></h1>
            <h1>{{ store.json.name }}</h1>
            <div>
                <img class="112vb5c" :src="store.json.artist_image.url" width="120" height="120" alt="">
            </div>

            <section class="14o1ml0" id="genres" v-for="item of store.json.artist_genres">
                <span class="1yz4ldi">{{ item }}</span>
            </section>

            <h2>{{ store.json.last_album_name }}</h2>
            <div>
                <img class="112vb5c" :src="store.json.last_album_image.url" width="160" height="160" alt="">
            </div>
        </article>
    </main>
    <script type="module" src="main.js"></script>
</body>`;

  const file = "__dev";
  Deno.removeSync(file);
  from_file_sync("chunk.html", true, undefined, true, file);
  assertEquals(Deno.readTextFileSync(file), html);
});

Deno.test("can return data with a prefix", function () {
  const data = [
    [
      "prefix-ke9kl8",
      "relative grid place-items-center sm:h-screen",
    ],
    [
      "prefix-1bgv7xb",
      "absolute w-full h-full bg-transparent bg-no-repeat bg-cover",
    ],
    [
      "prefix-1m4gr4w",
      "sm:w-[26%]",
    ],
    [
      "prefix-1euttdc",
      "bg-indigo-500 rounded-none pt-1 sm:rounded-lg",
    ],
  ];

  const prefix_callback = function () {
    return "prefix";
  };
  assertEquals(
    css_reducer_sync("test.html", {
      prefix: prefix_callback,
      output_file: "test_output.html",
    }),
    data,
  );
});

Deno.test("can rewrite html with prefix classes", function () {
  const html = `<body class="prefix-ke9kl8">
    <div id="errors"
        style=" background: #c00; color: #fff; display: none; margin: -20px -20px 20px; padding: 20px; white-space: pre-wrap; ">
    </div>

    <div id="jamon" class="prefix-1bgv7xb"></div>

    <div class="prefix-1m4gr4w">
        {% include "controls.html" %}
        <main class="prefix-1euttdc">
            {% include "inputs.html" %}
            {% include "output.html" %}
        </main>
    </div>
</body>`;

  Deno.removeSync("test_output.html");
  const prefix_callback = function () {
    return "prefix";
  };
  css_reducer_sync("test.html", {
    prefix: prefix_callback,
    output_file: "test_output.html",
  });
  assertEquals(Deno.readTextFileSync("test_output.html"), html);
});

Deno.test("can rewrite html with callback name", function () {
  const html = `<body class="pha">
    <div id="errors"
        style=" background: #c00; color: #fff; display: none; margin: -20px -20px 20px; padding: 20px; white-space: pre-wrap; ">
    </div>

    <div id="jamon" class="pha"></div>

    <div class="pha">
        {% include "controls.html" %}
        <main class="pha">
            {% include "inputs.html" %}
            {% include "output.html" %}
        </main>
    </div>
</body>`;

  Deno.removeSync("test_output.html");
  const name_callback = function () {
    return "pha";
  };
  css_reducer_sync("test.html", {
    cb: name_callback,
    output_file: "test_output.html",
  });
  assertEquals(Deno.readTextFileSync("test_output.html"), html);
});

Deno.test("can create a data file", function () {
  const data = [
    [
      "prefix-ke9kl8",
      "relative grid place-items-center sm:h-screen",
    ],
    [
      "prefix-1bgv7xb",
      "absolute w-full h-full bg-transparent bg-no-repeat bg-cover",
    ],
    [
      "prefix-1m4gr4w",
      "sm:w-[26%]",
    ],
    [
      "prefix-1euttdc",
      "bg-indigo-500 rounded-none pt-1 sm:rounded-lg",
    ],
  ];

  Deno.removeSync("test_output.html");
  Deno.removeSync("styles.json");

  const prefix_callback = function () {
    return "prefix";
  };

  css_reducer_sync("test.html", {
    prefix: prefix_callback,
    output_file: "test_output.html",
  });

  assertEquals(
    JSON.parse(Deno.readTextFileSync("styles.json")),
    data,
  );
});

Deno.test("can unpack styles", function () {
  const html = `<body class="relative grid place-items-center sm:h-screen">
    <div id="errors"
        style=" background: #c00; color: #fff; display: none; margin: -20px -20px 20px; padding: 20px; white-space: pre-wrap; ">
    </div>

    <div id="jamon" class="absolute w-full h-full bg-transparent bg-no-repeat bg-cover"></div>

    <div class="sm:w-[26%]">
        {% include "controls.html" %}
        <main class="bg-indigo-500 rounded-none pt-1 sm:rounded-lg">
            {% include "inputs.html" %}
            {% include "output.html" %}
        </main>
    </div>
</body>`;

  const data = { status: "unpacked" };

  const prefix_callback = function () {
    return "prefix";
  };

  css_reducer_sync("test_output.html", {
    prefix: prefix_callback,
    unpack: true,
  });

  assertEquals(Deno.readTextFileSync("test_output.html"), html);
  assertEquals(JSON.parse(Deno.readTextFileSync("styles.json")), data);
});

Deno.test("can unpack styles from windicss shortcuts", function () {
  const pre_html = `<body class="prefix-ke9kl8">
    <div id="errors"
        style=" background: #c00; color: #fff; display: none; margin: -20px -20px 20px; padding: 20px; white-space: pre-wrap; ">
    </div>

    <div id="jamon" class="prefix-1bgv7xb"></div>

    <div class="prefix-1m4gr4w">
        {% include "controls.html" %}
        <main class="prefix-1euttdc">
            {% include "inputs.html" %}
            {% include "output.html" %}
        </main>
    </div>
</body>`;

  const pre_json = {
    "prefix-ke9kl8": "relative grid place-items-center sm:h-screen",
    "prefix-1bgv7xb":
      "absolute w-full h-full bg-transparent bg-no-repeat bg-cover",
    "prefix-1m4gr4w": "sm:w-[26%]",
    "prefix-1euttdc": "bg-indigo-500 rounded-none pt-1 sm:rounded-lg",
  };
  Deno.writeTextFileSync("test_output.html", pre_html);
  Deno.writeTextFileSync("shortcuts.json", JSON.stringify(pre_json, null, 2));

  css_reducer_sync("test_output.html", {
    unpack: true,
    windi_shortcuts: true
  });

  const html = `<body class="relative grid place-items-center sm:h-screen">
    <div id="errors"
        style=" background: #c00; color: #fff; display: none; margin: -20px -20px 20px; padding: 20px; white-space: pre-wrap; ">
    </div>

    <div id="jamon" class="absolute w-full h-full bg-transparent bg-no-repeat bg-cover"></div>

    <div class="sm:w-[26%]">
        {% include "controls.html" %}
        <main class="bg-indigo-500 rounded-none pt-1 sm:rounded-lg">
            {% include "inputs.html" %}
            {% include "output.html" %}
        </main>
    </div>
</body>`;

  assertEquals(Deno.readTextFileSync("test_output.html"), html);
  assertEquals(JSON.parse(Deno.readTextFileSync("shortcuts.json")), {});
});
