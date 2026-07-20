import { test, expect } from "@playwright/test";

test("Basic sanity test", async() => {
    expect(1 + 1 ).toBe(2);
})