import { BAIDeploymentTagTokens_metadata$key } from '../../__generated__/BAIDeploymentTagTokens_metadata.graphql';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIDeploymentTagTokensProps {
    metadataFrgmt: BAIDeploymentTagTokens_metadata$key | null | undefined;
    /**
     * Called when a token is activated. When provided, tokens render as
     * interactive buttons; when omitted, they are plain labels.
     */
    onTagClick?: (tag: string) => void;
    /**
     * When true, the click stops bubbling so the surrounding row click handler
     * does not also fire (used inside table row contexts).
     */
    stopRowClick?: boolean;
    /** Rendered when there are no tags to display. */
    fallback?: React.ReactNode;
}
/**
 * Render a deployment metadata's tags as tokens. Tag entries are split on
 * commas so legacy comma-joined values render as individual tokens.
 */
declare const BAIDeploymentTagTokens: React.FC<BAIDeploymentTagTokensProps>;
export default BAIDeploymentTagTokens;
