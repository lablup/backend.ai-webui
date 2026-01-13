import { useSuspendedFilteredAppTemplate } from './useSuspendedFilteredAppTemplate';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

// Mock the BackendAI client
jest.mock('.', () => ({
  useSuspendedBackendaiClient: () => ({
    _config: {
      allowNonAuthTCP: false,
    },
  }),
}));

describe('useSuspendedFilteredAppTemplate Hook', () => {
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
    // @ts-ignore
    globalThis.isElectron = false;
    
    // Mock fetch to return app template data
    (global as any).fetch = jest.fn(async (url: string) => {
      if (url.includes('app_template.json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              appTemplate: {
                ttyd: [
                  {
                    name: 'ttyd',
                    title: 'Console',
                    category: '1.Utilities',
                    redirect: '',
                    src: './resources/icons/terminal.svg',
                  },
                ],
                jupyter: [
                  {
                    name: 'jupyter',
                    title: 'Jupyter Notebook',
                    category: '2.Development',
                    redirect: '&redirect=/tree',
                    src: './resources/icons/jupyter.png',
                  },
                ],
                tensorboard: [
                  {
                    name: 'tensorboard',
                    title: 'TensorBoard',
                    category: '3.Machine Learning Tools',
                    redirect: '&redirect=/',
                    src: './resources/icons/tensorflow.png',
                  },
                ],
                vscode: [
                  {
                    name: 'vscode',
                    title: 'Visual Studio Code',
                    category: '2.Development',
                    redirect: '',
                    src: './resources/icons/vscode.svg',
                  },
                ],
              },
            }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('should return correct icon for preopen apps based on app name', async () => {
    const servicePorts = [
      {
        container_ports: [8888],
        host_ports: [],
        is_inference: false,
        name: 'jupyter',
        protocol: 'preopen',
      },
    ];

    const { result } = renderHook(
      () => useSuspendedFilteredAppTemplate(servicePorts),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.preOpenAppTemplate).toHaveLength(1);
      expect(result.current.preOpenAppTemplate[0].name).toBe('jupyter');
      expect(result.current.preOpenAppTemplate[0].src).toBe(
        './resources/icons/jupyter.png',
      );
    });
  });

  it('should use default icon for preopen apps not in template', async () => {
    const servicePorts = [
      {
        container_ports: [9999],
        host_ports: [],
        is_inference: false,
        name: 'custom-app',
        protocol: 'preopen',
      },
    ];

    const { result } = renderHook(
      () => useSuspendedFilteredAppTemplate(servicePorts),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.preOpenAppTemplate).toHaveLength(1);
      expect(result.current.preOpenAppTemplate[0].name).toBe('custom-app');
      expect(result.current.preOpenAppTemplate[0].src).toBe(
        '/resources/icons/default_app.svg',
      );
    });
  });

  it('should return correct icon for inference apps based on app name', async () => {
    const servicePorts = [
      {
        container_ports: [6006],
        host_ports: [],
        is_inference: true,
        name: 'tensorboard',
        protocol: 'http',
      },
    ];

    const { result } = renderHook(
      () => useSuspendedFilteredAppTemplate(servicePorts),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.inferenceAppTemplate).toHaveLength(1);
      expect(result.current.inferenceAppTemplate[0].name).toBe('tensorboard');
      expect(result.current.inferenceAppTemplate[0].src).toBe(
        './resources/icons/tensorflow.png',
      );
    });
  });

  it('should use default icon for inference apps not in template', async () => {
    const servicePorts = [
      {
        container_ports: [8080],
        host_ports: [],
        is_inference: true,
        name: 'custom-inference',
        protocol: 'http',
      },
    ];

    const { result } = renderHook(
      () => useSuspendedFilteredAppTemplate(servicePorts),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.inferenceAppTemplate).toHaveLength(1);
      expect(result.current.inferenceAppTemplate[0].name).toBe(
        'custom-inference',
      );
      expect(result.current.inferenceAppTemplate[0].src).toBe(
        '/resources/icons/default_app.svg',
      );
    });
  });

  it('should handle multiple preopen and inference apps', async () => {
    const servicePorts = [
      {
        container_ports: [8888],
        host_ports: [],
        is_inference: false,
        name: 'jupyter',
        protocol: 'preopen',
      },
      {
        container_ports: [8080],
        host_ports: [],
        is_inference: false,
        name: 'vscode',
        protocol: 'preopen',
      },
      {
        container_ports: [6006],
        host_ports: [],
        is_inference: true,
        name: 'tensorboard',
        protocol: 'http',
      },
      {
        container_ports: [9999],
        host_ports: [],
        is_inference: true,
        name: 'unknown-inference',
        protocol: 'http',
      },
    ];

    const { result } = renderHook(
      () => useSuspendedFilteredAppTemplate(servicePorts),
      { wrapper },
    );

    await waitFor(() => {
      // Check preopen apps
      expect(result.current.preOpenAppTemplate).toHaveLength(2);
      expect(result.current.preOpenAppTemplate[0].name).toBe('jupyter');
      expect(result.current.preOpenAppTemplate[0].src).toBe(
        './resources/icons/jupyter.png',
      );
      expect(result.current.preOpenAppTemplate[1].name).toBe('vscode');
      expect(result.current.preOpenAppTemplate[1].src).toBe(
        './resources/icons/vscode.svg',
      );

      // Check inference apps
      expect(result.current.inferenceAppTemplate).toHaveLength(2);
      expect(result.current.inferenceAppTemplate[0].name).toBe('tensorboard');
      expect(result.current.inferenceAppTemplate[0].src).toBe(
        './resources/icons/tensorflow.png',
      );
      expect(result.current.inferenceAppTemplate[1].name).toBe(
        'unknown-inference',
      );
      expect(result.current.inferenceAppTemplate[1].src).toBe(
        '/resources/icons/default_app.svg',
      );
    });
  });
});
