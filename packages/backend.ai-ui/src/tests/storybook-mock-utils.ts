import { BAIClient } from '../components/provider/BAIClientProvider';
import type { DeviceMetaData } from '../components/provider/BAIMetaDataProvider';
import { BAILocale } from '../locale';
import enUS from '../locale/en_US';
import koKR from '../locale/ko_KR';

// =============================================================================
// Mock BAIClient
// =============================================================================

/** Simple mock BAIClient for Storybook stories */
export const mockClient = {} as BAIClient;
export const mockClientPromise = Promise.resolve(mockClient);
export const mockAnonymousClientFactory = () => mockClient;

/**
 * Create a mock BAIClient with `utils.elapsedTime` support.
 * Use this for components that call `client.utils.elapsedTime()`.
 */
export const createMockClientWithElapsedTime = () => {
  const client = {
    utils: {
      elapsedTime: (start: string | Date, end: number) => {
        const startTime = new Date(start).getTime();
        const elapsed = end - startTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
      },
    },
  } as unknown as BAIClient;

  return {
    mockClient: client,
    mockClientPromise: Promise.resolve(client),
    mockAnonymousClientFactory: () => client,
  };
};

// =============================================================================
// Locale Setup
// =============================================================================

/**
 * Simple locale setup for Storybook stories.
 *
 * to-astryx final-B: these were hand-assembled from `antd/locale/*`, which made
 * this non-shipping story helper the only `src/tests/` file in the antd import
 * graph. BUI already publishes the assembled bundles (`../locale/en_US`), so
 * the helper now reuses them and holds no antd import of its own — whatever
 * `BAILocale` ends up carrying after the locale bundles are converted, this
 * file follows for free.
 */
export const locales: Record<string, BAILocale> = {
  en: enUS,
  ko: koKR,
};

// =============================================================================
// Mock Device Metadata
// =============================================================================

/** Mock device metadata for BAIMetaDataProvider */
export const mockDeviceMetaData: DeviceMetaData = {
  cpu: {
    slot_name: 'cpu',
    description: 'CPU',
    human_readable_name: 'CPU',
    display_unit: 'Core',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'cpu',
  },
  mem: {
    slot_name: 'mem',
    description: 'Memory',
    human_readable_name: 'Memory',
    display_unit: 'GiB',
    number_format: { binary: true, round_length: 2 },
    display_icon: 'mem',
  },
  'cuda.device': {
    slot_name: 'cuda.device',
    description: 'NVIDIA GPU',
    human_readable_name: 'GPU',
    display_unit: 'GPU',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'nvidia',
  },
  'cuda.shares': {
    slot_name: 'cuda.shares',
    description: 'NVIDIA GPU (fractional)',
    human_readable_name: 'GPU',
    display_unit: 'FGPU',
    number_format: { binary: false, round_length: 1 },
    display_icon: 'nvidia',
  },
};
