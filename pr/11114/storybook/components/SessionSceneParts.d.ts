import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export declare const crowdFigureMoods: readonly ["working", "idle", "overheated", "waiting", "leaving"];
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
    /**
     * 0..1 share of its agent's capacity the session holds — the largest of
     * cpu, gpu and memory. Sizes its furniture; `null` means not measured yet.
     */
    resourceShare?: number | null;
    /** 1-based place in its agent's queue, for a `waiting` figure. */
    queuePosition?: number;
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
export interface BAISessionSceneBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
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
export declare const clamp01: (n: number | null | undefined) => number;
export declare const resourceTiers: readonly ["small", "medium", "large"];
export type BAIResourceTier = (typeof resourceTiers)[number] | 'unknown';
/** Bucketed, not proportional: < 34% small, < 67% medium, the rest large. */
export declare const resourceTierFor: (share: number | null | undefined) => BAIResourceTier;
export declare const useSceneLabels: () => {
    mood: (mood: BAICrowdFigureMood) => string;
    hero: string;
    resourceShare: (share: number | null | undefined) => string | undefined;
    resourceShareTitle: string;
};
export declare const useSceneFinder: ({ figures, finders, activeFinderKey, onActiveFinderChange, }: Pick<BAISessionSceneBaseProps, "figures" | "finders" | "activeFinderKey" | "onActiveFinderChange">) => {
    finderKey: string | null;
    setFinderKey: (next: string | null) => void;
    matches: Set<string> | null;
};
export declare const SceneFinderBar: React.FC<{
    className?: string;
    figures: ReadonlyArray<BAICrowdFigure>;
    finders: ReadonlyArray<BAICrowdFinder>;
    finderKey: string | null;
    matches: Set<string> | null;
    onChange: (key: string | null) => void;
}>;
/** Tooltip body; the tooltip surface is dark, so text inherits its colour. */
export declare const SceneFigureCard: React.FC<{
    figure: BAICrowdFigure;
}>;
