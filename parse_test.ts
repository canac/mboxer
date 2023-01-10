import { assertEquals, assertRejects } from "std/testing/asserts.ts";
import { describe, it } from "std/testing/bdd.ts";
import { readMessages } from "./parse.ts";

async function arrayFromAsync<T>(
  asyncIterable: AsyncIterableIterator<T>,
): Promise<Array<T>> {
  const array: Array<T> = [];
  for await (const item of asyncIterable) {
    array.push(item);
  }
  return array;
}

async function* lineGenerator(lines: string[]): AsyncIterableIterator<string> {
  for (const line of lines) {
    yield line;
  }
}

describe("readMessages", () => {
  it("splits mbox by From line", async () => {
    const messages = readMessages(
      lineGenerator(["From A", "Line 1", "From B", "Line 2", "Line 3"]),
    );
    assertEquals(await arrayFromAsync(messages), [
      "Line 1\n",
      "Line 2\nLine 3\n",
    ]);
  });

  it("yields zero items when empty", async () => {
    const messages = readMessages(
      lineGenerator([]),
    );
    assertEquals(await arrayFromAsync(messages), []);
  });

  it("throws when first line doesn't start a message", () => {
    const messages = readMessages(
      lineGenerator(["Line 1"]),
    );
    assertRejects(() => arrayFromAsync(messages));
  });
});
