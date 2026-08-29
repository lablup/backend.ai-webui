/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `/model-store` (FR-3766): `bai_list_visible_model_card`,
 * `bai_get_model_card_filter` and `bai_get_current_model_card` — "current"
 * being the card open in its drawer (`?modelCard=…`).
 *
 * Registered from the grid, which is where the cards live; the page has no
 * table settings, so there are no hidden columns to respect.
 */
import { resourcePath } from '../../helper/resourcePath';
import {
  resolveOpenedRow,
  usePageReadTools,
  type PageToolRow,
} from '../../helper/webmcpPageTools';
import type { JsonSchemaForInference } from '@mcp-b/webmcp-types';
import * as _ from 'lodash-es';

/** The node fields `ModelStoreListPageV2Query` selects for these tools. */
export interface ModelCardRowSource {
  readonly id: string;
  readonly name?: string | null;
  readonly metadata?: {
    readonly title?: string | null;
    readonly task?: string | null;
    readonly author?: string | null;
  } | null;
}

export const MODEL_CARD_ROW_PROPERTIES: Readonly<
  Record<string, JsonSchemaForInference>
> = {
  id: { type: 'string', description: 'Model card id (global id).' },
  name: { type: 'string' },
  title: {
    type: 'string',
    description: 'Card heading, when the card has one.',
  },
  task: { type: 'string' },
  author: { type: 'string' },
};

export const toModelCardRow = (node: ModelCardRowSource): PageToolRow => ({
  id: node.id,
  name: node.name ?? null,
  title: node.metadata?.title ?? null,
  task: node.metadata?.task ?? null,
  author: node.metadata?.author ?? null,
});

export interface ModelStoreListWebMCPToolsInput {
  modelCards: ReadonlyArray<ModelCardRowSource>;
  pagination: { current: number; pageSize: number; total?: number | null };
  queryParams: {
    /** nuqs `parseAsJson` value; reported as the URL string it round-trips as. */
    filter?: object | null;
    sort?: string | null;
  };
  /** `modelCard` search param — the card whose drawer is open. */
  openedModelCardId?: string | null;
}

export const useModelStoreListWebMCPTools = ({
  modelCards,
  pagination,
  queryParams,
  openedModelCardId,
}: ModelStoreListWebMCPToolsInput): void => {
  const rows = _.map(modelCards, toModelCardRow);
  const filterParam = _.isEmpty(queryParams.filter)
    ? null
    : JSON.stringify(queryParams.filter);

  usePageReadTools(
    {
      noun: 'model_card',
      plural: 'model cards',
      resource: 'model_card',
      rowProperties: MODEL_CARD_ROW_PROPERTIES,
      rows,
      pagination,
      // The model store has no status/category param (see
      // LIST_RESOURCES_WITHOUT_STATUS); `sort` carries the ordering instead.
      filter: {
        filter: filterParam,
        sort: queryParams.sort ?? null,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      extraFilterProperties: {
        sort: {
          type: 'string',
          description:
            'NAME_ASC | NAME_DESC | CREATED_AT_ASC | CREATED_AT_DESC.',
        },
      },
      current: resolveOpenedRow(rows, openedModelCardId, (id) =>
        resourcePath({ type: 'model_card', id }),
      ),
    },
    [
      JSON.stringify(rows),
      pagination.current,
      pagination.pageSize,
      pagination.total,
      filterParam,
      queryParams.sort,
      openedModelCardId,
    ],
  );
};
