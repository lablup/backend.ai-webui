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
  const currentLogoPath =
    getDefaultThemeValue<string>(`branding.logo.${logoThemeKey}`) ??
    (fallbackKey
      ? getDefaultThemeValue<string>(`branding.logo.${fallbackKey}`)
      : undefined);

  const handlePickedFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      message.error(t('userSettings.logo.UploadFileSizeExceed'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateDefaultTheme(`branding.logo.${logoThemeKey}`, base64);
    };
    reader.onerror = () => {
      message.error(t('userSettings.logo.FailedToReadFile'));
    };
    reader.readAsDataURL(file);
  };

  return (
    <BAIFlex gap="sm" align="stretch" direction="column">
      <BAIFlex gap="sm">
        <Text color="secondary">{t('userSettings.logo.ImagePath')}:</Text>
        {/* PILOT-DECISION: antd `Space.Compact` fused the text input and the
            upload trigger into one bordered unit (MAPPING §4: Space.Compact
            -> ButtonGroup, but these are two DIFFERENT field types, not a
            button group) — laid out side by side with a small gap instead.
            `Upload` (`beforeUpload` + `showUploadList={false}`, a picker not
            a transport, MAPPING §3.12) has no icon-only-trigger equivalent
            (`FileInput` renders a full field, not a button) — self-built as
            a hidden native `<input type="file">` opened by an `IconButton`,
            which is exactly what antd's `Upload type="select"` does
            internally. `onRemove` list-management has no counterpart here
            either, dropped — the setting item's own Reset action already
            clears this field. */}
        <BAIUncontrolledInput
          defaultValue={currentLogoPath}
          onCommit={(value) => {
            updateDefaultTheme(`branding.logo.${logoThemeKey}`, value);
          }}
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
      <BAIFlex
        style={{
          background:
            'repeating-conic-gradient(#e0e0e0 0% 25%, #f5f5f5 0% 50%) 50% / 20px 20px',
        }}
        align="center"
        justify="center"
      >
        {/* PILOT-DECISION: antd `Image` (COMPOSITION -> Thumbnail/Lightbox/
            AspectRatio) doesn't fit — `Thumbnail` forces a square cover-fit
            crop, which would distort a wide logo. A plain `<img>` preserves
            the arbitrary aspect ratio antd's `Image` also allowed here; the
            broken-image `fallback` becomes a native `onError` swap. */}
        <img
          height={100}
          style={{ width: 'auto', maxWidth: 250 }}
          src={currentLogoPath}
          alt={t('userSettings.logo.ImagePath')}
          onError={(e) => {
            // empty image placeholder 1x1 pixel gif
            e.currentTarget.src =
              'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          }}
        />
      </BAIFlex>
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

/** Returns the fallback theme key for modes that fall back to src/srcDark (inverted). */
const getLogoFallbackKey = (mode: LogoPreviewerMode): string | undefined => {
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
