import type { Reporter, TestCase, TestResult, FullConfig, Suite, FullResult } from "@playwright/test/reporter";
import fs from "node:fs";
import { RunTotals, TrendEntry, RunEnvironment, RunExecutor, RunMetadata } from "../shared/types.js";
import { flattenSteps } from "../shared/flattenSteps.js";
import { joinOutput } from "../shared/joinOutput.js";
import stripAnsi from "strip-ansi"
import slugify from "slugify";

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
        // Step 1
        if (result.status === "skipped") {
            this.runTotals.skipped++;
            return;
        }

        // Step 2
        const isFlaky: boolean = result.status === "passed" && result.retry > 0;

        // get the date of when the test ended
        const today = new Date().toISOString().slice(0, 10);

        // Step 5
        const entry: TrendEntry = {
            duration: result.duration,
            flaky: isFlaky,
            status: result.status,
            retries: result.retry,
            workerIndex: result.workerIndex,
            tags: test.tags,
            project: test.parent.project()?.name ?? "unknown",
            title: test.titlePath().join(" > "),
            runId: this.runId,
            ts: new Date().toISOString(), // create a new timestamp
            date: today,
            errorMessage: stripAnsi(result.errors[0]?.message ?? "").slice(0, 500),
            stdout: joinOutput(result.stdout, 10000),
            stderr: joinOutput(result.stderr, 5000),
            steps: flattenSteps(result.steps),
            testId: slugify(test.titlePath().join(" > "), { lower: true })
        };
        
        this.runTotals.total++;

        switch (result.status) {
            case "passed":
                this.runTotals.passed++;
                break;
            case "failed":
                this.runTotals.failed++;
                break;
            case "timedOut":
                this.runTotals.timedOut++;
                break;
        }

        if (isFlaky === true) {
            this.runTotals.flaky++;
        }

        fs.appendFileSync(`data/${today}.jsonl`, JSON.stringify(entry) + "\n");
    }

    onEnd(result: FullResult) {
        const now = new Date();
        const nowMs = now.getTime();
        const endTs = now.toISOString();
        const startMs = new Date(this.runStartTs).getTime();

        const durationMs = nowMs - startMs;

        let environment: RunEnvironment = { Environment: "unknown", Branch: "unknown" };

        try {
            const raw = fs.readFileSync("allure-results/environment.properties", "utf-8");
            const lines = raw.split("\n");

            for (const line of lines) {
                const parts = line.split("=");
                const key = parts[0];
                const value = parts[1];

                if (key === "Environment") {
                    environment.Environment = value;
                } else if (key === "Branch") {
                    environment.Branch = value;
                }
            }
        } catch {
            
        }

        let executor: RunExecutor = { name: "unknown", type: "unknown", buildName: "unknown" };

        try {
            const raw = fs.readFileSync("allure-results/executor.json", "utf-8");
            executor = JSON.parse(raw);
        } catch {
            try {
                const raw = fs.readFileSync("allure-config/executor.json", "utf-8");
                executor = JSON.parse(raw);
            } catch {

            }
        }

        // assembling a RunMetadata object and writing it to disk
        const metadata: RunMetadata = {
            runId: this.runId,
            date: this.runDate,
            ts: this.runStartTs,
            endTs: endTs,
            durationMs: durationMs,
            runStatus: result.status === "timedout" ? "timedOut" : result.status,
            environment: environment,
            executor: executor,
            totals: this.runTotals,
        };

        // finally, creating a new file for the report
        fs.writeFileSync(`./data/runs/${this.runId}.json`, JSON.stringify(metadata));
    }
}