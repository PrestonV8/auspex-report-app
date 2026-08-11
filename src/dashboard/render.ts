export function renderPassRateTable(passRates: Record<string, number>, averagePassRate: number): string {
    const runCount = Object.keys(passRates).length;
    const headline = `<p>Average pass rate across ${runCount} runs: ${Math.round(averagePassRate)}%</p>`;

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

    return `<section class="panel">${headline}${chartScript}</section>`;
}

// function to generate the flakyness leaderboard
export function renderFlakyLeaderboard(results: { testId: string, flakyCount: number, failCount: number }[]): string {
    const heading = `<h2>Flaky Leaderboard</h2>`;

    // for chart.js
    const labels = results.map((entry) => entry.testId);
    const flakyCounts = results.map((entry) => entry.flakyCount);
    const failCounts = results.map((entry) => entry.failCount);

    const chartData = {
        labels: labels,
        flakyCounts: flakyCounts,
        failCounts: failCounts
    };
    const chartDataJson = JSON.stringify(chartData);

    const chartScript = `<canvas id="flakyChart"></canvas>
<script>
const flakyChartData = ${chartDataJson};
new Chart(document.getElementById("flakyChart"), {
  type: "bar",
  data: {
    labels: flakyChartData.labels,
    datasets: [
      { label: "Flaky Count", data: flakyChartData.flakyCounts },
      { label: "Fail Count", data: flakyChartData.failCounts }
    ]
  }
});
</script>`;

    return `<section class="panel">${heading}${chartScript}</section>`;
}

// function to render the entire page layout
export function renderPage(content: string): string {
    const tabScript = `<script>
    const tabButtons = document.querySelectorAll(".tab-btn");

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
        document.querySelectorAll(".tab-content").forEach((tab) => {
            tab.style.display = "none";
        });

        tabButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        const targetId = button.dataset.tab + "-tab";
        document.getElementById(targetId).style.display = "block";
        button.classList.add("active");
        });
    });
    </script>`;

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
.tabs { display: flex; gap: 4px; background: #16161a; padding: 0 32px; border-bottom: 1px solid #2a2a31; }
.tab-btn { background: none; border: none; color: #9ca3af; padding: 14px 18px; font-size: 0.95rem; cursor: pointer; border-bottom: 2px solid transparent; }
.tab-btn.active { color: #fff; border-bottom-color: #CC0000; }
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
    <nav class="tabs">
    <button class="tab-btn active" data-tab="overview">Overview</button>
    <button class="tab-btn" data-tab="runs">Runs</button>
    <button class="tab-btn" data-tab="run-detail">Run detail</button>
    <button class="tab-btn" data-tab="test-detail">Test detail</button>
    </nav>
    <main class="page">
    <div class="tab-content" id="overview-tab">${content}</div>
    <div class="tab-content" id="runs-tab" style="display:none">Runs — coming soon</div>
    <div class="tab-content" id="run-detail-tab" style="display:none">Run detail — coming soon</div>
    <div class="tab-content" id="test-detail-tab" style="display:none">Test detail — coming soon</div>
    </main>
    ${tabScript}
    </body>
    </html>`;
}