export default {
  title: 'Atoms/Button',
  tags: ['autodocs'],
  render: ({ variant, label, block }) =>
    `<a class="btn${variant ? ' ' + variant : ''}${block ? ' block' : ''}" href="#">${label}</a>`,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'ghost', ''] },
    label: { control: 'text' },
    block: { control: 'boolean' },
  },
  args: { variant: 'primary', label: 'Download Ouro MD', block: false },
};

export const Primary = { args: { variant: 'primary', label: 'Download Ouro MD' } };
export const Ghost = { args: { variant: 'ghost', label: 'Learn about Ouro MD' } };
export const Dark = {
  name: 'Dark (default)',
  args: { variant: '', label: 'Download' },
};

// The contrast bug lived HERE — a .btn inside .nav, where the nav link color
// out-specifies the button's own text color. This story renders that exact
// context so the a11y check guards it.
export const InNavContext = {
  name: 'In header nav (contextual)',
  render: () =>
    `<nav class="nav">
       <a href="#">Apps</a>
       <a href="#">Ouro MD</a>
       <a href="#">GitHub</a>
       <a class="btn" href="#">Download</a>
     </nav>`,
};
