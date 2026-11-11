import { BAILocale } from '../../../locale';
import { BAIClient } from '../BAIClientProvider';
import { ReactNode } from '../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIConfigProviderBaseProps {
    children?: ReactNode;
    locale?: BAILocale;
}
export type BAIConfigProviderProps = BAIConfigProviderBaseProps & ({
    clientPromise: Promise<BAIClient>;
    anonymousClientFactory: (api_endpoint: string) => BAIClient;
} | {
    clientPromise?: never;
    anonymousClientFactory?: never;
});
declare const BAIConfigProvider: ({ children, locale, clientPromise, anonymousClientFactory, }: BAIConfigProviderProps) => import("react").JSX.Element;
export default BAIConfigProvider;
