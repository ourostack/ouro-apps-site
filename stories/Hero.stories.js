export default {
  title: 'Organisms/Hero',
  tags: ['autodocs'],
  parameters: { pad: '0' },
};

export const Hero = {
  render: () => `
    <section class="hero app-page">
      <div class="wrap">
        <div class="hero-copy">
          <p class="eyebrow">Ouro MD · The Markdown app</p>
          <h1 class="heading-lead">Write in the rendered document.</h1>
          <p class="lead">Ouro MD renders Markdown in place as you type.</p>
          <div class="actions">
            <a class="btn primary" href="#">Download Ouro MD</a>
            <a class="btn" href="#">Learn about Ouro MD</a>
          </div>
          <div class="trust">
            <span>macOS 13+</span><span>Signed &amp; notarized</span><span>Local files stay local</span>
          </div>
        </div>
        <div class="hero-media">
          <figure class="window" style="margin:0">
            <div class="window-media">
              <img src="/assets/ouro-md-hero.png" width="1280" height="720" alt="Ouro MD typing Markdown and rendering it live in place.">
            </div>
          </figure>
        </div>
      </div>
    </section>`,
};
