export interface TrendEntry {
    runId: string;
    duration: number;
    flaky: boolean;
    tags: string[];
    ts: string;
    date: string;
    testId: string;
    title: string;
    project: string;
    status: "passed" | "failed" | "timedOut" | "skipped" | "interrupted"; 
    retries: number; 
    errorMessage: string; 
    stdout: string;
    stderr: string;
    workerIndex: number;
    steps: TrendStep[];
}

export interface TrendStep {
    title: string;
    durationMs: number;
    level: number;
    category: string;
}

export interface RunMetadata {
    runId: string;
    date: string;
    ts: string;
    endTs: string;
    durationMs: number;
    runStatus: "passed" | "failed" | "timedOut" | "skipped" | "interrupted"; 
    environment: RunEnvironment;
    executor: RunExecutor;
    totals: RunTotals;
}

export interface RunExecutor {
    name: string;
    type: string;
    buildName: string;
}

export interface RunEnvironment {
    Environment: string;
    Branch: string;
}

export interface RunTotals {
    total: number;
    passed: number;
    failed: number;
    flaky: number;
    skipped: number;
    timedOut: number;
}