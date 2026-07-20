import type { Reporter, TestCase, TestResult, FullConfig, Suite, FullResult } from "@playwright/test/reporter";

export default class InsightsReporter implements Reporter {
    onBegin(config: FullConfig, suite: Suite) {
        const runId = "run-" + new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
    }

    onTestEnd(test: TestCase, result: TestResult) {

    }

    onEnd(result: FullResult) {

    }
}