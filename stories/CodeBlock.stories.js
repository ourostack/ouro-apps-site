export default {
  title: 'Atoms/Code block',
  tags: ['autodocs'],
};

export const Terminal = {
  render: () => `
    <pre class="codeblock" style="max-width:620px"><code><span class="c-com"># installs Ouro MD.app to /Applications, verified</span>
<span class="c-cmd">curl</span> -fsSL https://ouro.bot/ouro-md-install.sh | bash</code></pre>`,
};
