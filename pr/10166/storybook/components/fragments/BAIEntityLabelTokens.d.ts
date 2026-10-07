import { BAIEntityLabelTokensFragment$key } from '../../__generated__/BAIEntityLabelTokensFragment.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
/** The entity-filter fragment that selects entities carrying this exact label. */
export declare const toEntityLabelFilter: (label: BAIEntityLabel) => {
    labels: {
        some: {
            key: {
                equals: string;
            };
            value: {
                equals: string;
            };
        };
    };
};
declare const BAIEntityLabelTokens: React.FC<BAIEntityLabelTokensProps>;
export default BAIEntityLabelTokens;
