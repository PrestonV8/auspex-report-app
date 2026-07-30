

export function renderPassRateTable(passRates: Record<string, number>, averagePassRate: number): string {
    const rows = Object.entries(passRates).map(([runId, rate]) => {
        return `<tr>
                <td>${runId}</td>
                <td>${Math.round(rate)}%</td>
                </tr>`;
    }).join("");

    const runCount = Object.keys(passRates).length;

    const headline = `<p>Average pass rate across ${runCount} runs: ${Math.round(averagePassRate)}%</p>`;

    const table = `<table>${rows}</table>`;

    return headline + table;
}