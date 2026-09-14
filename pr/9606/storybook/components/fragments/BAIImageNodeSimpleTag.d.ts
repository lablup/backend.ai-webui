import { BAIImageNodeSimpleTagFragment$key } from '../../__generated__/BAIImageNodeSimpleTagFragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIImageNodeSimpleTagProps {
    /** v1 `ImageNode` fragment. */
    imageFrgmt: BAIImageNodeSimpleTagFragment$key | null;
    withoutTag?: boolean;
    copyable?: boolean;
}
/**
 * One-line identity of a v1 `ImageNode`: the meta icon, the aliased base name,
 * the base version and the architecture, followed by the tag chips and a copy
 * control for the full reference (ADR 0004). `BAIImageNodeSimpleTagV2` draws
 * the same row from the v2 schema.
 */
declare const BAIImageNodeSimpleTag: React.FC<BAIImageNodeSimpleTagProps>;
export default BAIImageNodeSimpleTag;
