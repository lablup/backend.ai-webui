import { AppShimMessageConfig } from './bridge';
import { message, MessageApi } from './message';
import { modal, ModalApi } from './modal';
import { LayerToastConfig } from '@astryxdesign/core/Layer';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export { message, modal };
export type { MessageApi, ModalApi, AppShimMessageConfig };
export type { JointContent, MessageArgsProps, MessageKind, MessageType, } from './message';
export type { ModalKind, ModalShimFuncProps, ModalShimReturn } from './modal';
export interface AppShimApi {
    message: MessageApi;
    modal: ModalApi;
}
/** Drop-in for antd's `App.useApp()`. */
export declare function useApp(): AppShimApi;
/** `import { App } from '../app-shim'` — same call shape as antd's. */
export declare const App: {
    useApp: typeof useApp;
};
export interface BAIAppProviderProps {
    children?: ReactNode;
    /** antd `AppProps['message']`-shaped global message config. */
    message?: AppShimMessageConfig;
    /** Astryx toast viewport config (position, maxVisible, inset). */
    toast?: LayerToastConfig;
}
/**
 * Mount once, at the app root, inside any theme provider. Owns Astryx's
 * `LayerProvider`, the toast bridge, and the imperative-modal host.
 */
export declare const BAIAppProvider: React.FC<BAIAppProviderProps>;
