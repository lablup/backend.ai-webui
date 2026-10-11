/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PoC "Where's Wally" crowd view: every session is a small cartoon figure in
 the zone (agent / resource group) it runs on; its state shows only as props
 (smoke, a ticket, Zzz, a suitcase) and the owner's own sessions wear the
 striped shirt. Finders spotlight the figures a predicate matches and dim the
 rest, so "which one is mine / overheated / idle" becomes a search game. The
 scene is data-agnostic: callers map sessions to figures.
 */
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import './BAISessionCrowdScene.css';
import { Badge } from '@lablup/ui-common/Badge';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useId, useState } from 'react';

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
  /** The one to find: wears the striped shirt and the bobble hat. */
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

export interface BAISessionCrowdSceneProps extends Omit<
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
  working: 'comp:BAISessionCrowdScene.mood.Working',
  idle: 'comp:BAISessionCrowdScene.mood.Idle',
  overheated: 'comp:BAISessionCrowdScene.mood.Overheated',
  waiting: 'comp:BAISessionCrowdScene.mood.Waiting',
  leaving: 'comp:BAISessionCrowdScene.mood.Leaving',
};

const clamp01 = (n: number | undefined) =>
  Number.isFinite(n) ? Math.min(1, Math.max(0, n as number)) : 0;

/** One figure, drawn in a 40×56 box. Props are SVG parts toggled by mood. */
const CrowdFigureGlyph: React.FC<{
  mood: BAICrowdFigureMood;
  isHero: boolean;
  stripesId: string;
  ticket?: string;
}> = ({ mood, isHero, stripesId, ticket }) => {
  'use memo';
  return (
    <svg
      className="bai-crowd-glyph"
      viewBox="0 0 40 56"
      aria-hidden="true"
      focusable="false"
    >
      {mood === 'overheated' && (
        <g className="bai-crowd-smoke">
          <circle cx="14" cy="6" r="2.2" />
          <circle cx="20" cy="3" r="2.8" />
          <circle cx="27" cy="6" r="2.2" />
        </g>
      )}
      {mood === 'idle' && (
        <g className="bai-crowd-zzz">
          <text x="27" y="10">
            z
          </text>
          <text x="32" y="5" className="bai-crowd-zzz-small">
            z
          </text>
        </g>
      )}
      <g className="bai-crowd-body">
        {/* legs */}
        <g className="bai-crowd-legs">
          <rect x="13" y="40" width="5" height="13" rx="2" />
          <rect x="22" y="40" width="5" height="13" rx="2" />
        </g>
        {/* torso */}
        <rect
          className="bai-crowd-torso"
          x="10"
          y="24"
          width="20"
          height="18"
          rx="4"
          // Inline so it wins over the class fill; the pattern id is per instance.
          style={isHero ? { fill: `url(#${stripesId})` } : undefined}
        />
        {/* arms */}
        <rect
          className="bai-crowd-arm bai-crowd-arm-left"
          x="5"
          y="25"
          width="5"
          height="14"
          rx="2.5"
        />
        <rect
          className="bai-crowd-arm bai-crowd-arm-right"
          x="30"
          y="25"
          width="5"
          height="14"
          rx="2.5"
        />
        {/* head */}
        <g className="bai-crowd-head">
          <circle className="bai-crowd-face" cx="20" cy="15" r="8" />
          {isHero && (
            <>
              <path
                className="bai-crowd-hat"
                d="M11 12 Q20 2 29 12 L29 14 L11 14 Z"
              />
              <circle className="bai-crowd-bobble" cx="20" cy="4" r="2.5" />
              <g className="bai-crowd-glasses">
                <circle cx="16.5" cy="15.5" r="2.6" />
                <circle cx="23.5" cy="15.5" r="2.6" />
                <line x1="19.1" y1="15.5" x2="20.9" y2="15.5" />
              </g>
            </>
          )}
          <circle className="bai-crowd-eye" cx="17" cy="15" r="0.9" />
          <circle className="bai-crowd-eye" cx="23" cy="15" r="0.9" />
        </g>
        {mood === 'overheated' && (
          <g className="bai-crowd-sweat">
            <path d="M30 11 q2 3 0 4.5 q-2 -1.5 0 -4.5z" />
          </g>
        )}
      </g>
      {mood === 'waiting' && (
        <g className="bai-crowd-ticket">
          <rect x="1" y="28" width="11" height="8" rx="1" />
          <text x="6.5" y="34.2">
            {ticket ?? '#'}
          </text>
        </g>
      )}
      {mood === 'leaving' && (
        <g className="bai-crowd-suitcase">
          <rect x="29" y="38" width="10" height="8" rx="1.5" />
          <rect x="32.5" y="35.5" width="3" height="3" rx="0.8" />
        </g>
      )}
    </svg>
  );
};

const BAISessionCrowdScene: React.FC<BAISessionCrowdSceneProps> = ({
  figures,
  zones,
  finders = [],
  activeFinderKey,
  onActiveFinderChange,
  onFigureClick,
  hideLegend,
  className,
  ...divProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const stripesId = `${useId()}-stripes`;
  const [localFinderKey, setLocalFinderKey] = useState<string | null>(null);
  const finderKey =
    activeFinderKey !== undefined ? activeFinderKey : localFinderKey;
  const setFinderKey = (next: string | null) => {
    setLocalFinderKey(next);
    onActiveFinderChange?.(next);
  };
  const activeFinder = finders.find((f) => f.key === finderKey) ?? null;

  const figuresByZone = _.groupBy(figures, (f) => f.zoneKey);
  const matches = activeFinder
    ? new Set(figures.filter(activeFinder.match).map((f) => f.key))
    : null;

  const moodLabel = (mood: BAICrowdFigureMood) => t(MOOD_LABEL_KEY[mood]);

  return (
    <div
      {...divProps}
      className={classNames('bai-crowd-scene', className, {
        'is-searching': !!matches,
      })}
    >
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <pattern
            id={stripesId}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <rect className="bai-crowd-stripe-light" width="4" height="4" />
            <rect className="bai-crowd-stripe-dark" width="4" height="2" />
          </pattern>
        </defs>
      </svg>

      {finders.length > 0 && (
        <BAIFlex
          className="bai-crowd-finders"
          gap="xs"
          wrap="wrap"
          align="center"
        >
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
                onClick={() => setFinderKey(isActive ? null : finder.key)}
              />
            );
          })}
          {matches && (
            <>
              <Badge
                variant="info"
                label={t('comp:BAISessionCrowdScene.FoundCount', {
                  count: matches.size,
                })}
              />
              <Button
                size="sm"
                variant="ghost"
                label={t('comp:BAISessionCrowdScene.ShowAll')}
                onClick={() => setFinderKey(null)}
              />
            </>
          )}
        </BAIFlex>
      )}

      <div className="bai-crowd-zones">
        {zones.map((zone) => {
          const zoneFigures = figuresByZone[zone.key] ?? [];
          const foundHere = matches
            ? zoneFigures.filter((f) => matches.has(f.key)).length
            : 0;
          return (
            <section
              key={zone.key}
              className={classNames('bai-crowd-zone', {
                'has-found': foundHere > 0,
                'is-empty-of-found': matches && foundHere === 0,
              })}
              aria-label={zone.label}
            >
              <BAIFlex
                className="bai-crowd-zone-head"
                justify="between"
                align="center"
                gap="xs"
              >
                <Text type="label" color="secondary">
                  {zone.label}
                </Text>
                <Text type="supporting">
                  {matches && foundHere > 0
                    ? `${foundHere} / ${zoneFigures.length}`
                    : zoneFigures.length}
                </Text>
              </BAIFlex>
              <div className="bai-crowd-ground">
                {zoneFigures.map((figure, idx) => {
                  const util = clamp01(figure.utilization);
                  const isFound = matches?.has(figure.key) ?? false;
                  const card = (
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
                        {moodLabel(figure.mood)}
                        {figure.utilization !== undefined &&
                          ` · ${t('comp:BAISessionCrowdScene.Utilization')} ${Math.round(util * 100)}%`}
                      </Text>
                      {figure.detail}
                    </BAIFlex>
                  );
                  return (
                    <Tooltip key={figure.key} content={card} placement="above">
                      <button
                        type="button"
                        className={classNames(
                          'bai-crowd-figure',
                          `mood-${figure.mood}`,
                          {
                            'is-hero': figure.isHero,
                            'is-found': isFound,
                            'is-dimmed': matches && !isFound,
                          },
                        )}
                        style={
                          {
                            '--bai-crowd-util': util,
                            // Stagger so a crowd never moves in lockstep.
                            '--bai-crowd-phase': `${(idx % 7) * -0.37}s`,
                          } as React.CSSProperties
                        }
                        aria-label={`${figure.name} — ${moodLabel(figure.mood)}`}
                        onClick={() => onFigureClick?.(figure)}
                      >
                        <CrowdFigureGlyph
                          mood={figure.mood}
                          isHero={!!figure.isHero}
                          stripesId={stripesId}
                          ticket={
                            figure.mood === 'waiting'
                              ? String(
                                  zoneFigures
                                    .filter((f) => f.mood === 'waiting')
                                    .indexOf(figure) + 1,
                                )
                              : undefined
                          }
                        />
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {!hideLegend && (
        <BAIFlex
          className="bai-crowd-legend"
          gap="md"
          wrap="wrap"
          align="center"
        >
          {crowdFigureMoods.map((mood) => (
            <BAIFlex key={mood} gap="xxs" align="center">
              <span
                className={classNames(
                  'bai-crowd-figure is-legend',
                  `mood-${mood}`,
                )}
              >
                <CrowdFigureGlyph
                  mood={mood}
                  isHero={false}
                  stripesId={stripesId}
                />
              </span>
              <Text type="supporting">{moodLabel(mood)}</Text>
            </BAIFlex>
          ))}
          <BAIFlex gap="xxs" align="center">
            <span className="bai-crowd-figure is-legend is-hero mood-working">
              <CrowdFigureGlyph mood="working" isHero stripesId={stripesId} />
            </span>
            <Text type="supporting">{t('comp:BAISessionCrowdScene.Hero')}</Text>
          </BAIFlex>
        </BAIFlex>
      )}
    </div>
  );
};

export default BAISessionCrowdScene;
