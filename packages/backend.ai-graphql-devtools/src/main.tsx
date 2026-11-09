const isMac = /mac/i.test(navigator.platform);

window.addEventListener(
  'keydown',
  (event) => {
    const isHotkey =
      event.code === 'KeyG' &&
      event.shiftKey &&
      !event.altKey &&
      (isMac
        ? event.metaKey && !event.ctrlKey
        : event.ctrlKey && !event.metaKey);
    if (!isHotkey) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.repeat) return;
    void import('./Panel').then((panel) => panel.togglePanel());
  },
  { capture: true },
);
