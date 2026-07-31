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