/* eslint-disable testing-library/render-result-naming-convention */
import { useBackendAIImageMetaData } from '.';
import { getImageFullName } from '../helper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

describe('useBackendAIImageMetaData', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    (global as any).fetch = jest.fn(async () =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            imageInfo: {},
            tagAlias: {
              pytorch: 'PyTorch',
              r: 'R',
              'r-base': 'R',
              py3: 'Python3',
              ngc: 'NVIDIA GPU Cloud',
              py310: 'Python3',
            },
            tagReplace: {},
          }),
      }),
    );
  });

  it('get image lang data', async () => {
    const { result } = renderHook(() => useBackendAIImageMetaData(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBeTruthy());
    const [, { getLang }] = result.current;
    const lang = getLang('testing/ngc-pytorch');
    expect(lang).toBe('PyTorch');
  });

  it('get image r lang data', async () => {
    const { result } = renderHook(() => useBackendAIImageMetaData(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBeTruthy());

    const [, { getLang }] = result.current;
    const lang = getLang('stable/r-base');
    expect(lang).toBe('R');
  });

  it('get baseImage data', async () => {
    const { result } = renderHook(() => useBackendAIImageMetaData(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBeTruthy());

    const [, { getBaseImages }] = result.current;
    const baseImages = getBaseImages('21.11-py3', 'testing/ngc-pytorc');
    expect(baseImages[0]).toBe('Python3');
    expect(baseImages[1]).toBe('NVIDIA GPU Cloud');
  });
  it('get constraint data', async () => {
    const { result } = renderHook(() => useBackendAIImageMetaData(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBeTruthy());

    const [, { getConstraints }] = result.current;
    const baseImages = getConstraints('23.08-tf2.13-py310-cuda12.2', []);
    expect(baseImages[0]).toBe('Python3');
    expect(baseImages[1]).toBe(undefined);
  });

  it('get constraint customized data', async () => {
    const { result } = renderHook(() => useBackendAIImageMetaData(), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toBeTruthy());

    const [, { getConstraints }] = result.current;
    const baseImages = getConstraints(
      '3.9-ubuntu20.04-customized_2353abd67b0641ea9348c68b725810b3',
      [{ key: 'ai.backend.customized-image.name', value: 'test12' }],
    );
    expect(baseImages[0]).toBe('');
    expect(baseImages[1]).toBe('test12');
  });

  it('`getImageMeta` function can handle images with more than two `/` in name.', async () => {
    const { result } = renderHook(() => useBackendAIImageMetaData(), {
      wrapper,
    });
    const [, { getImageMeta }] = result.current;

    const { key, tags } = getImageMeta(
      getImageFullName({
        namespace: 'abc/def/training',
        name: undefined,
        humanized_name: 'abc/def/training',
        tag: '01-py3-abc-v1',
        registry: '192.168.0.1:7080',
        architecture: 'x86_64',
        digest: 'sha256:123456',
        id: 'sample id',
        installed: true,
        resource_limits: [
          {
            key: 'cpu',
            min: '1',
            max: null,
          },
          {
            key: 'mem',
            min: '1g',
            max: null,
          },
          {
            key: 'cuda.device',
            min: '0',
            max: null,
          },
          {
            key: 'cuda.shares',
            min: '0',
            max: null,
          },
        ],
        labels: [
          {
            key: 'maintainer',
            value: 'NVIDIA CORPORATION <cudatools@nvidia.com>',
          },
        ],
        base_image_name: undefined,
        tags: undefined,
        version: undefined,
        supported_accelerators: [],
      }) || '',
    );
    expect(key).toBe('training');
    expect(tags).toStrictEqual(['01', 'py3', 'abc', 'v1']);
  });
});
