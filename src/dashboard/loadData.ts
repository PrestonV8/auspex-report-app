import fs from "node:fs";
import { TrendEntry } from "../shared/types.js";

/***
 * Step 1 of Dashboard Generation Flow
 * Helper file to read through the JSONL file and parse each line 
 * 1. Read file's contents as text
 * 2. split that text into individual lines
 * 3. parse each line as JSON
 * 4. Collect every parsed entry, from every file, into one big combined array
 */

const files = fs.globSync("data/*.jsonl");
const result: TrendEntry[] = [];

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

// to print the output of the parsing
//console.log(result);