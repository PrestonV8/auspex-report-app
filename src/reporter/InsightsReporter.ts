import type { Reporter, TestCase, TestResult, FullConfig, Suite, FullResult } from "@playwright/test/reporter";
import fs from "node:fs";
import { RunTotals } from "../shared/types.js";

export default class InsightsReporter implements Reporter {
    private runId: string = "";
    private runDate: string = "";
    private runStartTs: string = "";
    private runTotals: RunTotals = { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0, timedOut: 0}; 

    onBegin(config: FullConfig, suite: Suite) {
        this.runId = "run-" + new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
        this.runDate = new Date().toISOString().slice(0, 10); // get only the date part (YYYY-MM-DD)
        this.runStartTs = new Date().toISOString();
        fs.mkdirSync(`./data/runs`, { recursive: true }); // creates the run directory if it doesn't exist
    }

    onTestEnd(test: TestCase, result: TestResult) {

    }

    onEnd(result: FullResult) {

    }
}