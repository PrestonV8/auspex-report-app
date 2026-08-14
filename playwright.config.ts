import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  retries: 2,
  reporter: [
    ["list"],
    ["./src/reporter/InsightsReporter.ts"],
  ],
});