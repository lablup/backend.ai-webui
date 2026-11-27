import { installCapture } from './traffic';

installCapture();

const isMac = /mac/i.test(navigator.platform);
let isImporting = false;

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
    if (event.repeat || isImporting) return;
    isImporting = true;
    import('./Panel').then(
      (panel) => {
        isImporting = false;
        panel.togglePanel();
      },
      (error: unknown) => {
        isImporting = false;
        console.warn(
          'GraphQL devtools failed to load. Reload the page to try again.',
          error,
        );
      },
    );
  },
  { capture: true },
);
