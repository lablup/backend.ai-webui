import { BAISelectProps } from '../BAISelect';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIDomainSelectV2Props extends Omit<BAISelectProps, 'options'> {
    activeOnly?: boolean;
}
/**
 * Sibling of `BAIDomainSelect` on `adminDomainsV2`: shows the domain name but
 * its value is the domain uuid (BA-7234, managers >= 26.9.0). Superadmin only.
 */
declare const BAIDomainSelectV2: React.FC<BAIDomainSelectV2Props>;
export default BAIDomainSelectV2;
