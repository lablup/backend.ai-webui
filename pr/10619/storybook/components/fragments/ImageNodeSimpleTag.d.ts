import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
/**
 * One rule for "how does a parsed image tag display" — every surface that
 * shows image tags reads these facts.
 */
export interface BAIImageTagFact {
    key: string;
    value?: string;
    isCustomized: boolean;
    aliasedTag: string;
    isDouble: boolean;
    keyAlias?: string;
}
export interface ImageNodeSimpleTagProps {
    /** Full reference; the icon reads it and the copy control emits it. */
    fullName: string;
    /** Base image name, already aliased. */
    name: string;
    version?: string | null;
    architecture?: string | null;
    facts: ReadonlyArray<BAIImageTagFact>;
    withoutTag?: boolean;
    copyable?: boolean;
}
declare const ImageNodeSimpleTag: React.FC<ImageNodeSimpleTagProps>;
export default ImageNodeSimpleTag;
