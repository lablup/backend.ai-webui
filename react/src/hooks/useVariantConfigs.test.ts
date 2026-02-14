import { renderHook } from '@testing-library/react';
import { useRuntimeEnvVarConfigs } from './useVariantConfigs';
import { useTranslation } from 'react-i18next';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

describe('useRuntimeEnvVarConfigs', () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({
      t: mockT,
      i18n: {},
    });
  });

  it('should return configuration for vllm runtime', () => {
    const { result } = renderHook(() => useRuntimeEnvVarConfigs());

    expect(result.current).toHaveProperty('vllm');
    expect(result.current.vllm).toHaveProperty('optionalEnvVars');
    expect(result.current.vllm.optionalEnvVars).toHaveLength(5);
  });

  it('should include BACKEND_MODEL_NAME in vllm configuration', () => {
    const { result } = renderHook(() => useRuntimeEnvVarConfigs());

    const backendModelName = result.current.vllm.optionalEnvVars?.find(
      (env) => env.variable === 'BACKEND_MODEL_NAME',
    );

    expect(backendModelName).toBeDefined();
    expect(backendModelName?.variable).toBe('BACKEND_MODEL_NAME');
    expect(backendModelName?.placeholder).toBe('modelService.VllmModelName');
  });

  it('should include all vllm environment variables', () => {
    const { result } = renderHook(() => useRuntimeEnvVarConfigs());

    const vllmEnvVars = result.current.vllm.optionalEnvVars;
    const expectedVars = [
      'BACKEND_MODEL_NAME',
      'VLLM_QUANTIZATION',
      'VLLM_TP_SIZE',
      'VLLM_PP_SIZE',
      'VLLM_EXTRA_ARGS',
    ];

    expectedVars.forEach((expectedVar) => {
      const envVar = vllmEnvVars?.find((env) => env.variable === expectedVar);
      expect(envVar).toBeDefined();
    });
  });

  it('should return configuration for sglang runtime', () => {
    const { result } = renderHook(() => useRuntimeEnvVarConfigs());

    expect(result.current).toHaveProperty('sglang');
    expect(result.current.sglang).toHaveProperty('optionalEnvVars');
    expect(result.current.sglang.optionalEnvVars).toHaveLength(5);
  });

  it('should include BACKEND_MODEL_NAME in sglang configuration', () => {
    const { result } = renderHook(() => useRuntimeEnvVarConfigs());

    const backendModelName = result.current.sglang.optionalEnvVars?.find(
      (env) => env.variable === 'BACKEND_MODEL_NAME',
    );

    expect(backendModelName).toBeDefined();
    expect(backendModelName?.variable).toBe('BACKEND_MODEL_NAME');
    expect(backendModelName?.placeholder).toBe('modelService.SglangModelName');
  });

  it('should include all sglang environment variables', () => {
    const { result } = renderHook(() => useRuntimeEnvVarConfigs());

    const sglangEnvVars = result.current.sglang.optionalEnvVars;
    const expectedVars = [
      'BACKEND_MODEL_NAME',
      'SGLANG_QUANTIZATION',
      'SGLANG_TP_SIZE',
      'SGLANG_PP_SIZE',
      'SGLANG_EXTRA_ARGS',
    ];

    expectedVars.forEach((expectedVar) => {
      const envVar = sglangEnvVars?.find((env) => env.variable === expectedVar);
      expect(envVar).toBeDefined();
    });
  });

  it('should return configuration for nim runtime', () => {
    const { result } = renderHook(() => useRuntimeEnvVarConfigs());

    expect(result.current).toHaveProperty('nim');
    expect(result.current.nim).toHaveProperty('optionalEnvVars');
    expect(result.current.nim.optionalEnvVars).toHaveLength(1);
  });

  it('should include NGC_API_KEY in nim configuration', () => {
    const { result } = renderHook(() => useRuntimeEnvVarConfigs());

    const ngcApiKey = result.current.nim.optionalEnvVars?.find(
      (env) => env.variable === 'NGC_API_KEY',
    );

    expect(ngcApiKey).toBeDefined();
    expect(ngcApiKey?.variable).toBe('NGC_API_KEY');
    expect(ngcApiKey?.placeholder).toBe('modelService.NimApiKey');
  });

  it('should use translation function for placeholders', () => {
    renderHook(() => useRuntimeEnvVarConfigs());

    // Verify that translation function was called for each placeholder
    expect(mockT).toHaveBeenCalledWith('modelService.VllmModelName');
    expect(mockT).toHaveBeenCalledWith('modelService.VllmQuantization');
    expect(mockT).toHaveBeenCalledWith('modelService.VllmTpSize');
    expect(mockT).toHaveBeenCalledWith('modelService.VllmPpSize');
    expect(mockT).toHaveBeenCalledWith('modelService.VllmExtraArgs');
    expect(mockT).toHaveBeenCalledWith('modelService.SglangModelName');
    expect(mockT).toHaveBeenCalledWith('modelService.SglangQuantization');
    expect(mockT).toHaveBeenCalledWith('modelService.SglangTpSize');
    expect(mockT).toHaveBeenCalledWith('modelService.SglangPpSize');
    expect(mockT).toHaveBeenCalledWith('modelService.SglangExtraArgs');
    expect(mockT).toHaveBeenCalledWith('modelService.NimApiKey');
  });

  it('should return all three runtime configurations', () => {
    const { result } = renderHook(() => useRuntimeEnvVarConfigs());

    const runtimeKeys = Object.keys(result.current);
    expect(runtimeKeys).toContain('vllm');
    expect(runtimeKeys).toContain('sglang');
    expect(runtimeKeys).toContain('nim');
    expect(runtimeKeys).toHaveLength(3);
  });

  it('should have consistent structure across all runtimes', () => {
    const { result } = renderHook(() => useRuntimeEnvVarConfigs());

    Object.entries(result.current).forEach(([runtime, config]) => {
      expect(config).toHaveProperty('optionalEnvVars');
      expect(Array.isArray(config.optionalEnvVars)).toBe(true);

      config.optionalEnvVars?.forEach((envVar) => {
        expect(envVar).toHaveProperty('variable');
        expect(envVar).toHaveProperty('placeholder');
        expect(typeof envVar.variable).toBe('string');
        expect(typeof envVar.placeholder).toBe('string');
      });
    });
  });
});
