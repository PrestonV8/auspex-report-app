<p align="center">
    <img  src="assets/logo.svg" alt="Auspex logo" width="120" />
</p>

<h1 align="center">Auspex Report</h1>

A zero-infrastructure test execution intelligence platform that turns raw Playwright results into actionable engineering dashboards automatically.

## Overview:
This is a two-part system built on top of standard Playwright test runs. It requires no change to test code. Just register a custom reporter once. A lightweight Reporter implementation captures per-test results, timing, and step-level data as your tests run, appending them to a durable, git-committed history. A CLI generator then reads that history and produces a single, self-contained HTML dashboard. No server, no database, no deployment. 

Rather than showing test results from just the last run, the project surfaces trends across your entire test history: which tests are getting slower, which ones are flaky, and where time is actually being spent, turning raw pass/fail data into answers, not just numbers.

The intended users are QA engineers, manual testers, and anyone who wants visibility into test health over time without standing up any infrastructure. 

## Features:
- KPI Row
- Pass Rate Over Time
- Average Test Duration per Run 
- Tag Breakdown
- Flaky Test Leaderboard
- Duration Drift
- Slowest Steps
- Execuation History
- Save Filters 
- Share View
- Download Report
- Email Summary
- Locked mode

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