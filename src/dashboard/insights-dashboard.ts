import minimist from "minimist";
import { loadTrendEntries, loadRuns } from "./loadData.js";
import { groupEntries, calculatePassRates, calculateAveragePassRate, calculateFlakyLeaderboard } from "./analytics.js";
import fs from "node:fs";
import { renderPassRateTable, renderPage, renderFlakyLeaderboard } from "./render.js";


// used to filter the entries by amount of days since current dat. Default is over the past 30 days
const daysArg = minimist(process.argv.slice(2)).days ?? 30;

//console.log(calculatePassRates(groupEntries(loadTrendEntries(daysArg))));
//console.log(renderPassRateTable(daysArg))

// Pass Rate table pipeline
const entries = loadTrendEntries(daysArg);
const groupedRuns = groupEntries(entries, "runId");
const passRates = calculatePassRates(groupedRuns);
const averagePassRate = calculateAveragePassRate(passRates);
const passRateTable = renderPassRateTable(passRates, averagePassRate);


// Flakyness Leaderboard pipeline
const groupedTests = groupEntries(entries, "testId");
const flakyness = calculateFlakyLeaderboard(groupedTests);
const flakyLeaderboard = renderFlakyLeaderboard(flakyness);

// Generating the full dashboard
const dashboardContent = passRateTable + flakyLeaderboard;
const dashboard = renderPage(dashboardContent);

fs.writeFileSync(`./src/dashboard/insights.html`, dashboard);