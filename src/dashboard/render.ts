

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

export function renderPage(content: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8" />
    <title>Auspex Dashboard</title>
    <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Segoe UI", system-ui, sans-serif; background: #f5f5f5; color: #1a1a1a; }
.app-header { background: #CC0000; color: #fff; padding: 20px 32px; }
.app-header h1 { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; }
.page { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
p { font-size: 1.1rem; margin-bottom: 16px; font-weight: 600; color: #333; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
th, td { padding: 10px 16px; text-align: left; border-bottom: 1px solid #e0e0e0; }
tr:last-child td { border-bottom: none; }
tr:hover { background: #fafafa; }
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