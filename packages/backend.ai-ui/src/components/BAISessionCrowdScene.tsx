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
import BAIFlex from './BAIFlex';
import './BAISessionCrowdScene.css';
import {
  type BAICrowdFigureMood,
  type BAISessionSceneBaseProps,
  clamp01,
  crowdFigureMoods,
  SceneFigureCard,
  SceneFinderBar,
  useSceneFinder,
  useSceneLabels,
} from './SessionSceneParts';
import { Text } from '@lablup/ui-common/Text';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useId } from 'react';

export {
  crowdFigureMoods,
  type BAICrowdFigure,
  type BAICrowdFigureMood,
  type BAICrowdFinder,
  type BAICrowdZone,
} from './SessionSceneParts';

export type BAISessionCrowdSceneProps = BAISessionSceneBaseProps;

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
  const labels = useSceneLabels();
  const stripesId = `${useId()}-stripes`;
  const { finderKey, setFinderKey, matches } = useSceneFinder({
    figures,
    finders,
    activeFinderKey,
    onActiveFinderChange,
  });
  const figuresByZone = _.groupBy(figures, (f) => f.zoneKey);

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

      <SceneFinderBar
        className="bai-crowd-finders"
        figures={figures}
        finders={finders}
        finderKey={finderKey}
        matches={matches}
        onChange={setFinderKey}
      />

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
                  return (
                    <Tooltip
                      key={figure.key}
                      content={<SceneFigureCard figure={figure} />}
                      placement="above"
                    >
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
                        aria-label={`${figure.name} — ${labels.mood(figure.mood)}`}
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
              <Text type="supporting">{labels.mood(mood)}</Text>
            </BAIFlex>
          ))}
          <BAIFlex gap="xxs" align="center">
            <span className="bai-crowd-figure is-legend is-hero mood-working">
              <CrowdFigureGlyph mood="working" isHero stripesId={stripesId} />
            </span>
            <Text type="supporting">{labels.hero}</Text>
          </BAIFlex>
        </BAIFlex>
      )}
    </div>
  );
};

export default BAISessionCrowdScene;
