import { assertEquals } from "https://deno.land/std@0.125.0/testing/asserts.ts";

import { default as sinon } from "https://cdn.skypack.dev/sinon@13.0.1?dts";
import { fns, _jp } from "./css_reducer.ts";
import { ask, start } from "./cli.ts";

function setup() {
  const sandbox = sinon.createSandbox();
  const fakeJP = sandbox.stub(fns, "_jp");
  const fakeReduce = sandbox.stub(fns, "_reduce");
  const fakeWindiReduce = sandbox.stub(fns, "_reduce_for_windi");
  const fakeUnpack = sandbox.stub(fns, "_unpack");
  const fakeWindiUnpack = sandbox.stub(fns, "_unpack_for_windi");
  return {
    sandbox,
    fakeWindiUnpack,
    fakeUnpack,
    fakeWindiReduce,
    fakeReduce,
    fakeJP,
  };
}

Deno.test("file", function () {
  const { sandbox, fakeReduce } = setup();
  start({ _: ["your-page.html"] });
  assertEquals(fakeReduce.getCalls().length, 1);
  assertEquals(fakeReduce.getCall(0).args, [
    "your-page.html",
    true,
    ask,
    undefined,
    undefined,
  ]);
  sandbox.restore();
});

Deno.test("file --windi", function () {
  const { sandbox, fakeWindiReduce } = setup();
  start({ _: ["your-page.html"], windi: true });
  assertEquals(fakeWindiReduce.getCalls().length, 1);
  assertEquals(fakeWindiReduce.getCall(0).args, [
    "your-page.html",
    true,
    ask,
    undefined,
    undefined,
  ]);
  sandbox.restore();
});

Deno.test("file --unpack", function () {
  const { sandbox, fakeUnpack } = setup();
  start({ _: ["your-page.html"], unpack: true });
  assertEquals(fakeUnpack.getCalls().length, 1);
  assertEquals(fakeUnpack.getCall(0).args, ["your-page.html", undefined]);
  sandbox.restore();
});

Deno.test("file --unpack --windi", function () {
  const { sandbox, fakeWindiUnpack } = setup();
  start({ _: ["your-page.html"], unpack: true, windi: true });
  assertEquals(fakeWindiUnpack.getCalls().length, 1);
  assertEquals(fakeWindiUnpack.getCall(0).args, ["your-page.html", undefined]);
  sandbox.restore();
});

Deno.test("--display", function () {
  const { sandbox, fakeJP } = setup();
  start({ _: [], display: true });
  assertEquals(fakeJP.getCalls().length, 1);
  assertEquals(fakeJP.getCall(0).args, ['{\n  "status": "unpacked"\n}']);
  sandbox.restore();
});

Deno.test("--display --windi", function () {
  const { sandbox, fakeJP } = setup();
  start({ _: [], display: true, windi: true });
  assertEquals(fakeJP.getCalls().length, 1);
  assertEquals(fakeJP.getCall(0).args, ["{}"]);
  sandbox.restore();
});
