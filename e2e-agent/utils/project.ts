import type { Browser } from "@e2e-dev/web";

// The project the app is currently scoped to, or null before the client is ready.
export function currentProjectName(browser: Browser) {
  return browser
    .evaluate(() => {
      const client = (globalThis as any).backendaiclient;
      return client?.ready === true ? (client.current_group ?? null) : null;
    })
    .catch(() => null);
}

// The signed-in user's PERSONAL project, or null when the client is not ready
// or the user has none.
export function personalProjectName(browser: Browser) {
  return browser
    .evaluate(async () => {
      const client = (globalThis as any).backendaiclient;
      if (client?.ready !== true) return null;
      const result = await client.query(
        `query {
          myUserV2 {
            projects(filter: { isActive: true }, limit: 1000) {
              edges { node { basicInfo { name type } } }
            }
          }
        }`,
        {},
      );
      const personal = result?.myUserV2?.projects?.edges
        ?.map((edge: any) => edge?.node?.basicInfo)
        .find((info: any) => info?.type === "PERSONAL");
      return personal?.name ?? null;
    })
    .catch(() => null);
}

// The UUID of one of the signed-in user's projects, or null.
export function projectId(browser: Browser, name: string) {
  return browser
    .evaluate(async (projectName: string) => {
      const client = (globalThis as any).backendaiclient;
      if (client?.ready !== true) return null;
      const result = await client.query(
        `query {
          myUserV2 {
            projects(filter: { isActive: true }, limit: 1000) {
              edges { node { entityId basicInfo { name } } }
            }
          }
        }`,
        {},
      );
      const project = result?.myUserV2?.projects?.edges
        ?.map((edge: any) => edge?.node)
        .find((node: any) => node?.basicInfo?.name === projectName);
      return (project?.entityId as string | undefined) ?? null;
    }, name)
    .catch(() => null);
}
