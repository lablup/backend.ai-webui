import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIImageNodeSimpleTagV2Props {
    /** v2 `ImageV2` fragment. */
    imageFrgmt: BAIImageNodeSimpleTagV2Fragment$key | null;
    withoutTag?: boolean;
    copyable?: boolean;
}
/**
 * `ImageV2` adapter over {@link BAIImageMetaRow}: it reads the fragment and
 * hands the row its plain facts. The v1 counterpart is the React app's
 * `ImageNodeSimpleTag`, and both render the identical row (ADR 0004).
 */
declare const BAIImageNodeSimpleTagV2: React.FC<BAIImageNodeSimpleTagV2Props>;
export default BAIImageNodeSimpleTagV2;
