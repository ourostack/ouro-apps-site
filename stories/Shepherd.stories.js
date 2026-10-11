// Shepherd page pieces. Shepherd isn't shipped, so its page uses typographic
// diagrams instead of product shots; these stories keep them contrast-checked.
export default {
  title: 'Molecules/Shepherd diagrams',
  parameters: { canvasBg: 'var(--bg)' },
};

export const Flow = {
  render: () => `<div style="max-width:620px">
<figure class="flow" aria-labelledby="flow-caption">
            <figcaption id="flow-caption">Illustration of how Shepherd fits in. Not a screenshot.</figcaption>
            <div class="flow-row">
              <p class="flow-label">Your terminals</p>
              <div class="flow-nodes">
                <div class="flow-node"><span class="dot ask" aria-hidden="true"></span><b>Codex</b><span>"Want me to go ahead?"</span></div>
                <div class="flow-node"><span class="dot work" aria-hidden="true"></span><b>Claude Code</b><span>waiting on its subagents</span></div>
                <div class="flow-node"><span class="dot wait" aria-hidden="true"></span><b>Copilot CLI</b><span>needs your sign-in</span></div>
              </div>
            </div>
            <div class="flow-down" aria-hidden="true">↓</div>
            <div class="flow-hub">
              <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" focusable="false">
                <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="86 21" stroke-linecap="round" transform="rotate(-60 24 24)"/>
                <path d="M33.5 7.5 L40 10.5 L35 15.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div>
                <b>Shepherd</b>
                <span>asks, each time an agent stops: should it have?</span>
              </div>
            </div>
            <div class="flow-down flow-you" aria-hidden="true">↓</div>
            <div class="flow-row flow-you">
              <p class="flow-label">What happens</p>
              <div class="flow-nodes">
                <div class="flow-node"><b>Answered</b><span>"[Ouro for Ari] Go ahead…" typed in the terminal</span></div>
                <div class="flow-node"><b>Left alone</b><span>counted as progress</span></div>
                <div class="flow-node"><b>Sent to you</b><span>on Telegram, for now</span></div>
              </div>
            </div>
          </figure>
</div>`,
};

export const Digest = {
  parameters: { canvasBg: 'var(--bg-tint)' },
  render: () => `<div style="max-width:560px">
<figure class="digest" aria-labelledby="digest-caption">
            <pre class="codeblock"><code><span class="c-com">api-refactor · Codex</span>

  I've drafted the migration plan.
  Want me to go ahead and apply it?

<span class="c-cmd">› [Ouro for Ari]</span> Go ahead and apply it. It's in your task.

<span class="c-com">status: answered for Ari: plan is inside the task</span></code></pre>
            <figcaption id="digest-caption">What an answer could look like in the terminal. Illustration, not real output.</figcaption>
          </figure>
</div>`,
};

export const DecisionLadder = {
  parameters: { canvasBg: 'var(--bg-tint)' },
  render: () => `<div style="max-width:480px">
<ol class="ladder" aria-label="What Shepherd does when an agent stops, in order">
            <li><b>The agent stops</b><span>cmux or Herdr reports that the agent has finished its turn. If it starts again within a few seconds, Shepherd lets it be.</span></li>
            <li><b>Shepherd reads the screen</b><span>A judge reads the last lines of the terminal and decides: stopped too early, needs you, finished, or still waiting on its own work.</span></li>
            <li><b>It acts on that</b><span>Too early: it answers. Needs you or finished: it tells you. Still working: it leaves the agent alone.</span></li>
            <li><b>It writes it down</b><span>Every decision goes into the log, with the reason.</span></li>
          </ol>
          <p class="ladder-note">If the judge can't tell, or fails, Shepherd does nothing. The agent's question stays in the terminal for you.</p>
</div>`,
};

export const CmuxNote = {
  parameters: { canvasBg: 'var(--bg-tint)' },
  render: () => `<div style="max-width:520px">
<div class="prose cmux-note">
            <h3>Your terminal, your agents</h3>
            <p>Shepherd isn't a terminal and isn't a fork you have to install. It connects to stock <a href="https://cmux.com" data-telemetry="shepherd_cmux_link">cmux</a> through its socket (you store a token once, from a cmux terminal) and to <a href="https://herdr.dev" data-telemetry="shepherd_herdr_link">Herdr</a> through its local socket. No cmux account needed.</p>
            <p>It is built to be agent-agnostic. It uses the terminal's own stop signal and reads the screen, so no part of it depends on one particular coding agent. We're testing it with Claude Code, Codex, GitHub Copilot CLI and Agency.</p>
            <p class="fine">cmux is made by Manaflow, and Herdr by Herdr, Inc. Ouro Shepherd is an independent project and is not affiliated with or endorsed by Manaflow or Herdr, Inc. Claude Code, Codex, GitHub Copilot, Agency, Telegram and Tailscale are names or trademarks of their owners; no affiliation is implied.</p>
          </div>
</div>`,
};
