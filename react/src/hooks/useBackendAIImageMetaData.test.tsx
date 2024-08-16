/* eslint-disable testing-library/render-result-naming-convention */
import { useBackendAIImageMetaData } from '.';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

describe('useBackendAIImageMetaData', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

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
            ngc: 'Nvidia GPU Cloud',
            py310: 'Python3',
          },
          tagReplace: {},
        }),
    }),
  );

  const { result } = renderHook(() => useBackendAIImageMetaData(), { wrapper });
  it('get image lang data', async () => {
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const [, { getLang }] = result.current;
    const lang = getLang('testing/ngc-pytorch');
    expect(lang).toBe('PyTorch');
  });

  it('get image r lang data', async () => {
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const [, { getLang }] = result.current;
    const lang = getLang('stable/r-base');
    expect(lang).toBe('R');
  });

  it('get baseImage data', async () => {
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const [, { getBaseImages }] = result.current;
    const baseImages = getBaseImages('21.11-py3', 'testing/ngc-pytorc');
    expect(baseImages[0]).toBe('Python3');
    expect(baseImages[1]).toBe('Nvidia GPU Cloud');
  });
  it('get constraint data', async () => {
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const [, { getConstraints }] = result.current;
    const baseImages = getConstraints('23.08-tf2.13-py310-cuda12.2', []);
    expect(baseImages[0]).toBe('Python3');
    expect(baseImages[1]).toBe(undefined);
  });

  it('get constraint customized data', async () => {
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    const [, { getConstraints }] = result.current;
    const baseImages = getConstraints(
      '3.9-ubuntu20.04-customized_2353abd67b0641ea9348c68b725810b3',
      [{ key: 'ai.backend.customized-image.name', value: 'test12' }],
    );
    expect(baseImages[0]).toBe('');
    expect(baseImages[1]).toBe('test12');
  });
});
