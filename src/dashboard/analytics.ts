import { TrendEntry } from "../shared/types.js";
import { loadTrendEntries } from "./loadData.js";

// Helper function to group the entries into Key Value pairs
export function groupEntries(entries: TrendEntry[]): Record<string, TrendEntry[]> {
    const grouped: Record<string, TrendEntry[]> = {};
    for (const entry of entries) {
        if (!grouped[entry.runId]) {
            grouped[entry.runId] = [];
        }
        grouped[entry.runId].push(entry);
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


export function renderPassRateTable(passRates: Record<string, number>): string {
    const rows = Object.entries(passRates).map(([runId, rate]) => {
        return `<tr>
                <td>${runId}</td>
                <td>${Math.round(rate)}%</td>
                </tr>`;
    }).join("");

    const table = `<table>${rows}</table>`;

    return table;
}