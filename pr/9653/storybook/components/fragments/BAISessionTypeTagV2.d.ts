import { BAISessionTypeTagV2Fragment$key } from '../../__generated__/BAISessionTypeTagV2Fragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAISessionTypeTagV2Props {
    /** v2 `SessionV2MetadataInfo` fragment. */
    metadataFrgmt: BAISessionTypeTagV2Fragment$key | null;
}
/**
 * v2 counterpart of `BAISessionTypeTag`. Consumes the `SessionV2MetadataInfo`
 * fragment directly instead of receiving the session type via a prop.
 */
declare const BAISessionTypeTagV2: React.FC<BAISessionTypeTagV2Props>;
export default BAISessionTypeTagV2;
