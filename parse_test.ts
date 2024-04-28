import { assertEquals, assertRejects } from "std/assert/mod.ts";
import { describe, it } from "std/testing/bdd.ts";
import { readMessages } from "./parse.ts";

describe("readMessages", () => {
  it("splits mbox by From line", async () => {
    const messages = readMessages(
      ReadableStream.from(["From A", "Line 1", "From B", "Line 2", "Line 3"]),
    );
    assertEquals(await Array.fromAsync(messages), [
      "Line 1\n",
      "Line 2\nLine 3\n",
    ]);
  });

  it("yields zero items when empty", async () => {
    const messages = readMessages(
      ReadableStream.from([]),
    );
    assertEquals(await Array.fromAsync(messages), []);
  });

  it("throws when first line doesn't start a message", () => {
    const messages = readMessages(
      ReadableStream.from(["Line 1"]),
    );
    assertRejects(() => Array.fromAsync(messages));
  });
});
