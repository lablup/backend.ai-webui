/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PoC "Where's Wally" office: every agent is a pixel-art room, every session a
 fixed-size character. What a session holds is its furniture — desk or sofa,
 and the floor it reserves, step up small → medium → large with its share of
 the agent's capacity. Workers sit at desks, idle sessions take a lounge
 sofa, pending ones queue at the door, and the viewer's own wear stripes.
 Geometry and sprites follow the BAI Pixel Office pack (assets/pixel-office).
 */
import BAIFlex from './BAIFlex';
import './BAISessionCrowdScene.css';
import {
  type BAICrowdFigure,
  type BAIResourceTier,
  type BAISessionSceneBaseProps,
  clamp01,
  resourceTierFor,
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

export {
  crowdFigureMoods,
  type BAICrowdFigure,
  type BAICrowdFigureMood,
  type BAICrowdFinder,
  type BAICrowdZone,
} from './SessionSceneParts';

export interface BAISessionCrowdSceneProps extends BAISessionSceneBaseProps {
  /** Integer pixel-art scale. Never fractional: the sprites would blur. */
  pixelScale?: 1 | 2;
}

type SizedTier = Exclude<BAIResourceTier, 'unknown'>;

// Pack geometry, in 1× source pixels (assets/pixel-office manifest).
const FOOTPRINT: Record<SizedTier, [number, number]> = {
  small: [64, 48],
  medium: [96, 64],
  large: [128, 80],
};
const FURNITURE_W: Record<SizedTier, number> = {
  small: 48,
  medium: 80,
  large: 112,
};
const DESK_H = 32;
const SOFA_H = 40;
const CHAR_FOOT = [32, 84];
const OVERHEAD_SOCKET = [32, 12];
const STATUS_SOCKET = [51, 23];
const SLOT_H = 124;
const QUEUE_SLOT = { w: 40, h: 108 };

type Point = { left: number; top: number };

const Sprite: React.FC<{
  frame: string;
  at: Point;
  s: number;
  className?: string;
}> = ({ frame, at, s, className }) => (
  <span
    className={classNames('px-sprite', `px-${frame}`, className)}
    style={{ left: at.left * s, top: at.top * s }}
    aria-hidden="true"
  />
);

/** Frame-stepped FX (smoke 3 frames, Z 2 frames), anchored bottom-centre. */
const Fx: React.FC<{ kind: 'smoke' | 'idle'; at: Point; s: number }> = ({
  kind,
  at,
  s,
}) => {
  const frames = kind === 'smoke' ? 3 : 2;
  return (
    <>
      {_.range(frames).map((i) => (
        <Sprite
          key={i}
          frame={`fx-${kind}-${i}`}
          at={{ left: at.left - 16, top: at.top - 32 }}
          s={s}
          className={`px-fx px-fx-${frames}f px-fx-f${i}`}
        />
      ))}
    </>
  );
};

/** Ownership is not a state: the viewer's own keep the striped sprite. */
const characterFrame = (figure: BAICrowdFigure, seated: boolean) => {
  if (figure.isHero) return seated ? 'character-seated-mine' : 'character-mine';
  if (seated) return 'character-seated';
  switch (figure.mood) {
    case 'overheated':
      return 'character-hot';
    case 'waiting':
      return 'character-pending';
    case 'leaving':
      return 'character-terminating';
    default:
      return 'character-base';
  }
};

/** One reserved floor slot, drawn in the pack's layer order. */
const OfficeSlot: React.FC<{ figure: BAICrowdFigure; s: number }> = ({
  figure,
  s,
}) => {
  'use memo';
  const tier = resourceTierFor(figure.resourceShare);
  const sized: SizedTier = tier === 'unknown' ? 'small' : tier;
  const [fpW, fpH] = FOOTPRINT[sized];
  const furnW = FURNITURE_W[sized];
  const cx = fpW / 2;
  const baseY = SLOT_H - 2 - Math.round(fpH / 8);
  const rugH = fpH / 2;
  const seated = figure.mood === 'idle';
  const leaving = figure.mood === 'leaving';
  const hero = !!figure.isHero;

  // At a desk the feet hide behind it; seated and leaving figures stand in front.
  const foot = {
    x: leaving ? cx + 14 : cx,
    y: seated || leaving ? baseY + 2 : baseY - 2,
  };
  const char: Point = {
    left: foot.x - CHAR_FOOT[0],
    top: foot.y - CHAR_FOOT[1],
  };
  const overhead: Point = {
    left: char.left + OVERHEAD_SOCKET[0],
    top: char.top + OVERHEAD_SOCKET[1],
  };
  const status: Point = {
    left: char.left + STATUS_SOCKET[0] - 8,
    top: char.top + STATUS_SOCKET[1] - 8,
  };
  const furniture = (
    <Sprite
      frame={seated ? `sofa-${sized}` : `desk-${sized}`}
      at={{ left: cx - furnW / 2, top: baseY - (seated ? SOFA_H : DESK_H) }}
      s={s}
      className={leaving ? 'px-vacating' : undefined}
    />
  );
  const character = (
    <Sprite
      frame={characterFrame(figure, seated)}
      at={char}
      s={s}
      className={classNames('px-character', { 'px-walker': leaving })}
    />
  );

  return (
    <span
      className={classNames('px-slot-art', `tier-${tier}`)}
      style={{ width: fpW * s, height: SLOT_H * s }}
    >
      <span
        className="px-rug"
        style={{
          top: (SLOT_H - 2 - rugH) * s,
          width: fpW * s,
          height: rugH * s,
        }}
        aria-hidden="true"
      />
      {seated || leaving ? (
        <>
          {furniture}
          {character}
        </>
      ) : (
        <>
          {character}
          {furniture}
          <Sprite
            frame="prop-screen"
            at={{ left: cx + 2, top: baseY - DESK_H + 7 - 24 }}
            s={s}
          />
        </>
      )}
      {figure.mood === 'overheated' && hero && (
        <>
          <Fx kind="smoke" at={overhead} s={s} />
          <Sprite frame="ui-hot" at={status} s={s} />
        </>
      )}
      {seated && <Fx kind="idle" at={overhead} s={s} />}
      {leaving && hero && <Sprite frame="ui-terminating" at={status} s={s} />}
      {tier === 'unknown' && (
        <span
          className="px-unknown"
          style={{ top: (SLOT_H - 2 - rugH) * s - 8 }}
          aria-hidden="true"
        >
          ?
        </span>
      )}
    </span>
  );
};

const QueueSlot: React.FC<{
  figure: BAICrowdFigure;
  position: number;
  s: number;
}> = ({ figure, position, s }) => {
  'use memo';
  const char: Point = {
    left: QUEUE_SLOT.w / 2 - CHAR_FOOT[0],
    top: QUEUE_SLOT.h - 4 - CHAR_FOOT[1],
  };
  // The ticket's 12×8 text slot sits at (6, 6) inside its 24×20 frame.
  const ticket: Point = {
    left: char.left + OVERHEAD_SOCKET[0] - 12,
    top: char.top + OVERHEAD_SOCKET[1] - 14,
  };
  return (
    <span
      className="px-slot-art"
      style={{ width: QUEUE_SLOT.w * s, height: QUEUE_SLOT.h * s }}
    >
      <Sprite
        frame={characterFrame(figure, false)}
        at={char}
        s={s}
        className="px-character"
      />
      <Sprite frame="fx-ticket" at={ticket} s={s} />
      <span
        className="px-ticket-no"
        style={{
          left: (ticket.left + 6) * s,
          top: (ticket.top + 6) * s,
          width: 12 * s,
          height: 8 * s,
        }}
      >
        {position}
      </span>
    </span>
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
  pixelScale = 1,
  className,
  style,
  ...divProps
}) => {
  'use memo';
  const labels = useSceneLabels();
  const s = pixelScale;
  const { finderKey, setFinderKey, matches } = useSceneFinder({
    figures,
    finders,
    activeFinderKey,
    onActiveFinderChange,
  });
  const figuresByZone = _.groupBy(figures, (f) => f.zoneKey);

  const renderSlot = (figure: BAICrowdFigure, art: React.ReactNode) => {
    const isFound = matches?.has(figure.key) ?? false;
    return (
      <Tooltip
        key={figure.key}
        content={<SceneFigureCard figure={figure} />}
        placement="above"
      >
        <button
          type="button"
          className={classNames('px-slot', `mood-${figure.mood}`, {
            'is-hero': figure.isHero,
            'is-found': isFound,
            'is-dimmed': matches && !isFound,
          })}
          style={
            {
              '--px-util': clamp01(figure.utilization),
            } as React.CSSProperties
          }
          aria-label={[
            figure.name,
            figure.isHero ? labels.hero : undefined,
            labels.mood(figure.mood),
            labels.resourceShare(figure.resourceShare),
          ]
            .filter(Boolean)
            .join(' — ')}
          onClick={() => onFigureClick?.(figure)}
        >
          {art}
        </button>
      </Tooltip>
    );
  };

  return (
    <div
      {...divProps}
      className={classNames('bai-crowd-scene', className, {
        'is-searching': !!matches,
      })}
      style={{ ...style, '--px-s': s } as React.CSSProperties}
    >
      <SceneFinderBar
        figures={figures}
        finders={finders}
        finderKey={finderKey}
        matches={matches}
        onChange={setFinderKey}
      />

      <div className="px-rooms">
        {zones.map((zone) => {
          const zoneFigures = figuresByZone[zone.key] ?? [];
          const foundHere = matches
            ? zoneFigures.filter((f) => matches.has(f.key)).length
            : 0;
          const work = zoneFigures.filter(
            (f) =>
              f.mood === 'working' ||
              f.mood === 'overheated' ||
              f.mood === 'leaving',
          );
          const lounge = zoneFigures.filter((f) => f.mood === 'idle');
          const queue = _.sortBy(
            zoneFigures.filter((f) => f.mood === 'waiting'),
            (f) => f.queuePosition ?? Number.MAX_SAFE_INTEGER,
          );
          return (
            <section
              key={zone.key}
              className={classNames('px-room', {
                'has-found': foundHere > 0,
                'is-empty-of-found': matches && foundHere === 0,
              })}
              aria-label={zone.label}
            >
              <div className="px-wall">
                <span
                  className="px-sprite px-prop-plant px-wall-plant"
                  aria-hidden="true"
                />
                <span className="px-sign">
                  <Text type="label" color="inherit">
                    {zone.label}
                  </Text>
                </span>
                <span className="px-sign px-sign-count">
                  <Text type="supporting" color="inherit">
                    {matches && foundHere > 0
                      ? `${foundHere} / ${zoneFigures.length}`
                      : zoneFigures.length}
                  </Text>
                </span>
                <span className="px-racks" aria-hidden="true">
                  <span className="px-sprite px-prop-server-rack" />
                  <span className="px-sprite px-prop-server-rack" />
                </span>
              </div>
              <div className="px-floor">
                {work.length > 0 && (
                  <div className="px-area px-area-work">
                    {work.map((f) =>
                      renderSlot(f, <OfficeSlot figure={f} s={s} />),
                    )}
                  </div>
                )}
                {lounge.length > 0 && (
                  <div className="px-area px-area-lounge">
                    {lounge.map((f) =>
                      renderSlot(f, <OfficeSlot figure={f} s={s} />),
                    )}
                  </div>
                )}
              </div>
              {queue.length > 0 && (
                <div className="px-queue">
                  <span
                    className="px-sprite px-ui-pending px-queue-icon"
                    aria-hidden="true"
                  />
                  {queue.map((f, i) =>
                    renderSlot(
                      f,
                      <QueueSlot
                        figure={f}
                        position={f.queuePosition ?? i + 1}
                        s={s}
                      />,
                    ),
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {!hideLegend && (
        <BAIFlex
          className="px-legend"
          gap="lg"
          wrap="wrap"
          align="end"
          style={{ '--px-s': 1 } as React.CSSProperties}
        >
          <BAIFlex gap="sm" wrap="wrap" align="center">
            {(
              [
                ['ui-cpu', labels.mood('working')],
                ['ui-hot', labels.mood('overheated')],
                ['ui-idle', labels.mood('idle')],
                ['ui-pending', labels.mood('waiting')],
                ['ui-terminating', labels.mood('leaving')],
                ['ui-mine', labels.hero],
              ] as const
            ).map(([icon, label]) => (
              <BAIFlex key={icon} gap="xxs" align="center">
                <span
                  className={`px-sprite px-inline px-${icon}`}
                  aria-hidden="true"
                />
                <Text type="supporting" color="inherit">
                  {label}
                </Text>
              </BAIFlex>
            ))}
          </BAIFlex>
          <BAIFlex gap="sm" wrap="wrap" align="end">
            <Text type="supporting" color="inherit">
              {labels.resourceShareTitle}
            </Text>
            {(
              [
                ['small', '< 34%'],
                ['medium', '34–67%'],
                ['large', '≥ 67%'],
              ] as const
            ).map(([tier, range]) => (
              <BAIFlex key={tier} direction="column" align="center" gap="xxs">
                <span
                  className={`px-sprite px-inline px-desk-${tier}`}
                  aria-hidden="true"
                />
                <Text type="supporting" color="inherit">
                  {range}
                </Text>
              </BAIFlex>
            ))}
          </BAIFlex>
        </BAIFlex>
      )}
    </div>
  );
};

export default BAISessionCrowdScene;
