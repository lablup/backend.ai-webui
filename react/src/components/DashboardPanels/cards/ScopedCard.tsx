/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  cardScopeKind,
  resolveCardScope,
  type CardScope,
  type CardScopeKind,
} from '../cardScope';
import MemberCard, { NoProjectText } from '../memberCards/MemberCard';
import type { DashboardScope } from '../types';
import React from 'react';

export interface ScopedCardProps {
  scope: DashboardScope;
  /** The title and tooltip on each page the card is on. */
  heading: Partial<
    Record<CardScopeKind, { title: string; tooltip?: React.ReactNode }>
  > & { project: { title: string; tooltip?: React.ReactNode } };
  extra?: React.ReactNode;
  fetchKey: string;
  children: (scope: CardScope, fetchKey: string) => React.ReactNode;
}

/** A card shared by several dashboard pages: one UI, the page's scope as input (ADR 0016). */
const ScopedCard: React.FC<ScopedCardProps> = ({
  scope,
  heading,
  extra,
  fetchKey,
  children,
}) => {
  'use memo';
  const cardScope = resolveCardScope(scope);
  const { title, tooltip } = heading[cardScopeKind(scope)] ?? heading.project;
  return (
    <MemberCard
      title={title}
      tooltip={tooltip}
      extra={extra}
      fetchKey={fetchKey}
    >
      {(key) => (cardScope ? children(cardScope, key) : <NoProjectText />)}
    </MemberCard>
  );
};

export default ScopedCard;
