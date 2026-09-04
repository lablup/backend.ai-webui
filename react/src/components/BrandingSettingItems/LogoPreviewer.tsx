/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../app-shim';
import { useDefaultTheme } from '../../hooks/useDefaultTheme';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex, BAIUncontrolledInput } from 'backend.ai-ui';
import { t } from 'i18next';
import { ImagePlus } from 'lucide-react';
import { useRef } from 'react';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export type LogoPreviewerMode =
  | 'light'
  | 'dark'
  | 'lightCollapsed'
  | 'darkCollapsed'
  | 'loginLight'
  | 'loginDark'
  | 'aboutLight'
  | 'aboutDark';

interface LogoPreviewerProps {
  mode: LogoPreviewerMode;
}

const LogoPreviewer: React.FC<LogoPreviewerProps> = ({ mode }) => {
  'use memo';

  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getDefaultThemeValue, updateDefaultTheme } = useDefaultTheme();
  const logoThemeKey = getLogoThemeKey(mode);
  const fallbackKey = getLogoFallbackKey(mode);
  const logoPath = `branding.logo.${logoThemeKey}`;
  // Only this item's own key is edited and previewed; an unset login/About
  // key shows which sider logo the page borrows instead of a preview.
  const logoSrc = getDefaultThemeValue<string>(logoPath);
  const pathLabel = `${t('userSettings.logo.ImagePath')}:`;

  const commitLogoSrc = (value: string) => {
    // An emptied path removes the key so the page falls back again.
    updateDefaultTheme(logoPath, value.trim() === '' ? undefined : value);
  };

  const handlePickedFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      message.error(t('userSettings.logo.UploadFileSizeExceed'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateDefaultTheme(logoPath, base64);
    };
    reader.onerror = () => {
      message.error(t('userSettings.logo.FailedToReadFile'));
    };
    reader.readAsDataURL(file);
  };

  return (
    <BAIFlex align="stretch" direction="column">
      <BAIFlex gap="sm">
        <Text color="secondary">{pathLabel}</Text>
        {/* PILOT-DECISION: the path field and the picker are two different
            field types, so they sit side by side rather than fused; the
            picker is a hidden native file input behind an IconButton. */}
        <BAIUncontrolledInput
          defaultValue={logoSrc ?? ''}
          onCommit={commitLogoSrc}
          style={{ flex: 1 }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            handlePickedFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <IconButton
          icon={<ImagePlus size="1em" />}
          label={t('userSettings.logo.CreateURLWithImage')}
          tooltip={t('userSettings.logo.CreateURLWithImage')}
          onClick={() => fileInputRef.current?.click()}
        />
      </BAIFlex>
      {logoSrc ? (
        <BAIFlex
          style={{
            marginTop: 'var(--spacing-3)',
            background:
              'repeating-conic-gradient(#e0e0e0 0% 25%, #f5f5f5 0% 50%) 50% / 20px 20px',
          }}
          align="center"
          justify="center"
        >
          {/* PILOT-DECISION: a plain <img> keeps the logo's arbitrary aspect
              ratio (Thumbnail would square-crop it); a broken path swaps in
              a 1x1 placeholder via onError. */}
          <img
            height={100}
            style={{ width: 'auto', maxWidth: 250 }}
            src={logoSrc}
            alt={t('userSettings.logo.ImagePath')}
            onError={(e) => {
              e.currentTarget.src =
                'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            }}
          />
        </BAIFlex>
      ) : (
        fallbackKey && (
          <BAIFlex
            gap="sm"
            align="start"
            style={{ marginTop: 'var(--spacing-0-5)' }}
          >
            {/* Invisible copy of the row label so the hint starts under the
                input, like a form item's explain row. */}
            <Text color="secondary" style={{ visibility: 'hidden' }}>
              {pathLabel}
            </Text>
            <Text color="secondary" data-testid="logo-fallback-hint">
              {t('userSettings.logo.FallbackFollowsItem', {
                item: t(
                  fallbackKey === 'src'
                    ? 'userSettings.logo.LightModeLogo'
                    : 'userSettings.logo.DarkModeLogo',
                ),
              })}
            </Text>
          </BAIFlex>
        )
      )}
    </BAIFlex>
  );
};

export default LogoPreviewer;

export const getLogoThemeKey = (mode: LogoPreviewerMode) => {
  switch (mode) {
    case 'light':
      return 'src';
    case 'dark':
      return 'srcDark';
    case 'lightCollapsed':
      return 'srcCollapsed';
    case 'darkCollapsed':
      return 'srcCollapsedDark';
    case 'loginLight':
      return 'loginLogoSrc';
    case 'loginDark':
      return 'loginLogoSrcDark';
    case 'aboutLight':
      return 'aboutLogoSrc';
    case 'aboutDark':
      return 'aboutLogoSrcDark';
  }
};

/** The sider key an unset login/About logo borrows: the opposite scheme's. */
const getLogoFallbackKey = (mode: LogoPreviewerMode) => {
  switch (mode) {
    case 'loginLight':
    case 'aboutLight':
      return 'srcDark';
    case 'loginDark':
    case 'aboutDark':
      return 'src';
    default:
      return undefined;
  }
};
