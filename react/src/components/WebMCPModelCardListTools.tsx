/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPModelCardListToolsFragment$key } from '../__generated__/WebMCPModelCardListToolsFragment.graphql';
import {
  openedItem,
  pathWithSearchParam,
  usePageReadTools,
  viewStateResult,
  visibleRowsResult,
  type PageToolRow,
  type ViewParamValue,
} from '../helper/webmcpPageTools';
import {
  filterOutNullAndUndefined,
  safeDecodeUuid,
  useBAIWebMCPActive,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

const MODEL_CARD_PARAM = 'modelCard';

export interface WebMCPModelCardListToolsProps {
  modelCardsFrgmt: WebMCPModelCardListToolsFragment$key;
  page: number;
  pageSize: number;
  total?: number | null;
  /** The store's URL params (`filter`, `sort`). */
  viewParams: Readonly<Record<string, ViewParamValue>>;
}

const ModelCardListToolsRegistrar: React.FC<WebMCPModelCardListToolsProps> = ({
  modelCardsFrgmt,
  page,
  pageSize,
  total,
  viewParams,
}) => {
  'use memo';
  const { pathname, search } = useLocation();

  const modelCards = useFragment(
    graphql`
      fragment WebMCPModelCardListToolsFragment on ModelCardV2
      @relay(plural: true) {
        id
        name
        metadata {
          title
          task
          author
        }
        createdAt
        updatedAt
      }
    `,
    modelCardsFrgmt,
  );

  // The store is a card grid with no column settings: every field is shown.
  const rows: Array<PageToolRow> = _.map(
    filterOutNullAndUndefined(modelCards),
    (card) => ({
      id: safeDecodeUuid(card.id) ?? card.id,
      name: card.name ?? null,
      title: card.metadata?.title ?? null,
      task: card.metadata?.task ?? null,
      author: card.metadata?.author ?? null,
      createdAt: card.createdAt ?? null,
      updatedAt: card.updatedAt ?? null,
    }),
  );
  const list = visibleRowsResult({ rows, page, pageSize, total });
  const openedParam = new URLSearchParams(search).get(MODEL_CARD_PARAM);
  const openedId = openedParam
    ? (safeDecodeUuid(openedParam) ?? openedParam)
    : null;

  usePageReadTools({
    noun: 'model_card',
    plural: 'model cards',
    rowFields:
      'Row fields: id (model card UUID), name, title, task, author, createdAt, updatedAt.',
    currentMeaning: 'the model card whose drawer is open',
    readRows: () => list,
    readViewState: () =>
      viewStateResult(pathname, { ...viewParams, current: page, pageSize }),
    readCurrent: () =>
      openedItem(
        list.rows,
        openedId,
        pathWithSearchParam(
          pathname,
          search,
          MODEL_CARD_PARAM,
          openedParam ?? '',
        ),
      ),
  });

  return null;
};

/**
 * `bai_list_visible_model_card`, `bai_get_model_card_filter` and
 * `bai_get_current_model_card` for the model store (ADR 0009).
 */
const WebMCPModelCardListTools: React.FC<WebMCPModelCardListToolsProps> = (
  props,
) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <ModelCardListToolsRegistrar {...props} /> : null;
};

export default WebMCPModelCardListTools;
