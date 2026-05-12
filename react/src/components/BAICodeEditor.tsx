/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { loadMonacoEditor } from '../helper/monacoEditor';
import useControllableState_deprecated from '../hooks/useControllableState';
import { useThemeMode } from '../hooks/useThemeMode';
import type { EditorProps } from '@monaco-editor/react';
import { Skeleton } from 'antd';
import React, { Suspense } from 'react';

const MonacoEditor: React.LazyExoticComponent<React.FC<EditorProps>> =
  React.lazy(() =>
    loadMonacoEditor().then((module) => ({
      default: module.Editor as React.FC<EditorProps>,
    })),
  );

// Language alias preserved from the previous codemirror-based API so existing
// call sites keep working. Extend as needed when adding new languages.
export type BAICodeEditorLanguage = 'json' | 'sh' | 'yaml' | 'toml';

const MONACO_LANGUAGE_MAP: Record<BAICodeEditorLanguage, string> = {
  json: 'json',
  sh: 'shell',
  yaml: 'yaml',
  toml: 'plaintext',
};

interface BAICodeEditorProps extends Omit<
  EditorProps,
  'language' | 'value' | 'onChange'
> {
  value?: string;
  onChange?: (value: string) => void;
  language?: BAICodeEditorLanguage;
  editable?: boolean;
  showLineNumbers?: boolean;
  lineWrapping?: boolean;
  style?: React.CSSProperties;
}

const BAICodeEditor: React.FC<BAICodeEditorProps> = ({
  value,
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

  const [script, setScript] = useControllableState_deprecated<string>({
    defaultValue: '',
    value,
    onChange,
  });

  return (
    <div style={style}>
      <Suspense fallback={<Skeleton active />}>
        <MonacoEditor
          language={MONACO_LANGUAGE_MAP[language]}
          height={height}
          theme={isDarkMode ? 'vs-dark' : 'vs'}
          value={script}
          onChange={(v: string | undefined) => setScript(v ?? '')}
          loading={<Skeleton active />}
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
