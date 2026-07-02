import { chromium } from "@playwright/test";

const outputPath = new URL("../assets/ouro-md-preview.png", import.meta.url).pathname;
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const html = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <style>
      :root {
        --ink: #191410;
        --muted: #6f6257;
        --paper: #fffaf0;
        --line: #31261d;
        --red: #d84a30;
        --blue: #2f63b8;
        --green: #127362;
        --gold: #edb642;
        --soft: #f4ead8;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        width: 1400px;
        height: 960px;
        overflow: hidden;
        color: var(--ink);
        background:
          linear-gradient(90deg, rgba(49, 38, 29, 0.05) 1px, transparent 1px) 0 0 / 30px 30px,
          linear-gradient(rgba(49, 38, 29, 0.045) 1px, transparent 1px) 0 0 / 30px 30px,
          var(--paper);
        font-family: Charter, "Iowan Old Style", Georgia, serif;
      }

      main {
        padding: 42px 56px;
      }

      .doc-header {
        display: grid;
        grid-template-columns: 1fr 205px;
        gap: 26px;
        align-items: start;
        padding-bottom: 22px;
        border-bottom: 4px solid var(--line);
      }

      .eyebrow,
      th,
      .card b,
      .badge {
        font-family: Avenir Next, Trebuchet MS, sans-serif;
        font-weight: 900;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .eyebrow {
        display: inline-block;
        margin: 0 0 14px;
        padding: 6px 10px 5px;
        border: 3px solid var(--line);
        background: var(--gold);
        box-shadow: 4px 4px 0 var(--line);
        font-size: 15px;
      }

      h1 {
        max-width: 820px;
        margin: 0;
        font-size: 66px;
        line-height: 0.9;
      }

      p {
        margin: 11px 0 0;
        color: var(--muted);
        font-size: 22px;
        line-height: 1.32;
      }

      code {
        padding: 2px 7px;
        border-radius: 7px;
        background: #e9eef8;
        color: #263c74;
        font-family: "SF Mono", Menlo, monospace;
        font-size: 0.85em;
      }

      .stamp {
        display: grid;
        gap: 6px;
        padding: 16px;
        border: 3px solid var(--line);
        border-radius: 16px;
        background: #e9f3ef;
        box-shadow: 7px 7px 0 var(--line);
        transform: rotate(2deg);
      }

      .stamp strong {
        font-size: 44px;
        line-height: 0.9;
      }

      .stamp span {
        color: var(--muted);
        font-family: Avenir Next, Trebuchet MS, sans-serif;
        font-size: 16px;
        font-weight: 800;
      }

      .grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 24px;
        margin-top: 24px;
      }

      .panel,
      .callout {
        border: 3px solid var(--line);
        border-radius: 18px;
        background: rgba(255, 250, 240, 0.92);
        box-shadow: 7px 7px 0 var(--line);
      }

      .panel {
        padding: 20px;
      }

      .panel h2 {
        margin: 0 0 14px;
        font-size: 30px;
        line-height: 1;
      }

      .chart-wrap {
        display: grid;
        grid-template-columns: 1fr 205px;
        gap: 20px;
        align-items: center;
      }

      svg {
        display: block;
        width: 100%;
        height: auto;
      }

      .donut {
        display: grid;
        place-items: center;
        width: 196px;
        height: 196px;
        border: 3px solid var(--line);
        border-radius: 50%;
        background:
          radial-gradient(circle at center, var(--paper) 0 42%, transparent 43%),
          conic-gradient(var(--green) 0 42%, var(--gold) 42% 65%, var(--blue) 65% 84%, var(--red) 84% 100%);
        box-shadow: 6px 6px 0 var(--line);
      }

      .donut strong {
        font-size: 40px;
      }

      .legend {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 9px;
        margin-top: 14px;
        font-family: Avenir Next, Trebuchet MS, sans-serif;
        font-size: 14px;
        font-weight: 800;
      }

      .legend span {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .dot {
        width: 14px;
        height: 14px;
        border: 2px solid var(--line);
        border-radius: 50%;
      }

      .green { background: var(--green); }
      .gold { background: var(--gold); }
      .blue { background: var(--blue); }
      .red { background: var(--red); }

      table {
        width: 100%;
        border-collapse: collapse;
        overflow: hidden;
        border: 3px solid var(--line);
        border-radius: 14px;
        background: #fffdf8;
        font-size: 19px;
      }

      th,
      td {
        padding: 10px 12px;
        border-bottom: 2px solid rgba(49, 38, 29, 0.16);
        border-right: 2px solid rgba(49, 38, 29, 0.16);
        vertical-align: top;
      }

      th {
        background: var(--soft);
        font-size: 15px;
        text-align: left;
      }

      tr:last-child td {
        border-bottom: 0;
      }

      td:last-child,
      th:last-child {
        border-right: 0;
      }

      .badge {
        display: inline-block;
        padding: 4px 8px;
        border: 2px solid var(--line);
        border-radius: 999px;
        background: #e9f3ef;
        font-size: 12px;
        white-space: nowrap;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        margin-top: 18px;
      }

      .card {
        min-height: 94px;
        padding: 14px;
        border: 3px solid var(--line);
        border-radius: 16px;
        background: #fffdf8;
      }

      .card b {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
      }

      .card span {
        color: var(--muted);
        font-size: 17px;
        line-height: 1.22;
      }

      .callout {
        margin-top: 12px;
        padding: 10px 18px;
        background: #ffe8de;
        font-size: 22px;
        line-height: 1.18;
      }

      .callout strong {
        color: var(--red);
      }
    </style>
  </head>
  <body>
    <main>
      <section class="doc-header">
        <div>
          <p class="eyebrow">Quarterly field notes</p>
          <h1>The Household Snack & Focus Index</h1>
          <p>A rigorous Markdown investigation into when humans do their best thinking, why the 3:00pm pretzel matters, and how many tabs can be open before morale files a bug.</p>
        </div>
        <aside class="stamp">
          <strong>87%</strong>
          <span>of meetings improved by “having a little something.”</span>
        </aside>
      </section>

      <section class="grid">
        <article class="panel">
          <h2>Focus rises when snacks arrive before the meeting gets theatrical.</h2>
          <div class="chart-wrap">
            <svg viewBox="0 0 650 320" role="img" aria-label="Line chart of focus and snack supply by hour">
              <rect x="0" y="0" width="650" height="292" rx="18" fill="#fffdf8" stroke="#31261d" stroke-width="3"/>
              <g stroke="#dccfba" stroke-width="2">
                <path d="M70 70H604M70 130H604M70 190H604M70 250H604"/>
                <path d="M130 44V268M235 44V268M340 44V268M445 44V268M550 44V268"/>
              </g>
              <g fill="#6f6257" font-family="Avenir Next, Trebuchet MS, sans-serif" font-weight="800" font-size="18">
                <text x="54" y="76">high</text>
                <text x="44" y="256">low</text>
                <text x="104" y="300">9a</text><text x="210" y="300">11a</text><text x="315" y="300">1p</text><text x="420" y="300">3p</text><text x="525" y="300">5p</text>
              </g>
              <path d="M82 224 C150 190, 194 92, 256 110 S380 246, 438 136 S540 96, 596 72" fill="none" stroke="#127362" stroke-width="11" stroke-linecap="round"/>
              <path d="M82 184 C156 180, 196 170, 258 208 S376 242, 438 178 S542 106, 596 116" fill="none" stroke="#d84a30" stroke-width="7" stroke-linecap="round" stroke-dasharray="16 15"/>
              <g fill="#fffaf0" stroke="#31261d" stroke-width="4">
                <circle cx="256" cy="110" r="13"/><circle cx="438" cy="136" r="13"/><circle cx="596" cy="72" r="13"/>
              </g>
              <g font-family="Avenir Next, Trebuchet MS, sans-serif" font-size="17" font-weight="900">
                <text x="92" y="39" fill="#127362">focus</text>
                <text x="170" y="39" fill="#d84a30">snack supply</text>
              </g>
            </svg>
            <div class="donut"><strong>42%</strong></div>
          </div>
          <div class="legend">
            <span><i class="dot green"></i>crispy</span>
            <span><i class="dot gold"></i>sweet</span>
            <span><i class="dot blue"></i>hydration</span>
            <span><i class="dot red"></i>mystery</span>
          </div>
        </article>

        <article class="panel">
          <h2>Emergency protocol</h2>
          <table>
            <thead>
              <tr>
                <th>Signal</th>
                <th>Diagnosis</th>
                <th>Move</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>tabs &gt; 17</code></td>
                <td>Cognitive confetti</td>
                <td><span class="badge">tea + close 4 tabs</span></td>
              </tr>
              <tr>
                <td>“Quick sync?”</td>
                <td>Calendar weather event</td>
                <td><span class="badge">nuts before notes</span></td>
              </tr>
              <tr>
                <td>Inbox 999+</td>
                <td>Archaeology, not email</td>
                <td><span class="badge">sort by vibes</span></td>
              </tr>
              <tr>
                <td>Blank doc stare</td>
                <td>Opening paragraph rebellion</td>
                <td><span class="badge">write the bad one</span></td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>

      <section class="cards">
        <div class="card"><b>Best time to write</b><span>10:12am, after coffee, before calendar gravity gets ambitious.</span></div>
        <div class="card"><b>Most valuable metric</b><span>Minutes between “I’ll just check one thing” and snack acquisition.</span></div>
        <div class="card"><b>Markdown finding</b><span>Charts, tables, callouts, and code can share a page without starting a layout incident.</span></div>
      </section>

      <blockquote class="callout">
        <strong>Conclusion:</strong> keep snacks visible, tables scrollable, and important thoughts somewhere nicer than a seven-tab browser seance.
      </blockquote>
    </main>
  </body>
</html>`;

const browser = await chromium.launch({ executablePath: chromePath });
const page = await browser.newPage({ viewport: { width: 1400, height: 960 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.screenshot({ path: outputPath, clip: { x: 0, y: 0, width: 1400, height: 960 } });
await browser.close();

console.log(`Rendered ${outputPath}`);
