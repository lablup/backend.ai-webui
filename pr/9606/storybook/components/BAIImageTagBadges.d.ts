import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * One rule for "how does a parsed image tag display" — every surface that
 * shows image tags reads these facts (ADR 0004).
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
/** Facts from `getTags`-parsed tags (servers without extended image info). */
export declare const imageTagFacts: (tags: ReadonlyArray<RawTag> | null | undefined, tagAlias: TagAlias) => Array<BAIImageTagFact>;
/** Facts from an image node's own `tags` (extended image info). */
export declare const imageNodeTagFacts: (tags: ReadonlyArray<RawTag> | null | undefined, labels: ReadonlyArray<RawTag> | null | undefined, tagAlias: TagAlias) => Array<BAIImageTagFact>;
export interface BAIImageTagBadgesProps {
    facts: Array<BAIImageTagFact>;
    highlightKeyword?: string;
}
/** The badge row every image meta surface renders from {@link BAIImageTagFact}s. */
declare const BAIImageTagBadges: React.FC<BAIImageTagBadgesProps>;
export default BAIImageTagBadges;
