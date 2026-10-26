import { BAIClient } from '../components/provider/BAIClientProvider';
import { DeviceMetaData } from '../components/provider/BAIMetaDataProvider';
import { BAILocale } from '../locale';
/** Simple mock BAIClient for Storybook stories */
export declare const mockClient: BAIClient;
export declare const mockClientPromise: Promise<BAIClient>;
export declare const mockAnonymousClientFactory: () => BAIClient;
/**
 * Create a mock BAIClient with `utils.elapsedTime` support.
 * Use this for components that call `client.utils.elapsedTime()`.
 */
export declare const createMockClientWithElapsedTime: () => {
    mockClient: BAIClient;
    mockClientPromise: Promise<BAIClient>;
    mockAnonymousClientFactory: () => BAIClient;
};
/**
 * Simple locale setup for Storybook stories.
 *
 * to-astryx final-B pointed these at BUI's published `../locale/en_US`
 * bundles instead of hand-assembling them from `antd/locale/*`. The final
 * switch removed those bundles with the antd ConfigProvider layer they fed —
 * `BAILocale` is now just the language code — so the literals below ARE the
 * whole locale.
 */
export declare const locales: Record<string, BAILocale>;
/** Mock device metadata for BAIMetaDataProvider */
export declare const mockDeviceMetaData: DeviceMetaData;
