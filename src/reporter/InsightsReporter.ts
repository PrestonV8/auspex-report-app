import type { Reporter, TestCase, TestResult, FullConfig, Suite, FullResult } from "@playwright/test/reporter";

export class InsightsReporter implements Reporter {
    onBegin(config: FullConfig, suite: Suite) {

    }

    onTestEnd(test: TestCase, result: TestResult) {

    }

    onEnd(result: FullResult) {

    }
}