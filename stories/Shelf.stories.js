// The homepage shelf: each tool laid out openly with its mark, readiness tag,
// one line and its links. The same pattern as ouroboros.bot's "Grown inside it".
export default {
  title: 'Molecules/Shelf',
  tags: ['autodocs'],
};

export const Shelf = {
  render: () => `<div class="wrap"><ul class="shelf">
            <li id="ouroboros">
              <img src="/assets/brand/ouro-render-128.webp" srcset="/assets/brand/ouro-render-128.webp 128w, /assets/brand/ouro-render-256.webp 256w" sizes="64px" width="64" height="64" alt="" loading="lazy" class="mark-render shelf-mark">
              <div class="shelf-body">
                <h3 class="shelf-name">Ouroboros</h3>
                <p class="status"><span class="tag tag-exp">Experimental</span> Our Agent Experience lab</p>
                <p>Ouroboros is the agent harness I built from scratch, and it's where I test what agents need. <code>npx ouro.bot</code> starts a guided setup: a conversation that hatches your agent and shapes its personality, name, and purpose.</p>
                <p class="shelf-links"><a class="link" href="https://ouroboros.bot/lab/" data-telemetry="card_ouroboros">The harness →</a></p>
              </div>
            </li>
            <li id="shepherd">
              <img src="/assets/brand/shepherd-render-128.webp" srcset="/assets/brand/shepherd-render-128.webp 128w, /assets/brand/shepherd-render-256.webp 256w" sizes="64px" width="64" height="64" alt="" loading="lazy" class="mark-render shelf-mark">
              <div class="shelf-body">
                <h3 class="shelf-name">Ouro Shepherd</h3>
                <p class="status"><span class="tag tag-today">Use today</span> Ships in Ouroboros, for cmux and Herdr; reply from any chat</p>
                <p>Keeps the agents in my terminals on task. When one stops before it needs to, Shepherd answers it where I can see it.</p>
                <p class="shelf-links"><a class="link" href="https://github.com/ourostack/ouroboros/blob/main/docs/shepherd-sense.md" data-telemetry="card_shepherd_docs">How Shepherd decides ↗</a><a class="link" href="https://ouroboros.bot/#shepherd" data-telemetry="card_shepherd">Shepherd on ouroboros.bot →</a></p>
              </div>
            </li>
            <li id="ouro-hx">
              <img src="/assets/brand/ouro-hx-render-128.webp" srcset="/assets/brand/ouro-hx-render-128.webp 128w, /assets/brand/ouro-hx-render-256.webp 256w" sizes="64px" width="64" height="64" alt="" loading="lazy" class="mark-render shelf-mark">
              <div class="shelf-body">
                <h3 class="shelf-name">Ouro HX</h3>
                <p class="status"><span class="tag tag-today">Use today</span> React component library</p>
                <p>Ouro HX is a React component library that feels right to the people using it and is obvious to the agents building with it.</p>
                <p class="shelf-links"><a class="link" href="https://ui.ouro.bot/voyage/" data-telemetry="card_ouro_hx">Try the showcase ↗</a></p>
              </div>
            </li>
          </ul></div>`,
};
