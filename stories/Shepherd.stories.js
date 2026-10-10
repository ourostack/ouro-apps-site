// Shepherd page pieces. Shepherd isn't shipped, so its page uses typographic
// diagrams instead of product shots; these stories keep them contrast-checked.
export default {
  title: 'Molecules/Shepherd diagrams',
  parameters: { canvasBg: 'var(--bg)' },
};

export const Flow = {
  render: () => `<div style="max-width:620px">
<figure class="flow" aria-labelledby="flow-caption">
            <div class="flow-row">
              <p class="flow-label">Your sessions in cmux</p>
              <div class="flow-nodes">
                <div class="flow-node"><span class="dot wait" aria-hidden="true"></span><b>Claude Code</b><span>waiting on you</span></div>
                <div class="flow-node"><span class="dot ask" aria-hidden="true"></span><b>Codex</b><span>asks to run tests</span></div>
                <div class="flow-node"><span class="dot work" aria-hidden="true"></span><b>Copilot CLI</b><span>working</span></div>
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
                <span>reads each session, answers what's routine, keeps the rest for you</span>
              </div>
            </div>
            <div class="flow-down" aria-hidden="true">↓</div>
            <div class="flow-row">
              <p class="flow-label">You</p>
              <div class="flow-nodes">
                <div class="flow-node"><b>One digest</b><span>what was answered, what needs you</span></div>
                <div class="flow-node"><b>A status line</b><span>on each cmux workspace</span></div>
                <div class="flow-node"><b>A text</b><span>when you've stepped away</span></div>
              </div>
            </div>
            <figcaption id="flow-caption">Illustration of how Shepherd fits in. Not a screenshot.</figcaption>
          </figure>
</div>`,
};

export const Digest = {
  parameters: { canvasBg: 'var(--bg-tint)' },
  render: () => `<div style="max-width:560px">
<figure class="digest" aria-labelledby="digest-caption">
            <pre class="codeblock"><code><span class="c-cmd">Shepherd</span> · 3 sessions, last 10 minutes

<span class="c-com">Answered for you</span>
  ✓ api-refactor (Claude Code): ran the test suite
    routine, in the repo, easy to undo
  ✓ docs (Copilot CLI): read files under ./docs
    read-only

<span class="c-com">Needs you</span>
  • deploy-fix (Codex): wants to force-push main
    force pushes always come to you</code></pre>
            <figcaption id="digest-caption">What a digest could look like. Illustration, not real output.</figcaption>
          </figure>
</div>`,
};

export const DecisionLadder = {
  parameters: { canvasBg: 'var(--bg-tint)' },
  render: () => `<div style="max-width:480px">
<ol class="ladder" aria-label="How Shepherd handles a prompt, in order">
            <li><b>Safety floor</b><span>Plain code, no model. Anything on the floor goes straight to you.</span></li>
            <li><b>Your precedent</b><span>If you've decided this exact kind of prompt before, it follows your decision.</span></li>
            <li><b>Your principles</b><span>For something new, it reasons from your principles and closest cases, and answers only when confident.</span></li>
            <li><b>Ask you</b><span>Otherwise it hands the prompt to you, with its best guess attached.</span></li>
          </ol>
</div>`,
};

export const CmuxNote = {
  parameters: { canvasBg: 'var(--bg-tint)' },
  render: () => `<div style="max-width:520px">
<div class="prose cmux-note">
            <h3>Works with cmux</h3>
            <p>Shepherd isn't a new terminal and isn't a fork you have to install. It works with stock <a href="https://cmux.com" data-telemetry="shepherd_cmux_link">cmux</a>, the open-source macOS terminal, through its documented command-line and socket interface. No cmux account needed.</p>
            <p class="fine">cmux is made by Manaflow. Ouro Shepherd is an independent project and is not affiliated with or endorsed by Manaflow.</p>
          </div>
</div>`,
};
