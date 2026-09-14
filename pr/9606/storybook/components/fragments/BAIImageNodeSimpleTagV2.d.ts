import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * One rule for "how does a parsed image tag display" — every surface that
 * shows image tags reads these facts.
 */
export interface BAIImageTagFact {
    key: string;
    value?: string;
    isCustomized: boolean;
    aliasedTag: string;
    isDouble: boolean;
    keyAlias?: string;
}
type TagAlias = (tag: string) => string;
/** A tag as the v1 `ImageNode` and v2 `ImageV2` schemas expose it. */
type RawTag = {
    key?: string | null;
    value?: string | null;
} | null | undefined;
/** Display facts for an image node's own `tags`, read with its `labels`. */
export declare const imageNodeTagFacts: (tags: ReadonlyArray<RawTag> | null | undefined, labels: ReadonlyArray<RawTag> | null | undefined, tagAlias: TagAlias) => Array<BAIImageTagFact>;
export type BAIImageNodeSimpleTagV2Variant = 'full' | 'compact' | 'path' | 'version' | 'tags';
export interface BAIImageNodeSimpleTagV2Props extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
    /** v2 `ImageV2` fragment. Omit it and pass `fullName` instead. */
    imageFrgmt?: BAIImageNodeSimpleTagV2Fragment$key | null;
    /**
     * `registry/namespace:tag@architecture`, for a caller with no `ImageV2`
     * node. Drives the icon, the copy value and every part not overridden.
     */
    fullName?: string | null;
    /**
     * `full` is the whole row; `compact` drops the tag chips; `path` shows the
     * raw reference as monospace text; `version` drops the icon and the name,
     * for a picker whose rows differ only by version; `tags` is the chips alone.
     */
    variant?: BAIImageNodeSimpleTagV2Variant;
    /** Shorthand for `variant="compact"`, kept for the table call sites. */
    withoutTag?: boolean;
    /** Base image name; empty or absent derives from the reference. */
    name?: string | null;
    /** Base version; empty or absent derives from the reference. */
    version?: string | null;
    /** Architecture; empty or absent derives from the reference. */
    architecture?: string | null;
    /** Tag chips, from {@link imageNodeTagFacts}. Read by `full` only. */
    tags?: Array<BAIImageTagFact>;
    copyable?: boolean;
    /** Tooltip on the copy control; defaults to BUI's generic "Copy". */
    copyLabel?: string;
    highlightKeyword?: string;
}
declare const BAIImageNodeSimpleTagV2: React.FC<BAIImageNodeSimpleTagV2Props>;
export default BAIImageNodeSimpleTagV2;
