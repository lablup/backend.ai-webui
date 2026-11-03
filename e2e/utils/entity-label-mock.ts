import { Page, Request } from '@playwright/test';
import { randomUUID } from 'crypto';

/**
 * Mocks a label onto the first row of an admin list whose rows load their
 * labels through `BAIEntityLabelTargetCellQuery`, so a label-token click can be
 * exercised without writing labels onto shared entities (roles, role presets).
 *
 * - `listQuery` answers from the real backend; the first unfiltered response
 *   picks the target row (its `edges[0].node.entityId`).
 * - That row's label cell gets `label` appended to its real labels.
 * - A `listQuery` whose `filter.labels` carries the label answers with the
 *   target row only, as a manager holding that label would.
 *
 * Call before the navigation that loads the list.
 */
export async function mockEntityLabelOnFirstRow(
  page: Page,
  options: {
    listQuery: string;
    connectionField: string;
    label: { key: string; value: string };
  },
): Promise<{ targetName: () => string | undefined }> {
  const { listQuery, connectionField, label } = options;
  let unfiltered: any = null;
  let target: any = null;

  await page.route(/\/admin\/gql/, async (route) => {
    const body = parseGraphQLBody(route.request());
    const operation = body?.query?.match(/(?:query|mutation)\s+(\w+)/)?.[1];
    if (operation === listQuery) {
      if (isLabelFilter(body?.variables?.filter, label) && unfiltered) {
        const json = structuredClone(unfiltered);
        json.data[connectionField] = {
          ...json.data[connectionField],
          count: 1,
          edges: [{ node: target }],
        };
        await route.fulfill({ json });
        return;
      }
      const response = await route.fetch();
      const json = await response.json();
      if (!unfiltered && json?.data?.[connectionField]?.edges?.length) {
        unfiltered = json;
        target = json.data[connectionField].edges[0].node;
      }
      await route.fulfill({ response, json });
      return;
    }
    if (
      operation === 'BAIEntityLabelTargetCellQuery' &&
      target &&
      body?.variables?.scope?.[0]?.entityId === target.entityId
    ) {
      const response = await route.fetch();
      const json = await response.json();
      if (!json?.data?.entityLabels) {
        await route.fulfill({ response });
        return;
      }
      const fieldId = randomUUID();
      json.data.entityLabels.edges = [
        ...(json.data.entityLabels.edges ?? []),
        {
          node: {
            id: Buffer.from(`EntityLabel:${fieldId}`).toString('base64'),
            fieldId,
            key: label.key,
            value: label.value,
          },
        },
      ];
      await route.fulfill({ response, json });
      return;
    }
    await route.fallback();
  });

  return { targetName: () => target?.name ?? undefined };
}

/** Whether `filter` selects entities carrying `label`, as a token click writes it. */
export function isLabelFilter(
  filter: any,
  label: { key: string; value: string },
): boolean {
  const some = filter?.labels?.some;
  return (
    some?.key?.iEquals === label.key && some?.value?.iEquals === label.value
  );
}

/** Resolves with the variables of the next `operation` request matching `predicate`. */
export async function waitForGraphQLVariables(
  page: Page,
  operation: string,
  predicate: (variables: Record<string, any>) => boolean,
): Promise<Record<string, any>> {
  const request = await page.waitForRequest(
    (req) => {
      const body = parseGraphQLBody(req);
      return (
        new RegExp(`query\\s+${operation}\\b`).test(body?.query ?? '') &&
        predicate(body?.variables ?? {})
      );
    },
    { timeout: 20000 },
  );
  return parseGraphQLBody(request)?.variables ?? {};
}

function parseGraphQLBody(
  request: Request,
): { query?: string; variables?: Record<string, any> } | null {
  if (request.method() !== 'POST' || !/\/admin\/gql/.test(request.url())) {
    return null;
  }
  try {
    return request.postDataJSON();
  } catch {
    return null;
  }
}
