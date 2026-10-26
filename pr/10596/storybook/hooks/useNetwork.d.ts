/**
 * Reports the browser's online/offline status and, where the Network
 * Information API exists, the current connection profile.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useNetwork`.
 */
export interface NetworkState {
    since?: Date;
    online?: boolean;
    rtt?: number;
    type?: string;
    downlink?: number;
    saveData?: boolean;
    downlinkMax?: number;
    effectiveType?: string;
}
declare function useNetwork(): NetworkState;
export default useNetwork;
