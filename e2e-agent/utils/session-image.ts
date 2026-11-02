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

/**
 * Picks an environment none of whose images is installed or private, so the
 * session launcher lists it only when `showNonInstalledImages` is on.
 * `environment` is the name the launcher shows (image metadata, else the
 * last path segment), chosen so no installed environment shares it; `image`
 * is one of its images as `registry/namespace:tag@arch`, and `imageKeyword`
 * the last path segment, which the Environments page's "Image" filter matches.
 */
export async function findNotInstalledEnvironment(browser: Browser) {
  await expect
    .poll(
      () =>
        browser
          .evaluate(() => (globalThis as any).backendaiclient?.ready === true)
          .catch(() => false),
      { timeout: 30_000 },
    )
    .toBe(true);
  const { images, imageInfo } = (await browser.evaluate(async () => {
    const client = (globalThis as any).backendaiclient;
    const data = await client.query(
      `query { images { name namespace registry tag architecture installed labels { key value } } }`,
      {},
    );
    const metadata = await fetch("/resources/image_metadata.json")
      .then((res) => res.json())
      .catch(() => ({}));
    return { images: data.images, imageInfo: metadata.imageInfo ?? {} };
  })) as {
    images: Array<ImageRow & { installed: boolean | null }>;
    imageInfo: Record<string, { name?: string }>;
  };

  const groups = new Map<string, typeof images>();
  for (const image of images) {
    const key = `${image.registry}/${image.namespace ?? image.name}`;
    groups.set(key, [...(groups.get(key) ?? []), image]);
  }
  const displayName = (environment: string) => {
    const segments = environment.split("/");
    return imageInfo[segments[2]]?.name ?? segments[segments.length - 1];
  };
  const installedLabels = [...groups]
    .filter(([, group]) => group.some((image) => image.installed))
    .map(([environment]) =>
      `${environment} ${displayName(environment)}`.toLowerCase(),
    );
  const isPrivate = (image: ImageRow) =>
    image.labels?.some(
      (label) =>
        label.key === "ai.backend.features" &&
        label.value.split(" ").includes("private"),
    );
  const candidates = [...groups]
    .filter(([, group]) =>
      group.every((image) => !image.installed && !isPrivate(image)),
    )
    .map(([environment, group]) => {
      const image = group
        .map((i) => `${environment}:${i.tag}@${i.architecture}`)
        .sort()[0];
      return {
        environment: displayName(environment),
        image,
        imageKeyword: environment.split("/").pop() ?? environment,
      };
    })
    .filter(
      ({ environment }) =>
        environment.length >= 3 &&
        !installedLabels.some((label) =>
          label.includes(environment.toLowerCase()),
        ),
    )
    .sort((a, b) => a.environment.localeCompare(b.environment));
  if (candidates.length === 0) {
    throw new Error(
      "e2e-agent: no environment has only non-installed images under a name no installed environment shares",
    );
  }
  return candidates[0];
}

/** Whether the manager reports the image (full name) as installed. */
export async function isImageInstalled(browser: Browser, fullName: string) {
  return browser.evaluate(async (target: string) => {
    const client = (globalThis as any).backendaiclient;
    const data = await client.query(
      `query { images { name namespace registry tag architecture installed } }`,
      {},
    );
    const image = data.images.find(
      (i: any) =>
        `${i.registry}/${i.namespace ?? i.name}:${i.tag}@${i.architecture}` ===
        target,
    );
    return image ? Boolean(image.installed) : "absent";
  }, fullName);
}
