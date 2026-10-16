export default {
  title: 'Molecules/App card',
  tags: ['autodocs'],
  parameters: { canvasBg: 'var(--bg)' },
};

export const Featured = {
  render: () => `
    <div style="max-width:360px">
      <article class="app-card featured">
        <div class="app-card-top">
          <img class="app-icon" src="/assets/ouro-md-icon.png" alt="">
          <span class="pill live">Available now</span>
        </div>
        <h3>Ouro MD</h3>
        <p>Write in Markdown and read it at the same time. A native editor that stays calm with long documents, wide tables, code, math, and diagrams.</p>
        <div class="spacer"></div>
        <div class="card-foot">
          <a class="btn primary" href="#">Download</a>
          <a class="text-link" href="#">Details</a>
        </div>
      </article>
    </div>`,
};

export const InProgress = {
  render: () => `
    <div style="max-width:360px">
      <article class="app-card">
        <div class="app-card-top">
          <img class="app-icon app-render" src="/assets/brand/shepherd-render-256.webp" width="44" height="44" alt="">
          <span class="pill soon">Coming soon</span>
        </div>
        <h3>Ouro Shepherd</h3>
        <p>Watches the coding agents in your terminals. When one stops too early, it answers in plain view. When one needs you, it tells you.</p>
        <div class="spacer"></div>
        <div class="card-foot"><a class="text-link" href="#">Follow along</a></div>
      </article>
    </div>`,
};

export const Quiet = {
  render: () => `
    <div style="max-width:360px">
      <article class="app-card quiet">
        <div class="app-card-top"><span class="app-glyph">＋</span><span class="pill soon">Later</span></div>
        <h3>More small tools</h3>
        <p>The shelf grows as the tools do: one clear card, one honest status, one obvious next step.</p>
      </article>
    </div>`,
};
