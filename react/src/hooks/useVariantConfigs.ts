import { EnvVarConfig } from '../components/EnvVarFormList';
import { useTranslation } from 'react-i18next';

export interface RuntimeVariantConfig {
  requiredEnvVars?: EnvVarConfig[];
  optionalEnvVars?: EnvVarConfig[];
}

export const useRuntimeEnvVarConfigs = (): Record<
  string,
  RuntimeVariantConfig
> => {
  const { t } = useTranslation();

  return {
    vllm: {
      requiredEnvVars: [
        {
          variable: 'BACKEND_MODEL_NAME',
          placeholder: t('modelService.VllmModelName'),
        },
      ],
      optionalEnvVars: [
        {
          variable: 'VLLM_QUANTIZATION',
          placeholder: t('modelService.VllmQuantization'),
        },
        {
          variable: 'VLLM_TP_SIZE',
          placeholder: t('modelService.VllmTpSize'),
        },
        {
          variable: 'VLLM_PP_SIZE',
          placeholder: t('modelService.VllmPpSize'),
        },
        {
          variable: 'VLLM_EXTRA_ARGS',
          placeholder: t('modelService.VllmExtraArgs'),
        },
      ],
    },
    sglang: {
      requiredEnvVars: [
        {
          variable: 'BACKEND_MODEL_NAME',
          placeholder: t('modelService.SglangModelName'),
        },
      ],
      optionalEnvVars: [
        {
          variable: 'SGLANG_QUANTIZATION',
          placeholder: t('modelService.SglangQuantization'),
        },
        {
          variable: 'SGLANG_TP_SIZE',
          placeholder: t('modelService.SglangTpSize'),
        },
        {
          variable: 'SGLANG_PP_SIZE',
          placeholder: t('modelService.SglangPpSize'),
        },
        {
          variable: 'SGLANG_EXTRA_ARGS',
          placeholder: t('modelService.SglangExtraArgs'),
        },
      ],
    },
    nim: {
      requiredEnvVars: [
        {
          variable: 'NGC_API_KEY',
          placeholder: t('modelService.NimApiKey'),
        },
      ],
      optionalEnvVars: [],
    },
  };
};
