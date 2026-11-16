import { ShowToastFn } from '@astryxdesign/core/Toast';
export interface BridgeImpl {
    showToast: ShowToastFn;
}
export declare function registerBridge(next: BridgeImpl | null): void;
export declare function withBridge(fn: (b: BridgeImpl) => void): void;
/**
 * antd `AppProps['message']`-shaped global config, set by `<BAIAppProvider>`
 * (mirrors how antd's `<App message={{ duration }}>` seeds its message leg).
 */
export interface AppShimMessageConfig {
    /** Default auto-dismiss duration in SECONDS (antd semantics). */
    duration?: number;
}
export declare function setMessageConfig(next: AppShimMessageConfig | undefined): void;
export declare function getDefaultMessageDurationS(): number;
