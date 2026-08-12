import minimist from "minimist";
import { loadTrendEntries, loadRuns } from "./loadData.js";
import { groupEntries, calculatePassRates, calculateAveragePassRate, calculateFlakyLeaderboard, calculateDurationDrift, calculateAverageDurationPerRun } from "./analytics.js";
import fs from "node:fs";
import { exec } from "node:child_process";
import { renderPassRateTable, renderPage, renderFlakyLeaderboard, renderRunsTable, renderRunDetail, renderTestDetail, renderDurationDriftTable, renderAvgDurationChart } from "./render.js";
import { TrendEntry } from "../shared/types.js";


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

// Runs table pipeline
const runs = loadRuns(daysArg);
const runsTable = renderRunsTable(runs);

const runDetailBlocks = renderRunDetail(runs);

const testDetailBlocks = renderTestDetail(entries);

const durationDrift = calculateDurationDrift(groupedTests);
const durationDriftTable = renderDurationDriftTable(durationDrift);

const avgDurations = calculateAverageDurationPerRun(groupedRuns);
const avgDurationChart = renderAvgDurationChart(avgDurations);

// Generating the full dashboard
const dashboardContent = passRateTable + flakyLeaderboard + durationDriftTable + avgDurationChart;
const dashboard = renderPage(dashboardContent, runsTable, runDetailBlocks, testDetailBlocks);

fs.writeFileSync(`./src/dashboard/insights.html`, dashboard);

console.log("SUCCESS: insights-dashboard.ts");

// check whether the CLI command intends to open the HTML file after generation
const shouldOpen = minimist(process.argv.slice(2)).open;
if (shouldOpen === true) {
    // check the user's OS
    const operatingSystem = process.platform;
    let command = "";

    if (operatingSystem === "win32") {
        command = "start";
    } 
    else if (operatingSystem === "darwin") {
        command = "open";
    }
    else {
        command = "xdg-open";
    }

    exec(`${command} ./src/dashboard/insights.html`);
}

function calculateAverageDurations(groupedTests: Record<string, TrendEntry[]>) {
    throw new Error("Function not implemented.");
}

