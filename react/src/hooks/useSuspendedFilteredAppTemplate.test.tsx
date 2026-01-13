import { renderHook } from '@testing-library/react';
import { useSuspendedFilteredAppTemplate } from './useSuspendedFilteredAppTemplate';

// Mock the dependencies
jest.mock('.', () => ({
  useSuspendedBackendaiClient: () => ({
    _config: {
      allowNonAuthTCP: false,
    },
  }),
}));

jest.mock('./reactQueryAlias', () => ({
  useSuspenseTanQuery: jest.fn((options) => {
    // Return mock app template data
    return {
      data: {
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
    };
  }),
}));

describe('useSuspendedFilteredAppTemplate Hook', () => {
  beforeEach(() => {
    // @ts-ignore
    globalThis.isElectron = false;
  });

  it('should return correct icon for preopen apps based on app name', () => {
    const servicePorts = [
      {
        container_ports: [8888],
        host_ports: [],
        is_inference: false,
        name: 'jupyter',
        protocol: 'preopen',
      },
    ];

    const { result } = renderHook(() =>
      useSuspendedFilteredAppTemplate(servicePorts),
    );

    expect(result.current.preOpenAppTemplate).toHaveLength(1);
    expect(result.current.preOpenAppTemplate[0].name).toBe('jupyter');
    expect(result.current.preOpenAppTemplate[0].src).toBe(
      './resources/icons/jupyter.png',
    );
  });

  it('should use default icon for preopen apps not in template', () => {
    const servicePorts = [
      {
        container_ports: [9999],
        host_ports: [],
        is_inference: false,
        name: 'custom-app',
        protocol: 'preopen',
      },
    ];

    const { result } = renderHook(() =>
      useSuspendedFilteredAppTemplate(servicePorts),
    );

    expect(result.current.preOpenAppTemplate).toHaveLength(1);
    expect(result.current.preOpenAppTemplate[0].name).toBe('custom-app');
    expect(result.current.preOpenAppTemplate[0].src).toBe(
      '/resources/icons/default_app.svg',
    );
  });

  it('should return correct icon for inference apps based on app name', () => {
    const servicePorts = [
      {
        container_ports: [6006],
        host_ports: [],
        is_inference: true,
        name: 'tensorboard',
        protocol: 'http',
      },
    ];

    const { result } = renderHook(() =>
      useSuspendedFilteredAppTemplate(servicePorts),
    );

    expect(result.current.inferenceAppTemplate).toHaveLength(1);
    expect(result.current.inferenceAppTemplate[0].name).toBe('tensorboard');
    expect(result.current.inferenceAppTemplate[0].src).toBe(
      './resources/icons/tensorflow.png',
    );
  });

  it('should use default icon for inference apps not in template', () => {
    const servicePorts = [
      {
        container_ports: [8080],
        host_ports: [],
        is_inference: true,
        name: 'custom-inference',
        protocol: 'http',
      },
    ];

    const { result } = renderHook(() =>
      useSuspendedFilteredAppTemplate(servicePorts),
    );

    expect(result.current.inferenceAppTemplate).toHaveLength(1);
    expect(result.current.inferenceAppTemplate[0].name).toBe(
      'custom-inference',
    );
    expect(result.current.inferenceAppTemplate[0].src).toBe(
      '/resources/icons/default_app.svg',
    );
  });

  it('should handle multiple preopen and inference apps', () => {
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

    const { result } = renderHook(() =>
      useSuspendedFilteredAppTemplate(servicePorts),
    );

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
