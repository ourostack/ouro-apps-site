const header = (brandImg = false) => `
  <header class="site-header is-scrolled">
    <div class="wrap">
      <a class="brand" href="/">${brandImg ? '<img src="/assets/ouro-md-icon.png" alt=""> ' : ''}ouro</a>
      <nav class="nav" aria-label="Primary">
        <a href="#apps">Apps</a>
        <a href="/apps/ouro-md/" class="nav-hide-sm">Ouro MD</a>
        <a href="https://github.com/ourostack">GitHub</a>
        <a href="/apps/ouro-md/" class="btn">Download</a>
      </nav>
    </div>
  </header>`;

export default {
  title: 'Organisms/Header',
  tags: ['autodocs'],
  parameters: { pad: '0' },
};

export const Homepage = { render: () => header(false) };
export const AppPage = { name: 'App page (with icon)', render: () => header(true) };
