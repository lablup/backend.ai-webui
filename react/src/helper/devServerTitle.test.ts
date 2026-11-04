import { devServerTitlePrefix } from './devServerTitle';

describe('devServerTitlePrefix', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('names the dev server in dev mode', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_DEV_SERVER_NAME', 'fr-3042');

    expect(devServerTitlePrefix()).toBe('[fr-3042] ');
  });

  it('is empty in production even with a name', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_DEV_SERVER_NAME', 'fr-3042');

    expect(devServerTitlePrefix()).toBe('');
  });

  it('is empty in dev mode without a name', () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_DEV_SERVER_NAME', '');

    expect(devServerTitlePrefix()).toBe('');
  });
});
