import { BAIAdminResourceGroupSelect_resourceGroupsFragment$key } from '../../__generated__/BAIAdminResourceGroupSelect_resourceGroupsFragment.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export interface BAIAdminResourceGroupSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /**
     * P3C-6: this is the ASTRYX fragment key. Ticket 27 typed it as the legacy
     * `BAIAdminResourceGroupSelect_resourceGroupsFragment$key` while the
     * `graphql` tag below declares `BAIAdminResourceGroupSelect_...` — the
     * two happen to be structurally identical, so tsc accepted a consumer that
     * spread the LEGACY fragment into this component, which would then find no
     * data at runtime. Fixed here as part of the flip.
     */
    queryRef: BAIAdminResourceGroupSelect_resourceGroupsFragment$key;
    /** Plain key(s), as the antd `BAIAdminResourceGroupSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
}
declare const BAIAdminResourceGroupSelect: React.FC<BAIAdminResourceGroupSelectProps>;
export default BAIAdminResourceGroupSelect;
