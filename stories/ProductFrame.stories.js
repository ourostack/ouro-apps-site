export default {
  title: 'Molecules/Product frame',
  tags: ['autodocs'],
};

export const Video = {
  name: 'Hero clip',
  render: () => `
    <div style="max-width:640px">
      <figure class="window" style="margin:0">
        <div class="window-media">
          <video autoplay muted loop playsinline poster="/assets/ouro-md-hero.png" width="1280" height="720"
                 aria-label="Ouro MD typing Markdown and rendering it live.">
            <source src="/assets/ouro-md-hero.mp4" type="video/mp4">
          </video>
        </div>
      </figure>
    </div>`,
};

export const StillRender = {
  name: 'Static render',
  render: () => `
    <div style="max-width:640px">
      <figure class="window" style="margin:0">
        <div class="window-media">
          <img src="/assets/ouro-md-editing.png" width="1720" height="1480"
               alt="Ouro MD rendering a table, an equation, and a task list.">
        </div>
      </figure>
    </div>`,
};
