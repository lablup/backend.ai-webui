import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import { BAIImageTagFact } from './ImageNodeSimpleTag';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export type { BAIImageTagFact };
type TagAlias = (tag: string) => string;
/** A tag as the v1 `ImageNode` and v2 `ImageV2` schemas expose it. */
type RawTag = {
    key?: string | null;
    value?: string | null;
} | null | undefined;
/** Display facts for an image node's own `tags`, read with its `labels`. */
export declare const imageNodeTagFacts: (tags: ReadonlyArray<RawTag> | null | undefined, labels: ReadonlyArray<RawTag> | null | undefined, tagAlias: TagAlias) => Array<BAIImageTagFact>;
export interface BAIImageNodeSimpleTagV2Props {
    /** v2 `ImageV2` fragment. */
    imageFrgmt: BAIImageNodeSimpleTagV2Fragment$key | null;
    withoutTag?: boolean;
    copyable?: boolean;
}
declare const BAIImageNodeSimpleTagV2: React.FC<BAIImageNodeSimpleTagV2Props>;
export default BAIImageNodeSimpleTagV2;
