<p>
    <img  src="assets/auspex-logo-v2_2.svg" alt="Auspex logo" width="90" align="left" />
    <h1>Auspex Report</h1>
</p>



A zero-infrastructure test execution intelligence platform that turns raw Playwright results into actionable engineering dashboards automatically.

## Overview:
This is a two-part system built on top of standard Playwright test runs. It requires no change to test code. Just register a custom reporter once. A lightweight Reporter implementation captures per-test results, timing, and step-level data as your tests run, appending them to a durable, git-committed history. A CLI generator then reads that history and produces a single, self-contained HTML dashboard. No server, no database, no deployment. 

Rather than showing test results from just the last run, the project surfaces trends across your entire test history: which tests are getting slower, which ones are flaky, and where time is actually being spent, turning raw pass/fail data into answers, not just numbers.

The intended users are QA engineers, manual testers, and anyone who wants visibility into test health over time without standing up any infrastructure. 

## Setup
1. Clone the repo
2. Run `npm install`
3. Add `InsightsReporter.ts` to your `playwright.config.ts`:

```typescript
    import { defineConfig } from "@playwright/test";

    export default defineConfig({
        testDir: "./tests",
        reporter: [
            ["list"],
            ["./src/reporter/InsightsReporter.ts"],
        ],
    });
```

4. Run your tests: `npx playwright test`
5. Generate the dashboard: `npm run insights:dashboard:open`

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