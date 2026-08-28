import { RunMetadata, TrendEntry } from "../shared/types.js";

// function to render the pass rate table from the calculatePassRates function
export function renderPassRateTable(passRates: Record<string, number>, averagePassRate: number): string {
    const runCount = Object.keys(passRates).length;
    const headline = `<p>Average Pass Rate Across ${runCount} Runs: ${Math.round(averagePassRate)}%</p>`;

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
  options: {
    scales: {
      x: {
        ticks: { color: "#cfd0e0" }
      },
      y: {
        ticks: { color: "#cfd0e0" }
      }
    },
    plugins: {
      legend: {
        labels: { color: "#cfd0e0" }
      }
    }
  },
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
  scales: {
    x: {
      beginAtZero: true,
      title: { display: true, text: "Count", color: "#cfd0e0" },
    ticks: { color: "#cfd0e0", stepSize: 1, precision: 0 }
    },
    y: {
      title: { display: true, text: "Test", color: "#cfd0e0" },
    ticks: { color: "#cfd0e0" }
    }
  }
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
export function renderDurationDriftTable(drifts: { testId: string, title: string, firstHalfAvg: number, lastHalfAvg: number, percentChange: number }[]): string {
    const heading = `<h2>Duration Drift</h2>`;

    const rows = drifts.map((drift) => {
      const direction = drift.percentChange > 0 ? "slower" : "faster";
      const color = drift.percentChange > 0 ? "red" : "green";
      return `<tr>
                <td>${stripTagsFromTitle(drift.title)}</td>
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

      function openRunModal(runId) {
      const run = runDetailsData.find((r) => r.runId === runId);
      
      if (!run) {
      return;
      }

      const statusColor = run.status === "passed" ? "#639922" : "#E24B4A";
      const statusText = run.status.toUpperCase();

      document.getElementById("runModalBody").innerHTML =
        "<table style='width:100%'>" +
        "<tr><td style='color:#9a9cb5;padding:6px 0'>Run ID</td><td style='color:#f1f2f7;text-align:right'>" + run.runId + "</td></tr>" +
        "<tr><td style='color:#9a9cb5;padding:6px 0'>Date</td><td style='color:#f1f2f7;text-align:right'>" + run.date + "</td></tr>" +
        "<tr><td style='color:#9a9cb5;padding:6px 0'>Status</td><td style='color:" + statusColor + ";text-align:right;font-weight:600'>" + statusText + "</td></tr>" +
        "<tr><td style='color:#9a9cb5;padding:6px 0'>Duration</td><td style='color:#f1f2f7;text-align:right'>" + run.duration + "s</td></tr>" +
        "<tr><td style='color:#9a9cb5;padding:6px 0'>Environment</td><td style='color:#f1f2f7;text-align:right'>" + run.environment + " (" + run.branch + ")</td></tr>" +
        "<tr><td style='color:#9a9cb5;padding:6px 0'>Executor</td><td style='color:#f1f2f7;text-align:right'>" + run.executorName + " (" + run.executorType + ")</td></tr>" +
        "<tr><td style='color:#9a9cb5;padding:6px 0'>Totals</td><td style='color:#f1f2f7;text-align:right'>" + run.totals.passed + " passed, " + run.totals.failed + " failed, " + run.totals.flaky + " flaky</td></tr>" +
        "</table>" +
        "<div class='modal-footer'><button id='modalDownloadBtn' class='modal-download-btn'>Download report</button></div>";

      document.getElementById("modalDownloadBtn").addEventListener("click", () => {
        downloadReport(run.reportHtml, run.runId + ".html");
      });

      document.getElementById("runModalBackdrop").classList.add("active");
      location.hash = "#/runs/" + runId;
    }
      function closeRunModal() {
        document.getElementById("runModalBackdrop")?.classList.remove("active");
        if (location.hash.startsWith("#/runs/")) {
          location.hash = "#/runs";
        }
      }

      function handleRoute() {
        const hash = location.hash.replace("#/", "").split("&")[0];

        if (hash.startsWith("runs/")) {
          const runId = hash.replace("runs/", "");
          showTab("runs");
          openRunModal(runId);
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
tbody tr:hover { background: #2f3145; }
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
.modal-backdrop { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.55); align-items: center; justify-content: center; z-index: 100; }
.modal-backdrop.active { display: flex; }
.modal-card { width: 420px; background: #262838; border: 1px solid #34364a; border-radius: 12px; padding: 24px 28px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-header h2 { color: #f1f2f7; font-size: 1.1rem; font-weight: 700; margin: 0; }
.modal-close { color: #9a9cb5; cursor: pointer; font-size: 1.3rem; background: none; border: none; }
.modal-body { border-top: 1px solid #34364a; padding-top: 14px; }
.modal-body table { font-size: 0.85rem; }
.modal-footer { margin-top: 18px; display: flex; justify-content: flex-end; }
.modal-download-btn { background: #8b2fc9; color: #fff; border: none; border-radius: 6px; padding: 8px 16px; font-size: 0.85rem; cursor: pointer; transition: background 0.15s ease; }
.modal-download-btn:hover { background: #9d3fdb; }
.filter-select { background: #262838; color: #f1f2f7; border: 1px solid #8b2fc9; border-radius: 6px; padding: 8px 14px; font-size: 0.85rem; cursor: pointer; }
.filter-select:hover { border-color: #9d3fdb; }
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
.kpi-card { background: #262838; border: 1px solid #34364a; border-radius: 12px; padding: 16px 20px; }
.kpi-label { color: #9a9cb5; font-size: 0.8rem; margin-bottom: 6px; font-weight: 600; }
.kpi-value { color: #f1f2f7; font-size: 1.6rem; font-weight: 700; margin: 0; }
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
    <div class="modal-backdrop" id="runModalBackdrop" onclick="if(event.target === this) closeRunModal()">
  <div class="modal-card">
    <div class="modal-header">
      <h2>Run details</h2>
      <button class="modal-close" onclick="closeRunModal()">×</button>
    </div>
    <div class="modal-body" id="runModalBody"></div>
  </div>
</div>
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

    const filterScript = `<select id="statusFilter" class="filter-select">
      <option value="all">All Statuses</option>
      <option value="passed">Passed</option>
      <option value="failed">Failed</option>
      <option value="timedOut">Timed Out</option>
    </select>
    <select id="envFilter" class="filter-select">
      <option value="all">All Environments</option>
      <option value="UAT">UAT</option>
      <option value="unknown">Unknown</option>
    </select>
    <button id="saveFiltersBtn" class="modal-download-btn">Save Filters</button>
    <table>
    <thead>
      <tr><th>Run ID</th><th>Date</th><th>Status</th><th>Passed</th><th>Failed</th><th>Flaky</th></tr>
    </thead>
    <tbody id="runsTableBody"></tbody>
  </table>
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
    const runDetails = runs.map((run) => {
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

        return {
            runId: run.runId,
            date: run.date,
            status: run.runStatus,
            duration: Math.round(run.durationMs / 1000),
            environment: run.environment.Environment ?? "N/A",
            branch: run.environment.Branch ?? "N/A",
            executorName: run.executor.name ?? "N/A",
            executorType: run.executor.type ?? "N/A",
            totals: run.totals,
            reportHtml: reportHtml
        };
    });

    const runDetailsJson = JSON.stringify(runDetails);

    return `<script>const runDetailsData = ${runDetailsJson};</script>`;
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

    const labels = tags.map((entry) => entry.tag);
    const passedCounts = tags.map((entry) => entry.passed);
    const failedCounts = tags.map((entry) => entry.failed);

    const chartData = {
      labels: labels,
      passedCounts: passedCounts,
      failedCounts: failedCounts
    };
    const chartDataJson = JSON.stringify(chartData);

    const chartScript = `<canvas id="tagBreakdownChart"></canvas>
    <script>
    const tagBreakdownData = ${chartDataJson};
    new Chart(document.getElementById("tagBreakdownChart"), {
      type: "bar",
      options: {
        indexAxis: "y",
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: "Test Count", color: "#cfd0e0" },
            ticks: { color: "#cfd0e0", stepSize: 1, precision: 0, maxRotation: 0, minRotation: 0 }
          },
          y: {
            title: { display: true, text: "Test Tag", color: "#cfd0e0" },
            ticks: { color: "#cfd0e0" }
          }
        },
        plugins: {
          legend: { labels: { color: "#cfd0e0" } }
        }
      },
      data: {
        labels: tagBreakdownData.labels,
        datasets: [
          { label: "Passed", data: tagBreakdownData.passedCounts, backgroundColor: "#639922" },
          { label: "Failed", data: tagBreakdownData.failedCounts, backgroundColor: "#E24B4A" }
        ]
      }
    });
    </script>`;

    return `<section class="panel">${heading}${chartScript}</section>`;
}

// function to render the KPI row
export function renderKPIRow(averagePassRate: number, runCount: number, avgDurations: Record<string, number>): string {
  const avgDurationValues = Object.values(avgDurations);
  const overallAvgDuration = avgDurationValues.reduce((sum, val) => sum + val, 0) / avgDurationValues.length;

    return `<div class="kpi-grid">
            <div class="kpi-card">
                <p class="kpi-label">Avg Pass Rate</p>
                <h2 class="kpi-value">${Math.round(averagePassRate)}%</h2>
            </div>
            <div class="kpi-card">
                <p class="kpi-label">Total Runs</p>
                <h2 class="kpi-value">${runCount}</h2>
            </div>
            <div class="kpi-card">
                <p class="kpi-label">Average Duration</p>
                <h2 class="kpi-value">${Math.round(overallAvgDuration / 1000)}s</h2>
            </div>
            </div>`;
}


// function to render the test failures and flaky chart
export function renderFailuresAndFlakyChart(data: { runId: string, failedCount: number, flakyCount: number}[]): string {
  const heading = `<h2>Failures and Flaky per Run</h2>`;

  const labels = data.map((entry) => entry.runId);
  const failedCounts = data.map((entry) => entry.failedCount);
  const flakyCounts = data.map((entry) => entry.failedCount);

  const chartData = {
    labels: labels,
    failedCounts: failedCounts,
    flakyCounts: flakyCounts
  };

  const chartDataJson = JSON.stringify(chartData);

  const chartScript = `<canvas id="failuresFlakyChart"></canvas>
  <script>
  const failuresFlakyData = ${chartDataJson};
  new Chart(document.getElementById("failuresFlakyChart"), {
    type: "bar",
    options: {
      scales: {
        x: { stacked: true, ticks: { color: "#cfd0e0" } },
        y: { stacked: true, beginAtZero: true, ticks: { color: "#cfd0e0", stepSize: 1, precision: 0 } }
      },
      plugins: {
        legend: { labels: { color: "#cfd0e0" } }
      }
    },
    data: {
      labels: failuresFlakyData.labels,
      datasets: [
        { label: "Failed", data: failuresFlakyData.failedCounts, backgroundColor: "#E24B4A" },
        { label: "Flaky", data: failuresFlakyData.flakyCounts, backgroundColor: "#FAC775" }
      ]
    }
  });
  </script>`;

  return `<section class="panel">${heading}${chartScript}</section>`;
}

// helper function to strip the tags from the test title for dashboard display
function stripTagsFromTitle(title: string): string {
  return title.replace(/\s*@\w+/g, "").trim();
}