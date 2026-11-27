/**
 * Keeps a drill off the server's data: on every drill page, a write that no
 * mock answered is aborted and recorded, and the step it happened in fails.
 */
import type { Page } from '@playwright/test';

const SESSION_PATH = /\/server\/(login|login-check|logout)$/;
const GRAPHQL_PATH = /\/admin\/gql$/;
// Reads the app sends as POST.
const READ_OVER_POST = [/\/func\/v2\/app-config\/public\/get$/];

function onlyQueries(postData: string | null): boolean {
  try {
    const body = JSON.parse(postData ?? '');
    const docs = Array.isArray(body) ? body : [body];
    return docs.every((doc) =>
      /^\s*(query\b|\{)/.test(String(doc?.query ?? '').replace(/#.*$/gm, '')),
    );
  } catch {
    return false;
  }
}

export function createWriteGuard() {
  const blocked: string[] = [];
  return {
    blocked,
    /** Install before any mock: Playwright runs the last route first. */
    async install(page: Page) {
      await page.route('**/*', async (route) => {
        const request = route.request();
        const method = request.method();
        const { pathname } = new URL(request.url());
        const allowed =
          ['GET', 'HEAD', 'OPTIONS'].includes(method) ||
          SESSION_PATH.test(pathname) ||
          READ_OVER_POST.some((pattern) => pattern.test(pathname)) ||
          (GRAPHQL_PATH.test(pathname) && onlyQueries(request.postData()));
        if (allowed) return route.fallback();
        blocked.push(`${method} ${pathname}`);
        return route.abort('blockedbyclient');
      });
    },
  };
}
