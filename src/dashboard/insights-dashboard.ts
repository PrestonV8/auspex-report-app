import minimist from "minimist";
import { loadTrendEntries, loadRuns } from "./loadData.js";


// used to filter the entries by amount of days since current dat. Default is over the past 30 days
const daysArg = minimist(process.argv.slice(2)).days ?? 30;

console.log(loadTrendEntries(daysArg));
console.log(loadRuns(daysArg));