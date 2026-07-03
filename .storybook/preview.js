// The library renders against the real site stylesheet — so a component looks,
// and is contrast-checked, exactly as it ships.
import '../styles.css';

/** @type { import('@storybook/html-vite').Preview } */
export default {
  // Wrap every story in its real background so axe measures contrast against the
  // surface the component actually sits on (paper by default; pass canvasBg to
  // override for components that live on white/tinted surfaces).
  decorators: [
    (story, ctx) => {
      const inner = story();
      const wrap = document.createElement('div');
      wrap.style.background = ctx.parameters.canvasBg || 'var(--bg)';
      wrap.style.padding = ctx.parameters.pad ?? '48px';
      wrap.style.minHeight = 'auto';
      if (typeof inner === 'string') wrap.innerHTML = inner;
      else wrap.appendChild(inner);
      return wrap;
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'error' },
  },
};
