import { BAISelectProps } from './BAISelect';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
interface BAIProjectResourceGroupSelectProps extends BAISelectProps {
    projectName: string;
    autoSelectDefault?: boolean;
    filter?: (resourceGroupName: string) => boolean;
    /**
     * List the SFTP-designated resource groups too. They are reserved for
     * SSH/SFTP system sessions, so every other caller leaves this off (FR-3996).
     */
    includeSFTPResourceGroups?: boolean;
}
declare const BAIProjectResourceGroupSelect: React.FC<BAIProjectResourceGroupSelectProps>;
export default BAIProjectResourceGroupSelect;
