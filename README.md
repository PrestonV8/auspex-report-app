<p>
    <img  src="assets/auspex-logo-v2_2.svg" alt="Auspex logo" width="100" align="left" style="vertical-align: middle;" />
    <h1>Auspex Report</h1>
</p>



A zero-infrastructure test execution intelligence platform that turns raw Playwright results into actionable engineering dashboards automatically.

## Overview:
This is a two-part system built on top of standard Playwright test runs. It requires no change to test code. Just register a custom reporter once. A lightweight Reporter implementation captures per-test results, timing, and step-level data as your tests run, appending them to a durable, git-committed history. A CLI generator then reads that history and produces a single, self-contained HTML dashboard. No server, no database, no deployment. 

Rather than showing test results from just the last run, the project surfaces trends across your entire test history: which tests are getting slower, which ones are flaky, and where time is actually being spent, turning raw pass/fail data into answers, not just numbers.

The intended users are QA engineers, manual testers, and anyone who wants visibility into test health over time without standing up any infrastructure. 

## Setup
Auspex isn't yet published as an npm package, for now, integrating it into your own project means manually copying its source files and wiring up a few things. (Publishing as a proper npm package is a planned future improvement.)

### 1. Copy the source files
From a cloned copy of this repo, copy these folders into your own project's root:
- `src/reporter/` — the test reporter
- `src/shared/` — shared types and helpers (required by the reporter)
- `src/dashboard/` — optional, only needed if you want the dashboard generator too

### 2. Install required dependencies
```bash
npm install strip-ansi slugify minimist tsx
npm install @types/node --save-dev
```

### 3. Update your `tsconfig.json`
The reporter uses `.js`-extension imports (NodeNext module resolution) and needs Node types available:
```jsonc
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"]
  }
}
```

### 4. Register the reporter in `playwright.config.ts`
Add it to your existing reporter list, and make sure `testDir` is explicitly set:
```typescript
export default defineConfig({
  testDir: "./tests", // set this to your actual tests folder
  reporter: [
    ["list"],
    ["./src/reporter/InsightsReporter.ts"],
  ],
});
```

### 5. Add dashboard scripts to `package.json`
```json
"scripts": {
  "insights:dashboard": "npx tsx src/dashboard/insights-dashboard.ts",
  "insights:dashboard:open": "npx tsx src/dashboard/insights-dashboard.ts --open"
}
```

### 6. Run it
```bash
npx playwright test
npm run insights:dashboard:open
```

## Features:
- KPI Row
- Pass Rate Over Time
- Average Test Duration per Run 
- Tag Breakdown
- Flaky Test Leaderboard
- Duration Drift
- Slowest Steps
- Execution History
- Save Filters 
- Share View
- Download Report
- Email Summary
- Locked mode
- Run Details modal (dynamic per-run drill-down with Download Report)
- Test Details Pages 
- Failures & Flaky per Run chart
- Client-side filtering (Status/Environment dropdowns)
- Hash-routed navigation


## Test Commands:
For running all the playwright tests in the environment
```bash
npx playwright test
```

For testing the parsing in loadData.ts
```bash
npx tsx src/dashboard/loadData.ts
```

Generate and open the dashboard
```bash
# Generate only (for CI artifact upload)
npm run insights:dashboard

# Generate and open in default browser (local dev)
npm run insights:dashboard:open
```

## Tech Stack:
- Node.js
- TypeScript
- Playwright
- Chart.js (for data visualization)
- HTML/CSS
- JSONL
- JSON

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 