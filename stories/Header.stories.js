// The shared header: the same bar as ouroboros.bot's Nav.astro.
export default {
  title: 'Organisms/Header',
  tags: ['autodocs'],
  parameters: { pad: '0' },
};

export const Header = { render: () => `<header class="site-header" id="top">
      <div class="wrap">
        <a class="brand" href="https://ouroboros.bot/" aria-label="Ouro home" data-telemetry="nav_home">
          <img src="/assets/brand/ouro-render-128.webp" srcset="/assets/brand/ouro-render-128.webp 128w, /assets/brand/ouro-render-256.webp 256w" sizes="32px" width="32" height="32" alt="" class="mark-render">
          <span>ouro</span>
        </a>
        <nav class="nav" aria-label="Main">
          <a href="https://ouroboros.bot/approach/">How I work</a>
          <a href="https://ouroboros.bot/desk/">Desk</a>
          <a href="https://ouroboros.bot/ouro-md/">Ouro MD</a>
          <a href="https://ouroboros.bot/lab/">Lab</a>
          <a href="https://ouroboros.bot/blog/">Blog</a>
          <a href="https://ouro.bot/" aria-current="page" data-telemetry="nav_apps">Apps</a>
          <a href="https://ouroboros.bot/#try">Try it</a>
          <a class="gh" href="https://github.com/ourostack" aria-label="ourostack on GitHub" data-telemetry="nav_github"><svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
          <a href="https://mendelow.me">About me <span aria-hidden="true">↗</span></a>
        </nav>
        <div class="header-tools">
          <button type="button" class="icon-btn theme-toggle" aria-label="Switch theme" title="Light or dark">
            <svg class="theme-icon-sun" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            <svg class="theme-icon-moon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linejoin="round" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
          </button>
          <button type="button" class="icon-btn menu-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="menu">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      <nav class="menu" id="menu" aria-label="Menu">
        <a href="https://ouroboros.bot/approach/">How I work</a>
        <a href="https://ouroboros.bot/desk/">Desk</a>
        <a href="https://ouroboros.bot/ouro-md/">Ouro MD</a>
        <a href="https://ouroboros.bot/lab/">Lab</a>
        <a href="https://ouroboros.bot/blog/">Blog</a>
        <a href="https://ouro.bot/" aria-current="page">Apps</a>
        <a href="https://ouroboros.bot/#try">Try it</a>
        <a href="https://github.com/ourostack">GitHub ↗</a>
        <a href="https://mendelow.me">About me <span aria-hidden="true">↗</span></a>
      </nav>
    </header>` };
