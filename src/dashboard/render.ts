

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

    // for chart.js
    const chartData = {
        labels: Object.keys(passRates),
        data: Object.values(passRates)
    };
    const chartDataJson = JSON.stringify(chartData);
    const chartScript = `<canvas id="passRateChart"></canvas>
<script>
const passRateData = ${chartDataJson};
new Chart(document.getElementById("passRateChart"), {
  type: "line",
  data: {
    labels: passRateData.labels,
    datasets: [{
      label: "Pass Rate %",
      data: passRateData.data
    }]
  }
});
</script>`;

    return `<section class="panel">${headline}${table}${chartScript}</section>`;
}

// function to generate the flakyness leaderboard
export function renderFlakyLeaderboard(results: { testId: string, flakyCount: number, failCount: number }[]): string {
    const rows = results.map((entry) => {
        return `<tr>
        <td>${entry.testId}</td>
        <td>${entry.flakyCount}</td>
        <td>${entry.failCount}</td>
                </tr>`;
    }).join("");

    const table = `<h2>Flaky Leaderboard</h2>
    <table>${rows}</table>`

    return `<section class="panel">${table}</section>`
}

export function renderPage(content: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8" />
    <title>Auspex Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Segoe UI", system-ui, sans-serif; background: #0d0d0f; color: #e4e4e7; }
.app-header { background: #CC0000; color: #fff; padding: 20px 32px; }
.app-header h1 { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; }
.page { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
p { font-size: 1.1rem; margin-bottom: 16px; font-weight: 600; color: #e4e4e7; }
table { width: 100%; border-collapse: collapse; background: transparent; }
th, td { padding: 10px 16px; text-align: left; border-bottom: 1px solid #2e2e35; color: #d4d4d8; }
th { color: #9ca3af; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; }
tr:last-child td { border-bottom: none; }
tr:hover { background: #232329; }
.panel { background: #1a1a1f; border: 1px solid #2a2a31; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; }
.panel table { box-shadow: none; }
.panel h2 { font-size: 1.15rem; margin-bottom: 12px; color: #f4f4f5; font-weight: 700; }
.panel p { margin-bottom: 12px; color: #e4e4e7; }
    </style>
    </head>
    <body>
    <header class="app-header">
    <h1>Auspex</h1>
    </header>
    <main class="page">
    ${content}
    </main>
    </body>
    </html>`;
}