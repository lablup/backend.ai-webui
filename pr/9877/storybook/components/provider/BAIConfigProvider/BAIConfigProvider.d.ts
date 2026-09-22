import { BAILocale } from '../../../locale';
import { BAIClient } from '../BAIClientProvider';
import { ReactNode } from '../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * to-astryx final switch: this used to `extend Omit<ConfigProviderProps,
 * 'locale'>`, which is how the host passed `csp`, `theme`, `modal`, `drawer`
 * and `tag` straight through to the antd `ConfigProvider` this component
 * wrapped. With that provider gone the pass-through has no destination —
 * every one of those props configured antd components that no longer exist,
 * and Astryx's `Theme` / `InternationalizationProvider` take their
 * configuration from `react/src/astryx-theme/` instead. So the interface is
 * now standalone (the one case `component-props-extension.md` does not
 * cover: there is no underlying component left to extend).
 */
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
