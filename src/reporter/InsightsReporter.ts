import type { Reporter, TestCase, TestResult, FullConfig, Suite, FullResult } from "@playwright/test/reporter";
import fs from "node:fs";
import { RunTotals, TrendStep } from "../shared/types.js";
import { flattenSteps } from "../shared/flattenSteps.js";

export default class InsightsReporter implements Reporter {
    private runId: string = "";
    private runDate: string = "";
    private runStartTs: string = "";
    private runTotals: RunTotals = { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0, timedOut: 0}; 


    /*
     * Generates the runId for runnings tests.
     * Records the date it ran and time stamp of when the run started.
     * Creates a directory "data/runs" if it doesn't exist in the project root
     * initializes the totals object to keep track of the number of tests that passed, failed, flaky, skipped, and timed out.
    */
    onBegin(config: FullConfig, suite: Suite) {
        this.runId = "run-" + new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
        this.runDate = new Date().toISOString().slice(0, 10); // get only the date part (YYYY-MM-DD)
        this.runStartTs = new Date().toISOString();
        fs.mkdirSync(`./data/runs`, { recursive: true }); // creates the run directory if it doesn't exist
    }

    /*
     * The process when the testing period ends and what to do with the results.
     * 1. Skip check - skipped tests increment counter and return early
     * 2. Flaky detection - results.status == "passed" && result.retry > 0.
     * 3. Step flattening - flattenSteps(result.steps) recursively walks step tree to record title, durationMs, level, category, stepError from nested tree to flat array
     * 4. Stdout/stderr capture - joins buffer arrays, strips ANSI codes, truncates to 10 000 / 5 000 chars.
     * 5. JSONL append - serialises TrendEntry and appends to data/YYYY-MM-DD.jsonl via appendFileSync.
     */
    onTestEnd(test: TestCase, result: TestResult) {
        const isFlaky: boolean = result.status === "passed" && result.retry > 0;
        
        if (result.status === "skipped") {
            this.runTotals.skipped++;
            return;
        }
        
    }

    onEnd(result: FullResult) {

    }
}

