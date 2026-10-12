import { gqlAdmin } from './admin-api';
import type { APIRequestContext } from '@playwright/test';

/**
 * Admin-API fixtures for resource-group-scoped resource presets (FR-4067).
 *
 * A preset name is unique only within a resource group, so the fixture builds
 * one name three times — global, scoped to `default`, and scoped to a
 * throwaway resource group associated with the `default` domain so the
 * session launcher offers it.
 */
export interface ScopedPresetFixture {
  presetName: string;
  /** The throwaway resource group created for this fixture. */
  resourceGroup: string;
  /** The existing resource group the second preset is scoped to. */
  baseResourceGroup: string;
  domain: string;
  presetIds: string[];
}

interface MutationResult {
  ok?: boolean;
  msg?: string;
}

const assertOk = (mutation: string, result?: MutationResult) => {
  if (!result?.ok) throw new Error(`${mutation} failed: ${result?.msg}`);
};

export async function createScopedPresetFixture(
  api: APIRequestContext,
  {
    baseResourceGroup = 'default',
    domain = 'default',
  }: { baseResourceGroup?: string; domain?: string } = {},
): Promise<ScopedPresetFixture> {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const fixture: ScopedPresetFixture = {
    presetName: `e2e-rp-${suffix}`,
    resourceGroup: `e2e-rg-${suffix}`,
    baseResourceGroup,
    domain,
    presetIds: [],
  };

  // A half-built fixture is torn down here: the caller never receives it.
  try {
    const group = await gqlAdmin<{ create_scaling_group?: MutationResult }>(
      api,
      `mutation($name: String!, $props: CreateScalingGroupInput!) {
        create_scaling_group(name: $name, props: $props) { ok msg }
      }`,
      {
        name: fixture.resourceGroup,
        props: { driver: 'static', scheduler: 'fifo', description: 'e2e' },
      },
    );
    assertOk('create_scaling_group', group.create_scaling_group);
    const association = await gqlAdmin<{
      associate_scaling_group_with_domain?: MutationResult;
    }>(
      api,
      `mutation($domain: String!, $sg: String!) {
        associate_scaling_group_with_domain(domain: $domain, scaling_group: $sg) { ok msg }
      }`,
      { domain, sg: fixture.resourceGroup },
    );
    assertOk(
      'associate_scaling_group_with_domain',
      association.associate_scaling_group_with_domain,
    );

    for (const scalingGroup of [
      null,
      baseResourceGroup,
      fixture.resourceGroup,
    ]) {
      const data = await gqlAdmin<{
        create_resource_preset?: { resource_preset?: { id?: string } };
      }>(
        api,
        `mutation($name: String!, $props: CreateResourcePresetInput!) {
          create_resource_preset(name: $name, props: $props) {
            ok msg resource_preset { id }
          }
        }`,
        {
          name: fixture.presetName,
          props: {
            resource_slots: JSON.stringify({ cpu: '1', mem: '1073741824' }),
            scaling_group_name: scalingGroup,
          },
        },
      );
      const id = data.create_resource_preset?.resource_preset?.id;
      if (!id) throw new Error(`Failed to create preset ${fixture.presetName}`);
      fixture.presetIds.push(id);
    }
  } catch (e) {
    await deleteScopedPresetFixture(api, fixture);
    throw e;
  }
  return fixture;
}

/** Best-effort teardown; never throws so it cannot mask the test result. */
export async function deleteScopedPresetFixture(
  api: APIRequestContext,
  fixture: ScopedPresetFixture,
): Promise<void> {
  const warn = (step: string) => (e: unknown) =>
    console.warn(`[deleteScopedPresetFixture] ${step}: ${String(e)}`);
  for (const id of fixture.presetIds) {
    await gqlAdmin(
      api,
      `mutation($id: UUID) { delete_resource_preset(id: $id) { ok msg } }`,
      { id },
    ).catch(warn(`delete preset ${id}`));
  }
  await gqlAdmin(
    api,
    `mutation($domain: String!, $sg: String!) {
      disassociate_scaling_group_with_domain(domain: $domain, scaling_group: $sg) { ok msg }
    }`,
    { domain: fixture.domain, sg: fixture.resourceGroup },
  ).catch(warn('disassociate resource group'));
  await gqlAdmin(
    api,
    `mutation($name: String!) { delete_scaling_group(name: $name) { ok msg } }`,
    { name: fixture.resourceGroup },
  ).catch(warn('delete resource group'));
}
