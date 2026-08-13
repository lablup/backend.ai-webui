/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { loadMonacoEditor } from '../helper/monacoEditor';
import useControllableState_deprecated from '../hooks/useControllableState';
import { useThemeMode } from '../hooks/useThemeMode';
import { theme } from '../theme-shim';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import type { EditorProps } from '@monaco-editor/react';
import React, { Suspense } from 'react';

const MonacoEditor: React.LazyExoticComponent<React.FC<EditorProps>> =
  React.lazy(() =>
    loadMonacoEditor().then((module) => ({
      default: module.Editor as React.FC<EditorProps>,
    })),
  );

// Language alias preserved from the previous codemirror-based API so existing
// call sites keep working. Extend as needed when adding new languages.
export type BAICodeEditorLanguage =
  'json' | 'sh' | 'yaml' | 'toml' | 'markdown';

const MONACO_LANGUAGE_MAP: Record<BAICodeEditorLanguage, string> = {
  json: 'json',
  sh: 'shell',
  yaml: 'yaml',
  toml: 'plaintext',
  markdown: 'markdown',
};

interface BAICodeEditorProps extends Omit<
  EditorProps,
  'language' | 'value' | 'onChange' | 'defaultValue'
> {
  value?: string;
  // Seeds the editor once when used uncontrolled (`value` left undefined).
  // Use this instead of `value` for editors whose content is retyped
  // continuously — feeding a fast-changing `value` back into Monaco as a
  // controlled prop races its internal echo-detection (`value` vs. the live
  // buffer momentarily disagreeing forces a full-buffer replace that resets
  // the cursor to the end; see AnnouncementEditModal for a concrete repro).
  defaultValue?: string;
  onChange?: (value: string) => void;
  language?: BAICodeEditorLanguage;
  editable?: boolean;
  showLineNumbers?: boolean;
  lineWrapping?: boolean;
  style?: React.CSSProperties;
}

const BAICodeEditor: React.FC<BAICodeEditorProps> = ({
  value,
  defaultValue = '',
  onChange,
  language = 'sh',
  editable = false,
  showLineNumbers = true,
  lineWrapping = false,
  height = 200,
  style,
  options,
  ...editorProps
}) => {
  'use memo';
  const { isDarkMode } = useThemeMode();
  const { token } = theme.useToken();

  // Whether *this* BAICodeEditor is controlled by its caller (a `value` prop
  // was given), independent of `useControllableState_deprecated`'s own
  // controlled/uncontrolled bookkeeping below.
  const isControlled = value !== undefined;

  const [script, setScript] = useControllableState_deprecated<string>({
    defaultValue,
    value,
    onChange,
  });

  const loadingFallback = (
    // antd `Skeleton active` (title bar + 3 lines) -> `BAISkeletonAstryx`,
    // which composes that shape out of Astryx's single-box `Skeleton`.
    // `active` is dropped: Astryx skeletons are always animated.
    <BAISkeletonAstryx
      style={{
        paddingInline: token.paddingContentHorizontal,
        paddingBlock: token.paddingContentVertical,
      }}
    />
  );

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Suspense fallback={loadingFallback}>
        <MonacoEditor
          language={MONACO_LANGUAGE_MAP[language]}
          height={height}
          theme={isDarkMode ? 'vs-dark' : 'vs'}
          // Only feed Monaco a controlled `value` when our own caller is
          // controlled. Otherwise leave `value` undefined and seed via
          // `defaultValue` instead — @monaco-editor/react then manages the
          // buffer itself after creation, with no controlled-value prop to
          // race against fast typing (see the `defaultValue` doc comment on
          // BAICodeEditorProps above).
          value={isControlled ? script : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={(v: string | undefined) => setScript(v ?? '')}
          loading={loadingFallback}
          options={{
            readOnly: !editable,
            lineNumbers: showLineNumbers ? 'on' : 'off',
            wordWrap: lineWrapping ? 'on' : 'off',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fixedOverflowWidgets: true,
            ...options,
          }}
          {...editorProps}
        />
      </Suspense>
    </div>
  );
};

export default BAICodeEditor;
