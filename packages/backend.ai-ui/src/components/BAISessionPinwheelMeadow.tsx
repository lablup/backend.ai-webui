/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PoC pinwheel meadow, a hand-painted take on the session scenes: every
 session is a paper pinwheel planted on its agent's hillside and spins as
 fast as its utilization. Idle ones stand still with a dragonfly resting on
 them, overheated ones whirl warm and throw embers, waiting ones are a sheet
 not yet folded open, terminating ones lose their blades to the wind. The
 viewer's own wear a red ribbon. Same data and finders as the crowd scene.
 */
import BAIFlex from './BAIFlex';
import './BAISessionPinwheelMeadow.css';
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
import React from 'react';

export type BAISessionPinwheelMeadowProps = BAISessionSceneBaseProps;

const PALETTE_COUNT = 5;
const BLADE_ANGLES = [0, 90, 180, 270];

const paletteFor = (key: string) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h) % PALETTE_COUNT;
};

/** One pinwheel in a 48×72 box, hub at (24, 22), planted at the bottom. */
const PinwheelGlyph: React.FC<{
  mood: BAICrowdFigureMood;
  isHero: boolean;
  ticket?: string;
}> = ({ mood, isHero, ticket }) => {
  'use memo';
  const hasBlades = mood !== 'waiting';
  return (
    <svg
      className="pw-glyph"
      viewBox="0 0 48 72"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="pw-tuft"
        d="M13 72 C15 67 16 64.5 18 62 C18.4 66 19 69.5 20 72 Z M20 72 C22 66 23.5 63 26.5 60.5 C25.6 65.5 25.6 69 26.5 72 Z M26 72 C28 67 30 64.5 34 63 C31.5 67 30.5 70 30.5 72 Z"
      />
      <g className="pw-sway">
        <rect
          className="pw-stick"
          x="22.8"
          y="22"
          width="2.6"
          height="48"
          rx="1.3"
        />
        {isHero && (
          <g className="pw-ribbon">
            <path d="M25.4 44 C31 43 34.5 48 42 46.2 C38.5 51.5 32 50 25.4 47 Z" />
            <path d="M23 45.5 C18 42 15.5 47.5 19.5 48.5 C21 48.8 22.4 47.5 23 45.5 Z" />
            <circle cx="24.1" cy="45.6" r="1.6" />
          </g>
        )}
        {mood === 'waiting' && (
          <g className="pw-ticket">
            <line x1="24" y1="44" x2="24" y2="47" />
            <rect x="18.5" y="47" width="11" height="8" rx="1.2" />
            <text x="24" y="53.2">
              {ticket ?? '#'}
            </text>
          </g>
        )}
        {hasBlades ? (
          <>
            <circle className="pw-blur" cx="24" cy="22" r="17" />
            <g className="pw-blades">
              {BLADE_ANGLES.map((angle, i) => (
                <g
                  key={angle}
                  className={`pw-blade pw-blade-${i}`}
                  transform={`rotate(${angle} 24 22)`}
                >
                  <g className="pw-blade-drift">
                    <path
                      className={i % 2 ? 'pw-face pw-b' : 'pw-face pw-a'}
                      d="M24 22 L24.5 4.5 C31 5.5 37.5 9.5 40.5 15.5 C34 16 28.5 18.5 24 22 Z"
                    />
                    <path
                      className={i % 2 ? 'pw-fold pw-b' : 'pw-fold pw-a'}
                      d="M24 22 L24.5 4.5 C27.6 10 27.2 16.6 24 22 Z"
                    />
                  </g>
                </g>
              ))}
            </g>
          </>
        ) : (
          <g className="pw-bud">
            <rect
              className="pw-face pw-a"
              x="16"
              y="14"
              width="16"
              height="16"
              rx="1"
              transform="rotate(45 24 22)"
            />
            <path
              className="pw-cut"
              d="M24 10.7 L24 18.5 M35.3 22 L27.5 22 M24 33.3 L24 25.5 M12.7 22 L20.5 22"
            />
          </g>
        )}
        <circle className="pw-hub" cx="24" cy="22" r="2.6" />
        {mood === 'idle' && (
          <g
            className="pw-dragonfly"
            transform="translate(28 2) rotate(-8) scale(1.7)"
          >
            <g className="pw-wings">
              <ellipse cx="-0.5" cy="-1.6" rx="4" ry="1.2" />
              <ellipse cx="1.4" cy="-1.4" rx="3.4" ry="1" />
            </g>
            <line x1="-6" y1="0" x2="4" y2="0" />
            <circle cx="4.8" cy="0" r="1.3" />
          </g>
        )}
        {mood === 'overheated' && (
          <g className="pw-embers">
            <circle cx="20" cy="18" r="1.1" />
            <circle cx="28" cy="16" r="0.9" />
            <circle cx="24" cy="12" r="1" />
          </g>
        )}
      </g>
    </svg>
  );
};

const Clouds: React.FC = () => (
  <svg
    className="pw-clouds"
    viewBox="0 0 240 64"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <g className="pw-cloud pw-cloud-1">
      <rect
        className="pw-cloud-shade"
        x="30"
        y="33"
        width="66"
        height="12"
        rx="6"
      />
      <circle cx="44" cy="32" r="11" />
      <circle cx="58" cy="24" r="14" />
      <circle cx="75" cy="28" r="12" />
      <circle cx="88" cy="34" r="8.5" />
      <rect x="33" y="31" width="60" height="10" rx="5" />
    </g>
    <g className="pw-cloud pw-cloud-2">
      <rect
        className="pw-cloud-shade"
        x="150"
        y="41"
        width="44"
        height="8"
        rx="4"
      />
      <circle cx="160" cy="40" r="7" />
      <circle cx="171" cy="34" r="9.5" />
      <circle cx="184" cy="39" r="7" />
      <rect x="153" y="39" width="40" height="7" rx="3.5" />
    </g>
    <g className="pw-wind">
      <path d="M-30 18 q30 -7 60 0 t60 0 t60 0 t60 0 t60 0" />
      <path d="M-30 46 q30 -6 60 0 t60 0 t60 0 t60 0 t60 0" />
    </g>
  </svg>
);

const BAISessionPinwheelMeadow: React.FC<BAISessionPinwheelMeadowProps> = ({
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
      className={classNames('bai-pinwheel-meadow', className, {
        'is-searching': !!matches,
      })}
    >
      <SceneFinderBar
        figures={figures}
        finders={finders}
        finderKey={finderKey}
        matches={matches}
        onChange={setFinderKey}
      />

      <div className="pw-zones">
        {zones.map((zone) => {
          const zoneFigures = figuresByZone[zone.key] ?? [];
          const foundHere = matches
            ? zoneFigures.filter((f) => matches.has(f.key)).length
            : 0;
          const spinning = zoneFigures.filter(
            (f) => f.mood === 'working' || f.mood === 'overheated',
          );
          const wind = spinning.length
            ? _.meanBy(spinning, (f) => clamp01(f.utilization))
            : 0;
          const waitingKeys = zoneFigures
            .filter((f) => f.mood === 'waiting')
            .map((f) => f.key);
          return (
            <section
              key={zone.key}
              className={classNames('pw-zone', {
                'has-found': foundHere > 0,
                'is-empty-of-found': matches && foundHere === 0,
              })}
              style={{ '--pw-wind': wind } as React.CSSProperties}
              aria-label={zone.label}
            >
              <div className="pw-sky">
                <Clouds />
                <BAIFlex
                  className="pw-sign-row"
                  justify="between"
                  align="center"
                  gap="xs"
                >
                  <span className="pw-sign">
                    <Text type="label" color="inherit">
                      {zone.label}
                    </Text>
                  </span>
                  <span className="pw-sign pw-sign-count">
                    <Text type="supporting" color="inherit">
                      {matches && foundHere > 0
                        ? `${foundHere} / ${zoneFigures.length}`
                        : zoneFigures.length}
                    </Text>
                  </span>
                </BAIFlex>
              </div>
              <svg
                className="pw-hill"
                viewBox="0 0 240 16"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M0 16 L0 9 C40 1 80 2 120 7 C160 12 200 4 240 6 L240 16 Z" />
              </svg>
              <div className="pw-field">
                {zoneFigures.map((figure, idx) => {
                  const isFound = matches?.has(figure.key) ?? false;
                  const ticket =
                    figure.mood === 'waiting'
                      ? String(waitingKeys.indexOf(figure.key) + 1)
                      : undefined;
                  return (
                    <Tooltip
                      key={figure.key}
                      content={<SceneFigureCard figure={figure} />}
                      placement="above"
                    >
                      <button
                        type="button"
                        className={classNames(
                          'pw-item',
                          `mood-${figure.mood}`,
                          `pal-${figure.mood === 'overheated' ? 'hot' : paletteFor(figure.key)}`,
                          {
                            'is-hero': figure.isHero,
                            'is-found': isFound,
                            'is-dimmed': matches && !isFound,
                          },
                        )}
                        style={
                          {
                            '--pw-util': clamp01(figure.utilization),
                            // Deterministic jitter so the meadow is not a grid.
                            '--pw-phase': `${(idx % 7) * -0.41}s`,
                            '--pw-lift': `${(idx * 37) % 7}px`,
                            '--pw-scale': 0.9 + ((idx * 53) % 13) / 100,
                          } as React.CSSProperties
                        }
                        aria-label={`${figure.name} — ${labels.mood(figure.mood)}`}
                        onClick={() => onFigureClick?.(figure)}
                      >
                        <PinwheelGlyph
                          mood={figure.mood}
                          isHero={!!figure.isHero}
                          ticket={ticket}
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
        <BAIFlex className="pw-legend" gap="md" wrap="wrap" align="center">
          {crowdFigureMoods.map((mood) => (
            <BAIFlex key={mood} gap="xxs" align="center">
              <span
                className={classNames(
                  'pw-item is-legend',
                  `mood-${mood}`,
                  mood === 'overheated' ? 'pal-hot' : 'pal-1',
                )}
                style={{ '--pw-util': 0.5 } as React.CSSProperties}
              >
                <PinwheelGlyph mood={mood} isHero={false} ticket="1" />
              </span>
              <Text type="supporting">{labels.mood(mood)}</Text>
            </BAIFlex>
          ))}
          <BAIFlex gap="xxs" align="center">
            <span
              className="pw-item is-legend is-hero mood-working pal-0"
              style={{ '--pw-util': 0.5 } as React.CSSProperties}
            >
              <PinwheelGlyph mood="working" isHero />
            </span>
            <Text type="supporting">{labels.hero}</Text>
          </BAIFlex>
        </BAIFlex>
      )}
    </div>
  );
};

export default BAISessionPinwheelMeadow;
