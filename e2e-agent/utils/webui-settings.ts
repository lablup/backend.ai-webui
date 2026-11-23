import type { Browser } from "@e2e-dev/web";
import type { JsonValue } from "e2e";
import { resolveE2EParts } from "../../e2e/e2e-parts";

/**
 * The `skip` of a group whose tests write the cluster-wide `settings`
 * documents: they run only when E2E_PART selects the admin part
 * (.claude/rules/e2e-admin-prep-via-api.md rule 5).
 */
export const skipUnlessAdminPart: false | string = !resolveE2EParts(
  process.env.E2E_PART,
).includes("admin")
  ? "changes server-global settings; runs only with E2E_PART=admin"
  : false;

/** Domain-scope System Settings keys, as `react/src/helper/webuiSettings.ts` names them. */
export type WebUISettingsOverride = Record<string, JsonValue>;

/**
 * Serves `settings` over the domain's System Settings in every
 * `myAppConfigs` response this page reads, from the next navigation on, so
 * no cluster-wide document is written. A later call wins after a reload.
 */
export async function overrideWebUISettings(
  browser: Browser,
  settings: WebUISettingsOverride,
) {
  await browser.addInitScript((override: WebUISettingsOverride) => {
    const w = window as any;
    w.__e2eAgentWebUISettings = override;
    if (w.__e2eAgentWebUISettingsInstalled) return;
    w.__e2eAgentWebUISettingsInstalled = true;
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init);
      const body = init?.body;
      if (typeof body !== "string" || !body.includes("myAppConfigs")) {
        return response;
      }
      let json: any;
      try {
        json = await response.clone().json();
      } catch {
        return response;
      }
      const rows = json?.data?.myAppConfigs;
      if (!Array.isArray(rows)) return response;
      let row = rows.find((r: any) => r?.configName === "domainConfig");
      if (!row) {
        row = { configName: "domainConfig", config: {} };
        rows.push(row);
      }
      row.config = {
        ...row.config,
        settings: {
          ...row.config?.settings,
          ...w.__e2eAgentWebUISettings,
        },
      };
      return new Response(JSON.stringify(json), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    };
  }, settings);
}
