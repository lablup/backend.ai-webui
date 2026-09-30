import { BAISessionTypeTokenFragment$key } from '../../__generated__/BAISessionTypeTokenFragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** Takes the upper-cased type; unknown types fall back to the raw value. */
export declare const useSessionTypeLabel: () => (upperType: string) => string;
export interface BAISessionTypeTokenProps {
    sessionFrgmt: BAISessionTypeTokenFragment$key;
}
declare const BAISessionTypeToken: React.FC<BAISessionTypeTokenProps>;
export default BAISessionTypeToken;
