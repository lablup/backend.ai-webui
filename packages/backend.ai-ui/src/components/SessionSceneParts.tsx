/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Shared model and chrome for the playful session scenes
 (<BAISessionCrowdScene>, <BAISessionPinwheelMeadow>): the figure/zone/finder
 types, the finder state, the finder bar and the hover card.
 */
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import { Badge } from '@lablup/ui-common/Badge';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import React, { useState } from 'react';

export const crowdFigureMoods = [
  'working',
  'idle',
  'overheated',
  'waiting',
  'leaving',
] as const;
export type BAICrowdFigureMood = (typeof crowdFigureMoods)[number];

export interface BAICrowdFigure {
  key: string;
  name: string;
  owner?: string;
  /** `BAICrowdZone.key` this figure stands in. Unknown zones are skipped. */
  zoneKey: string;
  mood: BAICrowdFigureMood;
  /** 0..1 — drives how fast a `working` figure moves. */
  utilization?: number;
  /** The one to find (the viewer's own session). */
  isHero?: boolean;
  /** Extra lines for the hover card, after the built-in ones. */
  detail?: React.ReactNode;
}

export interface BAICrowdZone {
  key: string;
  label: string;
}

export interface BAICrowdFinder {
  key: string;
  label: string;
  icon?: React.ReactNode;
  match: (figure: BAICrowdFigure) => boolean;
}

/** Props every session scene takes; each scene adds only its own extras. */
export interface BAISessionSceneBaseProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  figures: ReadonlyArray<BAICrowdFigure>;
  zones: ReadonlyArray<BAICrowdZone>;
  finders?: ReadonlyArray<BAICrowdFinder>;
  /** Controlled active finder. Omit to keep it in local state. */
  activeFinderKey?: string | null;
  onActiveFinderChange?: (key: string | null) => void;
  onFigureClick?: (figure: BAICrowdFigure) => void;
  /** Hide the mood legend row. */
  hideLegend?: boolean;
}

const MOOD_LABEL_KEY: Record<BAICrowdFigureMood, string> = {
  working: 'comp:BAISessionScene.mood.Working',
  idle: 'comp:BAISessionScene.mood.Idle',
  overheated: 'comp:BAISessionScene.mood.Overheated',
  waiting: 'comp:BAISessionScene.mood.Waiting',
  leaving: 'comp:BAISessionScene.mood.Leaving',
};

export const clamp01 = (n: number | undefined) =>
  Number.isFinite(n) ? Math.min(1, Math.max(0, n as number)) : 0;

export const useSceneLabels = () => {
  'use memo';
  const { t } = useBAIi18n();
  return {
    mood: (mood: BAICrowdFigureMood) => t(MOOD_LABEL_KEY[mood]),
    hero: t('comp:BAISessionScene.Hero'),
  };
};

export const useSceneFinder = ({
  figures,
  finders = [],
  activeFinderKey,
  onActiveFinderChange,
}: Pick<
  BAISessionSceneBaseProps,
  'figures' | 'finders' | 'activeFinderKey' | 'onActiveFinderChange'
>) => {
  'use memo';
  const [localFinderKey, setLocalFinderKey] = useState<string | null>(null);
  const finderKey =
    activeFinderKey !== undefined ? activeFinderKey : localFinderKey;
  const setFinderKey = (next: string | null) => {
    setLocalFinderKey(next);
    onActiveFinderChange?.(next);
  };
  const activeFinder = finders.find((f) => f.key === finderKey) ?? null;
  const matches = activeFinder
    ? new Set(figures.filter(activeFinder.match).map((f) => f.key))
    : null;
  return { finderKey, setFinderKey, matches };
};

export const SceneFinderBar: React.FC<{
  className?: string;
  figures: ReadonlyArray<BAICrowdFigure>;
  finders: ReadonlyArray<BAICrowdFinder>;
  finderKey: string | null;
  matches: Set<string> | null;
  onChange: (key: string | null) => void;
}> = ({ className, figures, finders, finderKey, matches, onChange }) => {
  'use memo';
  const { t } = useBAIi18n();
  if (finders.length === 0) return null;
  return (
    <BAIFlex className={className} gap="xs" wrap="wrap" align="center">
      {finders.map((finder) => {
        const isActive = finder.key === finderKey;
        const count = figures.filter(finder.match).length;
        return (
          <Button
            key={finder.key}
            size="sm"
            variant={isActive ? 'primary' : 'secondary'}
            icon={finder.icon}
            label={`${finder.label} · ${count}`}
            aria-pressed={isActive}
            onClick={() => onChange(isActive ? null : finder.key)}
          />
        );
      })}
      {matches && (
        <>
          <Badge
            variant="info"
            label={t('comp:BAISessionScene.FoundCount', {
              count: matches.size,
            })}
          />
          <Button
            size="sm"
            variant="ghost"
            label={t('comp:BAISessionScene.ShowAll')}
            onClick={() => onChange(null)}
          />
        </>
      )}
    </BAIFlex>
  );
};

/** Tooltip body; the tooltip surface is dark, so text inherits its colour. */
export const SceneFigureCard: React.FC<{ figure: BAICrowdFigure }> = ({
  figure,
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const labels = useSceneLabels();
  return (
    <BAIFlex direction="column" align="start" gap="xxs">
      <Text weight="semibold" color="inherit">
        {figure.name}
      </Text>
      {figure.owner && (
        <Text type="supporting" color="inherit">
          {figure.owner}
        </Text>
      )}
      <Text type="supporting" color="inherit">
        {labels.mood(figure.mood)}
        {figure.utilization !== undefined &&
          ` · ${t('comp:BAISessionScene.Utilization')} ${Math.round(clamp01(figure.utilization) * 100)}%`}
      </Text>
      {figure.detail}
    </BAIFlex>
  );
};
