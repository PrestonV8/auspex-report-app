import minimist from "minimist";
import { loadTrendEntries, loadRuns } from "./loadData.js";
import { TrendEntry } from "../shared/types.js";
import { groupEntries, calculatePassRates, renderPassRateTable } from "./analytics.js";
import fs from "node:fs";


// used to filter the entries by amount of days since current dat. Default is over the past 30 days
const daysArg = minimist(process.argv.slice(2)).days ?? 30;

//console.log(calculatePassRates(groupEntries(loadTrendEntries(daysArg))));
//console.log(renderPassRateTable(daysArg))

// generate the sequence in which to create the dashboard
const entries = loadTrendEntries(daysArg);
const grouped = groupEntries(entries);
const passRates = calculatePassRates(grouped);
const passRateTable = renderPassRateTable(passRates);

fs.writeFileSync(`./src/dashboard/insights.html`, passRateTable);