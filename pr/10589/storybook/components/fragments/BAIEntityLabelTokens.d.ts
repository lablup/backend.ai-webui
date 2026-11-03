import { BAIEntityLabelTokensFragment$key } from '../../__generated__/BAIEntityLabelTokensFragment.graphql';
import { FilterProperty } from '../BAIGraphQLPropertyFilter';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIEntityLabel {
    key: string;
    value: string;
}
export interface BAIEntityLabelTokensProps {
    entityLabelsFrgmt: BAIEntityLabelTokensFragment$key | null | undefined;
    /** When provided, tokens render as buttons that report the clicked label. */
    onLabelClick?: (label: BAIEntityLabel) => void;
    /** Keeps a token click from also firing the surrounding row's click. */
    stopRowClick?: boolean;
    /** Rendered when the entity has no labels. */
    fallback?: React.ReactNode;
}
export declare const formatEntityLabel: (label: BAIEntityLabel) => string;
/** The entity-filter fragment that selects entities carrying this label (iEquals: the string operator BAIGraphQLPropertyFilter accepts). */
export declare const toEntityLabelFilter: (label: BAIEntityLabel) => {
    labels: {
        some: {
            key: {
                iEquals: string;
            };
            value: {
                iEquals: string;
            };
        };
    };
};
/** The filter-bar properties that show and edit a `toEntityLabelFilter` condition as key and value chips. */
export declare const entityLabelFilterProperties: (propertyLabels: {
    key: string;
    value: string;
}) => Array<FilterProperty>;
declare const BAIEntityLabelTokens: React.FC<BAIEntityLabelTokensProps>;
export default BAIEntityLabelTokens;
