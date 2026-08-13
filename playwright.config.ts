import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: [
    ["list"],
    ["./src/reporter/InsightsReporter.ts"],
  ],
});