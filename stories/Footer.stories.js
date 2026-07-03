export default {
  title: 'Organisms/Footer',
  tags: ['autodocs'],
  parameters: { pad: '0' },
};

export const Footer = {
  render: () => `
    <footer class="site-footer">
      <div class="wrap">
        <div>
          <a class="brand" href="/">ouro</a>
          <p class="foot-meta">© 2026 Ari Mendelow · Native Mac apps.</p>
        </div>
        <nav class="foot-nav" aria-label="Footer">
          <a href="/apps/ouro-md/">Ouro MD</a>
          <a href="https://github.com/ourostack">GitHub</a>
        </nav>
      </div>
    </footer>`,
};
