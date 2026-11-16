import { BAISessionTypeTokenV2Fragment$key } from '../../__generated__/BAISessionTypeTokenV2Fragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAISessionTypeTokenV2Props {
    /** v2 `SessionV2MetadataInfo` fragment. */
    metadataFrgmt: BAISessionTypeTokenV2Fragment$key | null;
}
/**
 * v2 counterpart of `BAISessionTypeToken`. Consumes the `SessionV2MetadataInfo`
 * fragment directly instead of receiving the session type via a prop.
 */
declare const BAISessionTypeTokenV2: React.FC<BAISessionTypeTokenV2Props>;
export default BAISessionTypeTokenV2;
