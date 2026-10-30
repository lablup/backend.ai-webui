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
import { filterOutNullAndUndefined, useBAIWebMCPActive } from 'backend.ai-ui';
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
  /** The cards are still those of the previous view. */
  pending?: boolean;
  /** The store's URL params (`filter`, `sort`). */
  viewParams: Readonly<Record<string, ViewParamValue>>;
}

const ModelCardListToolsRegistrar: React.FC<WebMCPModelCardListToolsProps> = ({
  modelCardsFrgmt,
  page,
  pageSize,
  total,
  pending,
  viewParams,
}) => {
  'use memo';
  const { pathname, search } = useLocation();

  const modelCards = useFragment(
    graphql`
      fragment WebMCPModelCardListToolsFragment on ModelCardV2
      @relay(plural: true) {
        entityId
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

  // Mirrors `ModelCardV2Card`: one title and one relative time per card.
  const rows: Array<PageToolRow> = _.map(
    filterOutNullAndUndefined(modelCards),
    (card) => ({
      id: card.entityId,
      title: card.metadata?.title || card.name || null,
      task: card.metadata?.task ?? null,
      author: card.metadata?.author ?? null,
      updatedAt: card.updatedAt ?? card.createdAt ?? null,
    }),
  );
  const list = visibleRowsResult({ rows, page, pageSize, total, pending });
  const openedId = new URLSearchParams(search).get(MODEL_CARD_PARAM);

  usePageReadTools({
    noun: 'model_card',
    plural: 'model cards',
    rowFields:
      'Row fields: id (model card UUID), title (the name when the card has no title), task, author, updatedAt (the creation time when never updated).',
    currentMeaning: 'the model card whose drawer is open',
    readRows: () => list,
    readViewState: () =>
      viewStateResult(
        pathname,
        { ...viewParams, current: page, pageSize },
        pending,
      ),
    readCurrent: () =>
      openedItem(
        list.rows,
        openedId,
        pathWithSearchParam(pathname, search, MODEL_CARD_PARAM, openedId ?? ''),
      ),
  });

  return null;
};

/**
 * `bai_list_visible_model_card`, `bai_get_model_card_filter` and
 * `bai_get_current_model_card` for the model store (ADR 0017).
 */
const WebMCPModelCardListTools: React.FC<WebMCPModelCardListToolsProps> = (
  props,
) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <ModelCardListToolsRegistrar {...props} /> : null;
};

export default WebMCPModelCardListTools;
