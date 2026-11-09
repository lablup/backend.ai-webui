const isMac = /mac/i.test(navigator.platform);
let isImporting = false;
let failedImports = 0;

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
    const panelModule: Promise<typeof import('./Panel')> =
      failedImports === 0
        ? import('./Panel')
        : import(
            /* @vite-ignore */
            `${import.meta.url.replace(/main\.tsx.*$/, 'Panel.tsx')}?retry=${failedImports}`
          );
    panelModule
      .then((panel) => panel.togglePanel())
      .catch((error: unknown) => {
        failedImports += 1;
        console.warn('GraphQL devtools failed to load', error);
      })
      .finally(() => {
        isImporting = false;
      });
  },
  { capture: true },
);
