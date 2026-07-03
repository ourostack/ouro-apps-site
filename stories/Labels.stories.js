export default {
  title: 'Atoms/Labels',
  tags: ['autodocs'],
};

export const Eyebrow = { render: () => `<p class="eyebrow">Ouro · Native Mac apps</p>` };

export const Pills = {
  render: () => `
    <div style="display:flex;gap:12px;align-items:center">
      <span class="pill live">Available now</span>
      <span class="pill soon">In the workshop</span>
      <span class="pill soon">Later</span>
    </div>`,
};

export const TrustLine = {
  render: () => `
    <div class="trust">
      <span>macOS 13+</span>
      <span>Signed &amp; notarized</span>
      <span>Local files stay local</span>
    </div>`,
};

export const TextLink = { render: () => `<a class="text-link" href="#">Learn more</a>` };

export const InlineCode = {
  render: () => `<p style="font-size:17px">Type <code>curl -fsSL …</code> and it just works.</p>`,
};
