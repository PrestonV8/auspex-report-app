import { RunMetadata, TrendEntry } from "../shared/types.js";

// function to render the pass rate table from the calculatePassRates function
export function renderPassRateTable(passRates: Record<string, number>, averagePassRate: number): string {
    const runCount = Object.keys(passRates).length;
    const headline = `<p>Average pass rate across ${runCount} runs: ${Math.round(averagePassRate)}%</p>`;

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

// function to render the flaky leaderboard chart and test links
export function renderFlakyLeaderboard(results: { testId: string, title: string, flakyCount: number, failCount: number }[]): string {
    const heading = `<h2>Flaky Leaderboard</h2>`;

    const labels = results.map((entry) => stripTagsFromTitle(entry.title));
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
  options: {
    indexAxis: "y",
    scales: { x: { beginAtZero: true } }
  },
  data: {
    labels: flakyChartData.labels,
    datasets: [
      { label: "Flaky Count", data: flakyChartData.flakyCounts },
      { label: "Fail Count", data: flakyChartData.failCounts }
    ]
  }
});
</script>`;

    const testLinks = results.map((entry) => {
        return `<a href="#/tests/${entry.testId}" class="test-link-box">${stripTagsFromTitle(entry.title)}</a>`;
    }).join("");

    return `<section class="panel">${heading}${chartScript}<div class="test-link-list">${testLinks}</div></section>`;
}

// function to render the duration drift table from the calculateDurationDrift function
export function renderDurationDriftTable(drifts: { testId: string, firstHalfAvg: number, lastHalfAvg: number, percentChange: number }[]): string {
    const heading = `<h2>Duration Drift</h2>`;

    const rows = drifts.map((drift) => {
      const direction = drift.percentChange > 0 ? "slower" : "faster";
      const color = drift.percentChange > 0 ? "red" : "green";
      return `<tr>
                <td>${drift.testId}</td>
                <td>${Math.round(drift.firstHalfAvg)}ms</td>
                <td>${Math.round(drift.lastHalfAvg)}ms</td>
                <td style="color:${color}">${Math.abs(Math.round(drift.percentChange))}% ${direction}</td>
                </tr>`;
    }).join("");

    const table = `<table>${rows || `<tr><td>No significant duration drift detected</td></tr>`}</table>`;

    return `<section class="panel">${heading}${table}</section>`;
}

// function to render and return teh HTML to generate the entire dashboard page
export function renderPage(overviewContent: string, runsContent: string, runDetailContent: string, testDetailContent: string, averagePassRate: number, runCount: number, avgDuration: number): string {
    const tabScript = `<script>
      const tabButtons = document.querySelectorAll(".tab-btn");
      const averagePassRate = ${averagePassRate};
      const runCount = ${runCount};
      const avgDuration = ${avgDuration};

      function showTab(targetId, isDynamic) {
        document.querySelectorAll(".tab-content").forEach((tab) => {
          tab.style.display = "none";
        });

        tabButtons.forEach((btn) => {
          btn.classList.remove("active");
        });

        const elementId = isDynamic ? targetId : targetId + "-tab";
        document.getElementById(elementId).style.display = "block";

        if (!isDynamic) {
          const matchingButton = document.querySelector('[data-tab="' + targetId + '"]');
          if (matchingButton) {
            matchingButton.classList.add("active");
          }
        }
      }

      function handleRoute() {
        const hash = location.hash.replace("#/", "").split("&")[0];

        if (hash.startsWith("runs/")) {
          const runId = hash.replace("runs/", "");
          showTab("run-detail-" + runId, true);
        } else if (hash.startsWith("tests/")) {
          const testId = hash.replace("tests/", "");
          showTab("test-detail-" + testId, true);
        } else {
          showTab(hash || "overview");
        }
      }

      tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          location.hash = "#/" + button.dataset.tab;
        });
      });

      function downloadReport(htmlContent, filename) {
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    }

      document.getElementById("shareBtn").addEventListener("click", () => {
        let url = location.href;
        if (!url.includes("locked=1")) {
          url += url.includes("#") ? "&locked=1" : "#locked=1";
        }
        navigator.clipboard.writeText(url).then(() => {
          alert("Link copied! Recipients will see a locked, read-only view.");
        });
      });

      document.getElementById("emailSummaryBtn").addEventListener("click", () => {
      const summary = "Test Run Summary\\nAverage Pass Rate: " + averagePassRate + "%\\nTotal Runs: " + runCount + "\\nAverage Duration: " + avgDuration + "s";

      navigator.clipboard.writeText(summary).then(() => {
        alert("Summary copied! Paste it into your email.");
      });
    });

      window.addEventListener("hashchange", handleRoute);
      handleRoute();
    </script>`;

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8" />
    <title>Auspex Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Segoe UI", system-ui, sans-serif; background: #1c1d2b; color: #f1f2f7; }
.app-header { background: #3d2a6b; color: #fff; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; }
.app-header h1 { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; }
.app-header button { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.35); border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 0.85rem; }
.tabs { display: flex; gap: 4px; background: #20212f; padding: 0 32px; border-bottom: 1px solid #34364a; }
.tab-btn { background: none; border: none; color: #9a9cb5; padding: 14px 18px; font-size: 0.95rem; cursor: pointer; border-bottom: 2px solid transparent; }
.tab-btn.active { color: #fff; border-bottom-color: #8b2fc9; }
.page { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
p { font-size: 1.1rem; margin-bottom: 16px; font-weight: 600; color: #f1f2f7; }
table { width: 100%; border-collapse: collapse; background: transparent; }
th, td { padding: 10px 16px; text-align: left; border-bottom: 1px solid #34364a; color: #cfd0e0; }
th { color: #9a9cb5; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; }
tr:last-child td { border-bottom: none; }
tr:hover { background: #2f3145; }
.panel { background: #262838; border: 1px solid #34364a; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; }
.panel table { box-shadow: none; }
.panel h2 { font-size: 1.15rem; margin-bottom: 12px; color: #f1f2f7; font-weight: 700; }
.panel p { margin-bottom: 12px; color: #f1f2f7; }
.accordion-item { border-bottom: 1px solid #34364a; }
.accordion-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 4px; cursor: pointer; color: #f1f2f7; }
.accordion-chevron { transition: transform 0.2s ease; color: #9a9cb5; }
.accordion-body { padding: 8px 4px 16px; color: #cfd0e0; font-size: 0.9rem; }
.test-link-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.test-link-box { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #2a2b3d; border: 1px solid #34364a; border-radius: 8px; color: #f1f2f7; text-decoration: none; font-size: 0.9rem; transition: background 0.15s ease, border-color 0.15s ease; }
.test-link-box:hover { background: #323450; border-color: #8b2fc9; }
    </style>
    </head>
    <body>
    <header class="app-header">
    <h1>Auspex</h1>
    <button id="shareBtn">Share View</button>
    <button id="emailSummaryBtn">Email Summary</button>
    </header>
    <nav class="tabs">
    <button class="tab-btn active" data-tab="overview">Overview</button>
    <button class="tab-btn" data-tab="runs">Runs</button>
    </nav>
    <main class="page">
    <div class="tab-content dashboard-grid" id="overview-tab">${overviewContent}</div>
    <div class="tab-content" id="runs-tab" style="display:none">${runsContent}</div>
    ${runDetailContent}
    ${testDetailContent}
    </main>
    ${tabScript}
    </body>
    </html>`;
}

// function to render the runs table from the calculatePassRates function
export function renderRunsTable(runs: RunMetadata[]): string {
    const heading = `<h2>Execution History</h2>`;

    const runsJson = JSON.stringify(runs);

    const filterScript = `<select id="statusFilter">
      <option value="all">All Statuses</option>
      <option value="passed">Passed</option>
      <option value="failed">Failed</option>
      <option value="timedOut">Timed Out</option>
    </select>
    <select id="envFilter">
      <option value="all">All Environments</option>
      <option value="UAT">UAT</option>
      <option value="unknown">Unknown</option>
    </select>
    <button id="saveFiltersBtn">Save Filters</button>
    <table><tbody id="runsTableBody"></tbody></table>
    <script>
      const allRuns = ${runsJson};
      if (location.hash.includes("locked=1")) {
      document.getElementById("statusFilter").style.display = "none";
      document.getElementById("envFilter").style.display = "none";
      document.getElementById("saveFiltersBtn").style.display = "none";
    }


      function renderRows() {
        const statusValue = document.getElementById("statusFilter").value;
        const envValue = document.getElementById("envFilter").value;

        let filtered = allRuns;

        if (statusValue !== "all") {
          filtered = filtered.filter((run) => run.runStatus === statusValue);
        }

        if (envValue !== "all") {
          filtered = filtered.filter((run) => (run.environment.Environment || "unknown") === envValue);
        }

        const rowsHtml = filtered.map((run) => {
          return "<tr onclick=\\"location.hash = '#/runs/" + run.runId + "'\\" style=\\"cursor:pointer\\">" +
                 "<td>" + run.runId + "</td>" +
                 "<td>" + run.date + "</td>" +
                 "<td>" + run.runStatus + "</td>" +
                 "<td>" + run.totals.passed + "</td>" +
                 "<td>" + run.totals.failed + "</td>" +
                 "<td>" + run.totals.flaky + "</td>" +
                 "</tr>";
        }).join("");

        document.getElementById("runsTableBody").innerHTML = rowsHtml;
      }

      document.getElementById("statusFilter").addEventListener("change", renderRows);
      document.getElementById("envFilter").addEventListener("change", renderRows);

      document.getElementById("saveFiltersBtn").addEventListener("click", () => {
        localStorage.setItem("statusFilter", document.getElementById("statusFilter").value);
        localStorage.setItem("envFilter", document.getElementById("envFilter").value);
        alert("Filters saved!");
      });

      const savedStatus = localStorage.getItem("statusFilter");
      const savedEnv = localStorage.getItem("envFilter");
      if (savedStatus) document.getElementById("statusFilter").value = savedStatus;
      if (savedEnv) document.getElementById("envFilter").value = savedEnv;

      renderRows();
    </script>`;

    return `<section class="panel">${heading}${filterScript}</section>`;
}

// function to set up the run details block of the dashboard
export function renderRunDetail(runs: RunMetadata[]): string {
    const blocks = runs.map((run) => {
        const reportHtml = `<html><head><title>${run.runId}</title>
<style>body{font-family:sans-serif;background:#0d0d0f;color:#e4e4e7;padding:24px;}
h2{color:#f4f4f5;} p{margin-bottom:8px;}</style></head><body>
<h2>Run Report — ${run.runId}</h2>
<p>Date: ${run.date}</p>
<p>Status: ${run.runStatus}</p>
<p>Duration: ${Math.round(run.durationMs / 1000)}s</p>
<h3>Environment</h3>
<p>Environment: ${run.environment.Environment ?? "N/A"}</p>
<p>Branch: ${run.environment.Branch ?? "N/A"}</p>
<h3>Executor</h3>
<p>Name: ${run.executor.name ?? "N/A"}</p>
<p>Type: ${run.executor.type ?? "N/A"}</p>
<h3>Totals</h3>
<p>${run.totals.passed} passed, ${run.totals.failed} failed, ${run.totals.flaky} flaky, ${run.totals.skipped} skipped, ${run.totals.timedOut} timedOut</p>
</body></html>`;

        const reportHtmlEscaped = JSON.stringify(reportHtml);

        return `<div class="tab-content run-detail-block" id="run-detail-${run.runId}" style="display:none">
                <section class="panel">
                    <h2>Run Detail — ${run.runId}</h2>
                    <p>Date: ${run.date}</p>
                    <p>Status: ${run.runStatus}</p>
                    <p>Duration: ${Math.round(run.durationMs / 1000)}s</p>
                    <p>Environment: ${run.environment.Environment ?? "N/A"} (${run.environment.Branch ?? "N/A"})</p>
                    <p>Executor: ${run.executor.name} (${run.executor.type})</p>
                    <p>Totals: ${run.totals.passed} passed, ${run.totals.failed} failed, ${run.totals.flaky} flaky, ${run.totals.skipped} skipped, ${run.totals.timedOut} timedOut</p>
                    <button onclick='downloadReport(${reportHtmlEscaped}, "${run.runId}.html")'>Download Report</button>
                </section>
                </div>`;
    }).join("");

    return blocks;
}

// function to set up the test details block of the dashboard. Test details shown at the flaky leaderboard chart links
export function renderTestDetail(entries: TrendEntry[]): string {
    const latestByTestId = new Map<string, TrendEntry>();
    for (const entry of entries) {
      latestByTestId.set(entry.testId, entry);
    }

    const blocks = Array.from(latestByTestId.values()).map((entry) => {
      const stepsHtml = entry.steps.map((step) => {
        return `<p>${step.title} — ${step.durationMs}ms</p>`;
      }).join("");

      return `<div class="tab-content" id="test-detail-${entry.testId}" style="display:none">
                <section class="panel">
                    <h2>Test Detail — ${stripTagsFromTitle(entry.title)}</h2>
                    <p>Status: ${entry.status}</p>
                    <p>Duration: ${Math.round(entry.duration / 1000)}s</p>
                    <p>Flaky: ${entry.flaky}</p>
                    <p>Project: ${entry.project}</p>
                    <p>Error: ${entry.errorMessage || "None"}</p>
                </section>
                <section class="panel">
                    <h2>Steps</h2>
                    ${stepsHtml || "<p>No steps recorded</p>"}
                </section>
                <section class="panel">
                    <h2>Terminal Output</h2>
                    <pre>${entry.stdout || "No stdout captured"}</pre>
                    <pre>${entry.stderr || "No stderr captured"}</pre>
                </section>
                </div>`;
    }).join("");

    return blocks;
}


// function to render the average duration per run
export function renderAvgDurationChart(durations: Record<string, number>): string {
  const heading = `<h2>Average Duration per Run</h2>`;

  const chartData = {
    labels: Object.keys(durations),
    data: Object.values(durations).map((ms) => Math.round(ms / 1000))
  };

  const chartDataJson = JSON.stringify(chartData);

  const chartScript = `<canvas id="avgDurationChart"></canvas>
  <script>
  const avgDurationData = ${chartDataJson};
  new Chart(document.getElementById("avgDurationChart"), {
    type: "line",
    data: {
      labels: avgDurationData.labels,
      datasets: [{
        label: "Avg Duration (s)",
        data: avgDurationData.data
      }]
    }
  });
  </script>`;

  return `<section class="panel">${heading}${chartScript}</section>`;
}

// funcion to render the slowed steps calculations
export function renderSlowSteps(steps: {title: string, avgDurationMs: number }[]): string {
  const heading = `<h2>Slowest Steps</h2>`;

  const rows = steps.map((step) => {
    return `<tr>
    <td>${step.title}</td>
    <td>${Math.round(step.avgDurationMs)}ms</td>
    </tr>`;
  }).join("");

  const table = `<table>${rows}</table>`;

  return `<section class="panel">${heading}${table}</section>`;
}

// function to render the tag breakdown calculations
export function renderTagBreakdown(tags: { tag: string, passed: number, failed: number }[]): string {
    const heading = `<h2>Tag Breakdown</h2>`;

    const rows = tags.map((entry) => {
        return `<tr>
                <td>${entry.tag}</td>
                <td>${entry.passed}</td>
                <td>${entry.failed}</td>
                </tr>`;
    }).join("");

    const table = `<table>${rows}</table>`;

    return `<section class="panel">${heading}${table}</section>`;
}

// function to render the KPI row
export function renderKPIRow(averagePassRate: number, runCount: number, avgDurations: Record<string, number>): string {
  const avgDurationValues = Object.values(avgDurations);
  const overallAvgDuration = avgDurationValues.reduce((sum, val) => sum + val, 0) / avgDurationValues.length;

    return `<section class="panel">
            <div style="display:flex; gap:32px; flex-wrap:wrap;">
                <div><p style="margin-bottom:4px; color:#9ca3af; font-size:0.85rem;">Avg Pass Rate</p><h2>${Math.round(averagePassRate)}%</h2></div>
                <div><p style="margin-bottom:4px; color:#9ca3af; font-size:0.85rem;">Total Runs</p><h2>${runCount}</h2></div>
                <div><p style="margin-bottom:4px; color:#9ca3af; font-size:0.85rem;">Avg Duration</p><h2>${Math.round(overallAvgDuration / 1000)}s</h2></div>
            </div>
            </section>`;
}

// helper function to strip the tags from the test title for dashboard display
function stripTagsFromTitle(title: string): string {
  return title.replace(/\s*@\w+/g, "").trim();
}