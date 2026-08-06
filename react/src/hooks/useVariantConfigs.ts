/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { EnvVarConfig } from '../components/EnvVarFormList';
import { useTranslation } from 'react-i18next';

export interface RuntimeVariantConfig {
  requiredEnvVars?: EnvVarConfig[];
  optionalEnvVars?: EnvVarConfig[];
}

// Env vars that are useful regardless of the selected inference runtime
// variant (e.g. credentials for pulling gated models, egress proxies).
export const useCommonEnvVarConfigs = (): EnvVarConfig[] => {
  const { t } = useTranslation();

  return [
    { variable: 'HF_TOKEN', placeholder: t('modelService.HfToken') },
    { variable: 'WANDB_API_KEY', placeholder: t('modelService.WandbApiKey') },
    {
      variable: 'AWS_ACCESS_KEY_ID',
      placeholder: t('modelService.AwsAccessKeyId'),
    },
    {
      variable: 'AWS_SECRET_ACCESS_KEY',
      placeholder: t('modelService.AwsSecretAccessKey'),
    },
    {
      variable: 'AWS_DEFAULT_REGION',
      placeholder: t('modelService.AwsDefaultRegion'),
    },
    { variable: 'HTTP_PROXY', placeholder: t('modelService.HttpProxy') },
    { variable: 'HTTPS_PROXY', placeholder: t('modelService.HttpsProxy') },
    { variable: 'NO_PROXY', placeholder: t('modelService.NoProxy') },
  ];
};

export const useRuntimeEnvVarConfigs = (): Record<
  string,
  RuntimeVariantConfig
> => {
  const { t } = useTranslation();

  return {
    vllm: {
      optionalEnvVars: [
        {
          variable: 'BACKEND_MODEL_NAME',
          placeholder: t('modelService.VllmModelName'),
        },
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
      optionalEnvVars: [
        {
          variable: 'BACKEND_MODEL_NAME',
          placeholder: t('modelService.SglangModelName'),
        },
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
      optionalEnvVars: [
        {
          variable: 'NGC_API_KEY',
          placeholder: t('modelService.NimApiKey'),
        },
      ],
    },
  };
};
