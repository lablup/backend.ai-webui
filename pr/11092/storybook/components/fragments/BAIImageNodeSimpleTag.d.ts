import { BAIImageNodeSimpleTagFragment$key } from '../../__generated__/BAIImageNodeSimpleTagFragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIImageNodeSimpleTagProps {
    /** v1 `ImageNode` fragment. */
    imageFrgmt: BAIImageNodeSimpleTagFragment$key | null;
    withoutTag?: boolean;
    copyable?: boolean;
}
/**
 * One-line identity of a v1 `ImageNode` (ADR 0005), drawn by the shared
 * `ImageNodeSimpleTag` row. `BAIImageNodeSimpleTagV2` reads the v2 schema
 * into the same row.
 */
declare const BAIImageNodeSimpleTag: React.FC<BAIImageNodeSimpleTagProps>;
export default BAIImageNodeSimpleTag;
