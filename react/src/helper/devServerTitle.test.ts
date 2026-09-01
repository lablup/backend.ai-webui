import { applyDevServerTitle } from './devServerTitle';

describe('applyDevServerTitle', () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
    document.title = 'Backend.AI';
  });

  afterEach(() => {
    // Vitest 4 / Node 20+ make `import.meta.env` entries non-configurable, so
    // `vi.stubEnv` is the supported way to override DEV / VITE_* values.
    vi.unstubAllEnvs();
    document.title = originalTitle;
  });

  it('prefixes the tab title with the app name in development mode', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_DEV_SERVER_NAME', 'fr-3042');

    applyDevServerTitle();

    expect(document.title).toBe('[fr-3042] Backend.AI');
  });

  it('leaves the title unchanged in production even when the name is set', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_DEV_SERVER_NAME', 'fr-3042');

    applyDevServerTitle();

    expect(document.title).toBe('Backend.AI');
  });

  it('leaves the title unchanged in development when no app name is set', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_DEV_SERVER_NAME', '');

    applyDevServerTitle();

    expect(document.title).toBe('Backend.AI');
  });

  it('prefixes the existing title rather than hard-coding the base', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_DEV_SERVER_NAME', 'fr-3042');
    document.title = 'Sessions · Backend.AI';

    applyDevServerTitle();

    expect(document.title).toBe('[fr-3042] Sessions · Backend.AI');
  });

  it('is idempotent and does not double-prefix on repeated calls', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_DEV_SERVER_NAME', 'fr-3042');

    applyDevServerTitle();
    applyDevServerTitle();

    expect(document.title).toBe('[fr-3042] Backend.AI');
  });
});
