import { BAIImageNodeSimpleTagV2Fragment$key } from '../../__generated__/BAIImageNodeSimpleTagV2Fragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIImageNodeSimpleTagV2Props {
    /** v2 `ImageV2` fragment. */
    imageFrgmt: BAIImageNodeSimpleTagV2Fragment$key | null;
    withoutTag?: boolean;
    copyable?: boolean;
}
/**
 * v2 counterpart of the React app's `ImageNodeSimpleTag`. Renders the image
 * icon, base name, version and architecture in the same format as the v1
 * session list, resolving icons and tag aliases from the image metadata
 * provided via `BAIMetaDataProvider`.
 */
declare const BAIImageNodeSimpleTagV2: React.FC<BAIImageNodeSimpleTagV2Props>;
export default BAIImageNodeSimpleTagV2;
