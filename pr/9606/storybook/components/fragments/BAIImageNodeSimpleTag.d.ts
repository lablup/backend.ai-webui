import { BAIImageNodeSimpleTagFragment$key } from '../../__generated__/BAIImageNodeSimpleTagFragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIImageNodeSimpleTagProps {
    /** v1 `ImageNode` fragment. */
    imageFrgmt: BAIImageNodeSimpleTagFragment$key | null;
    withoutTag?: boolean;
    copyable?: boolean;
}
/**
 * `ImageNode` adapter over {@link BAIImageNodeSimpleTagV2}: it reads the v1
 * fragment and hands that component its plain facts, so both schemas render
 * the identical row (ADR 0004).
 */
declare const BAIImageNodeSimpleTag: React.FC<BAIImageNodeSimpleTagProps>;
export default BAIImageNodeSimpleTag;
