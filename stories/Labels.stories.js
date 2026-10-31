export default {
  title: 'Atoms/Labels',
  tags: ['autodocs'],
};

export const Eyebrow = { render: () => `<p class="eyebrow">Ouro MD · The Markdown app</p>` };

export const Tags = {
  render: () => `
    <div style="display:flex;gap:12px;align-items:center">
      <span class="tag tag-today">Use today</span>
      <span class="tag tag-exp">Experimental</span>
      <span class="tag tag-alpha">Alpha</span>
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
