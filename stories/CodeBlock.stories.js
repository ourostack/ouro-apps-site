export default {
  title: 'Atoms/Code block',
  tags: ['autodocs'],
};

export const Terminal = {
  render: () => `
    <div class="install-block" style="max-width:620px">
      <pre id="ouro-md-install" class="agent-text">curl -fsSL https://ouro.bot/ouro-md-install.sh | bash</pre>
      <div class="install-copy">
        <button type="button" data-copy-target="ouro-md-install" class="btn copy-btn"><span data-copy-label>Copy</span></button>
        <span class="install-note">Also adds an <code class="font-mono">md</code> shell alias.</span>
      </div>
    </div>`,
};
