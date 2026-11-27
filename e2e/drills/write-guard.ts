/**
 * Keeps a drill off the server's data: on every drill page, a write that no
 * mock answered is aborted and recorded, and the step it happened in fails.
 */
import type { BrowserContext, Page } from '@playwright/test';

const SESSION_PATH = /\/server\/(login|login-check|logout)$/;
const GRAPHQL_PATH = /\/admin\/gql$/;
// Reads the app sends as POST.
const READ_OVER_POST = [
  /\/func\/v2\/app-config\/public\/get$/,
  /\/func\/resource\/check-presets$/,
  /\/func\/config\/get$/,
];

function onlyQueries(postData: string | null): boolean {
  try {
    const body = JSON.parse(postData ?? '');
    const docs = Array.isArray(body) ? body : [body];
    return docs.every((doc) =>
      /^\s*(query\b|subscription\b|\{)/.test(
        String(doc?.query ?? '').replace(/#.*$/gm, ''),
      ),
    );
  } catch {
    return false;
  }
}

export function createWriteGuard() {
  const blocked: string[] = [];
  const guarded = new WeakSet<BrowserContext>();
  return {
    blocked,
    /**
     * Guards the page's whole context, popups included, once per context.
     * Context routes run after page routes, so page-level mocks answer first.
     */
    async install(page: Page) {
      const context = page.context();
      if (guarded.has(context)) return;
      guarded.add(context);
      await context.route('**/*', async (route) => {
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
