import type { Browser } from "@e2e-dev/web";
import { type App, expect } from "e2e";

export interface SessionImage {
  /** Image reference without the tag, e.g. `cr.backend.ai/multiarch/python`. */
  environment: string;
  /** Full reference with architecture, e.g. `cr.backend.ai/multiarch/python:3.13-ubuntu24.04@x86_64`. */
  version: string;
}

type AgentRow = { id: string };
type ImageRow = {
  name: string;
  namespace: string | null;
  registry: string;
  tag: string;
  architecture: string;
  installed_agents: string[] | null;
  labels: Array<{ key: string; value: string }> | null;
};

/**
 * Picks an image that every alive agent in `resourceGroup` already has and
 * that is not built for an accelerator, so a session on it can reach RUNNING
 * without pulling or a GPU. The session launcher's default environment does
 * not guarantee that: it lists accelerator-dedicated images first, and those
 * are installed only on GPU agents.
 *
 * `E2E_DEFAULT_IMAGE` (the Playwright suite's override, `registry/path:tag` or
 * `...@arch`) wins when set. There is no literal fallback: if nothing fits,
 * this throws so the run fails on the environment, not on a stuck session.
 */
export async function findRunnableImage(
  app: App,
  browser: Browser,
  resourceGroup: string,
): Promise<SessionImage> {
  const override = process.env.E2E_DEFAULT_IMAGE?.trim();
  if (override) {
    const [ref, arch = "x86_64"] = override.split("@");
    return {
      environment: ref.slice(0, ref.lastIndexOf(":")),
      version: `${ref}@${arch}`,
    };
  }

  await app.open("/start");
  await expect
    .poll(
      () =>
        browser
          .evaluate(() => (globalThis as any).backendaiclient?.ready === true)
          .catch(() => false),
      { timeout: 30_000 },
    )
    .toBe(true);

  const { agents, images } = (await browser.evaluate(async (group: string) => {
    const client = (globalThis as any).backendaiclient;
    const agentData = await client.query(
      `query ($group: String) { agents(status: "ALIVE", scaling_group: $group) { id } }`,
      { group },
    );
    const imageData = await client.query(
      `query { images(is_installed: true) { name namespace registry tag architecture installed_agents labels { key value } } }`,
      {},
    );
    return { agents: agentData.agents, images: imageData.images };
  }, resourceGroup)) as { agents: AgentRow[]; images: ImageRow[] };

  const agentIds = agents.map((agent) => agent.id);
  if (agentIds.length === 0) {
    throw new Error(
      `e2e-agent: resource group "${resourceGroup}" has no alive agent`,
    );
  }
  const candidates = images
    .filter((image) =>
      agentIds.every((id) => image.installed_agents?.includes(id)),
    )
    .filter(
      (image) =>
        !image.labels?.some((label) => label.key === "ai.backend.accelerators"),
    )
    .map((image) => {
      const environment = `${image.registry}/${image.namespace ?? image.name}`;
      return {
        environment,
        version: `${environment}:${image.tag}@${image.architecture}`,
      };
    })
    .sort((a, b) => a.version.localeCompare(b.version));
  if (candidates.length === 0) {
    throw new Error(
      `e2e-agent: no installed non-accelerator image is on every alive agent of "${resourceGroup}" (${agentIds.join(", ")}); set E2E_DEFAULT_IMAGE`,
    );
  }
  return candidates[0];
}
