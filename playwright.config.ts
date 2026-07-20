import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [
    ["list"],
    ["./src/reporter/InsightsReporter.ts"],
  ],
});