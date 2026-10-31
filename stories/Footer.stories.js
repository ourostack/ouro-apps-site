// The shared footer: the same kit as ouroboros.bot and mendelow.me.
export default {
  title: 'Organisms/Footer',
  tags: ['autodocs'],
  parameters: { pad: '0' },
};

export const Footer = { render: () => `<footer class="site-footer">
      <div class="wrap footer-inner">
        <p class="footer-line"><span>You bring judgment.</span> <span>Your agents bring the rest.</span></p>
        <p class="footer-row">
          <span>© 2026 Ari Mendelow</span>
          <span class="footer-sep" aria-hidden="true">·</span><a href="https://ouroboros.bot/" data-telemetry="footer_ouroboros">ouroboros.bot</a>
          <span class="footer-sep" aria-hidden="true">·</span><a href="https://mendelow.me">mendelow.me</a>
          <span class="footer-sep" aria-hidden="true">·</span><a href="https://github.com/ourostack" data-telemetry="footer_github">ourostack on GitHub</a>
          <span class="footer-sep" aria-hidden="true">·</span><a href="https://www.linkedin.com/in/arimendelow">LinkedIn</a>
          <span class="footer-sep" aria-hidden="true">·</span><a href="https://ouroboros.bot/privacy/">Privacy</a>
          <span class="footer-sep" aria-hidden="true">·</span><a href="https://ouroboros.bot/terms/">Terms</a>
        </p>
      </div>
    </footer>` };
