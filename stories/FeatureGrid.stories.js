const cells = [
  ['Tables that behave', 'Wide tables scroll inside their own block instead of dragging the page sideways.'],
  ['Code, highlighted', 'Fenced blocks with syntax highlighting and block-local scrolling.'],
  ['Math, typeset', 'Inline and display math rendered with KaTeX.'],
  ['Diagrams', 'Mermaid flowcharts, drawn live and re-themed for dark mode.'],
  ['Four themes', 'Quartz, Graphite, Manuscript, Newsprint — or your own CSS.'],
  ['Truly native', 'Transparent titlebar, standard menus, Open Recent, auto-save.'],
];

export default {
  title: 'Organisms/Feature grid',
  tags: ['autodocs'],
  parameters: { canvasBg: 'var(--surface)' },
};

export const Grid = {
  render: () =>
    `<div class="features" style="max-width:900px">${cells
      .map(([h, p]) => `<div class="feature"><h3>${h}</h3><p>${p}</p></div>`)
      .join('')}</div>`,
};
