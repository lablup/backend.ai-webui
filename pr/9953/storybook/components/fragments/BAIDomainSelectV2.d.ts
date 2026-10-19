import { BAISelectProps } from '../BAISelect';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIDomainSelectV2Props extends Omit<BAISelectProps, 'options'> {
    activeOnly?: boolean;
}
/**
 * Sibling of `BAIDomainSelect` on `adminDomainsV2`: shows the domain name but
 * its value is the domain uuid (BA-7234, managers >= 26.9.0). Superadmin only.
 */
declare const BAIDomainSelectV2: React.FC<BAIDomainSelectV2Props>;
export default BAIDomainSelectV2;
