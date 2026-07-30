import fs from "node:fs";
import { TrendEntry, RunMetadata } from "../shared/types.js";

/***
 * Step 1 of Dashboard Generation Flow
 * Helper file to read through the JSONL file and parse each line 
 * 1. Read file's contents as text
 * 2. split that text into individual lines
 * 3. parse each line as JSON
 * 4. Collect every parsed entry, from every file, into one big combined array
 */
export function loadTrendEntries(daysArg: number): TrendEntry[] {
    const files = fs.globSync("data/*.jsonl");
    let result: TrendEntry[] = [];

    for (const filePath of files) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const lines = raw.split("\n");

        for (const line of lines) {
            // if the line is not an empty string, do this
            if (line !== "") {
                const entry = JSON.parse(line);
                result.push(entry);
            }
        }
    }

    // to print the output of the parsing of result
    //console.log(result);


    // calculate the x amount of days since today
    const cutOffDate = getCutoffDate(daysArg);

    // filter result based on the determined offset days
    result = result.filter((entry) => {
        return entry.date >= cutOffDate;
    });
    return result;
}




export function loadRuns(daysArg: number): RunMetadata[] {
    const runFiles = fs.globSync("data/runs/*.json");
    let runs: RunMetadata[] = [];

    for (const filePath of runFiles) {
        const raw = fs.readFileSync(filePath, "utf-8");

        // if the line is not an empty string, do this
        if (raw !== "") {
            const currentRun = JSON.parse(raw);
            runs.push(currentRun);
        }
    }

    // to print the output of the parsing of runs
    // console.log(runs);

    // calculate the x amount of days since today
    const cutOffDate = getCutoffDate(daysArg);

    runs = runs.filter((entry) => {
        return entry.date >= cutOffDate;
    });

    return runs;
}

// FOR DEBUGGING: Shows the days argument
//console.log(daysArg);

// Helper functiont to calculate the cut off date to retrieve reports
function getCutoffDate(daysArg: number): string {
    const milliSecondsPerDay = 24 * 60 * 60 * 1000; // hours * minutes * minutes * milliseconds
    const cutOffMs = new Date().getTime() - (milliSecondsPerDay * daysArg);
    const cutOffDate = new Date(cutOffMs).toISOString().slice(0,10);

    return cutOffDate;
}

// indicates that the file has been ran
console.log("SUCCESS: loadData.ts");
