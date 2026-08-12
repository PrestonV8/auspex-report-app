// For all the computation and calculations the dashboard needs
import { TrendEntry } from "../shared/types.js";
import { loadTrendEntries } from "./loadData.js";


type GroupableField = "runId" | "testId";

// Helper function to group the entries into Key Value pairs
export function groupEntries(entries: TrendEntry[], field: GroupableField): Record<string, TrendEntry[]> {
    const grouped: Record<string, TrendEntry[]> = {};
    for (const entry of entries) {
        if (!grouped[entry[field]]) {
            grouped[entry[field]] = [];
        }
        grouped[entry[field]].push(entry);
    }

    return grouped;
}


// Helper function to calculate the pass rate of tests
export function calculatePassRates(grouped: Record<string, TrendEntry[]>): Record<string, number> {
    const passRates: Record<string, number> = {};

    for (const runId in grouped) {
        const entries = grouped[runId];

        const totalCount = entries.length;
        const passedCount = entries.filter((entry) => {
            return entry.status === "passed";
        }).length;
        const rate = (passedCount / totalCount) * 100;

        passRates[runId] = rate;
    }

    return passRates;
}

// helper function to calculate the average pass rate of all runs
export function calculateAveragePassRate(passRates: Record<string, number>): number {
    const values = Object.values(passRates);

    let sum = 0;
    for (const value of values) {
        sum += value;
    }

    const averagePassRate = sum / values.length;

    return averagePassRate;
}


// function to build the calculate the flakyness of the tests
export function calculateFlakyLeaderboard(grouped: Record<string, TrendEntry[]>): { testId: string, flakyCount: number, failCount: number }[] {
    const results = [];
    
    for (const testId in grouped) {
        const entries = grouped[testId];

        // count how many entries have flaky === true 
        const flakyCount = entries.filter((entry) => {
            return entry.flaky === true
        }).length;
        
        // count how many entries have status === "failed" or "timedOut"
        const failCount = entries.filter((entry) => {
            return entry.status === "failed" || entry.status === "timedOut"
        }).length;

        // add as an object into the results array
        results.push({testId, flakyCount, failCount})
    }

    results.sort((a,b) => (b.flakyCount + b.failCount) - (a.flakyCount + a.failCount));

    // get top 15 results only
    const top15Results = results.slice(0, 15);

    return top15Results;
}

// function to calculate the duration drift of the tests
export function calculateDurationDrift(entries: Record<string, TrendEntry[]>): { testId: string, firstHalfAvg: number, lastHalfAvg: number, percentChange: number }[] {
    const results = [];
    for (const testId in entries) {
        const testEntries = entries[testId];
        testEntries.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

        const midpoint = Math.floor(testEntries.length / 2);
        const firstHalf = testEntries.slice(0, midpoint);
        const lastHalf = testEntries.slice(midpoint);

        let firstHalfSum = 0;
        for (const entry of firstHalf) {
            firstHalfSum += entry.duration;
        }
        const firstHalfAvg = firstHalfSum / firstHalf.length;

        let lastHalfSum = 0;
        for (const entry of lastHalf) {
            lastHalfSum += entry.duration;
        }
        const lastHalfAvg = lastHalfSum / lastHalf.length;

        const percentChange = ((lastHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

        // check with 10% threshold, if the percent change is greater than or equal to 10% then add it to the results array
        if (Math.abs(percentChange) >= 10) {
            results.push({ testId, firstHalfAvg, lastHalfAvg, percentChange });
        }
    }

    return results;
}

// function to calculate the average duration of all tests
export function calculateAverageDurationPerRun(grouped: Record<string, TrendEntry[]>): Record<string, number> {
    const averages: Record<string, number> = {};

    for (const runId in grouped) {
        const entries = grouped[runId];

        let sum = 0;
        for (const entry of entries) {
            sum += entry.duration;
        }

        averages[runId] = sum / entries.length;
    }

    return averages;
}

// function to calculate the slow steps
export function calculateSlowSteps(entries: TrendEntry[]): { title: string, avgDurationMs: number}[] {
    // Step 1: flatten every step from every entry into a single array
    const allSteps: TrendStep[] = [];
    for (const entry of entries) {
        for (const step of entry.steps) {
            allSteps.push(step);
        }
    }

    // Step 2: group the flattened steps by their title
    const grouped: Record<string, TrendStep[]> = {};
    for (const step of allSteps) {
        if (!grouped[step.title]) {
            grouped[step.title] = [];
        }
        grouped[step.title].push(step);
    }

    // Step 3: average durationMs per title
    const results = [];
    for (const title in grouped) {
        const steps = grouped[title];

        let sum = 0;
        for (const step of steps) {
            sum += step.durationMs;
        }
        const avgDurationMs = sum / steps.length;

        results.push({title, avgDurationMs});
    }

    // Step 4: sort descending, take top 20
    results.sort((a,b) => b.avgDurationMs - a.avgDurationMs);
    const top20 = results.slice(0, 20);

    return top20;
}