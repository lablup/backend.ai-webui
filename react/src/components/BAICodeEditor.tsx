import { loadLanguage, LanguageName } from '@uiw/codemirror-extensions-langs';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { EditorView } from '@uiw/react-codemirror';
import { useControllableValue } from 'ahooks';

interface BAICodeEditorProps extends Omit<ReactCodeMirrorProps, 'language'> {
  children: string;
  onChange: (value: string) => void;
  language: LanguageName;
  editable?: boolean;
  showLineNumbers?: boolean;
  lineWrapping?: boolean;
}

const BAICodeEditor: React.FC<BAICodeEditorProps> = ({
  children,
  onChange,
  language = 'shell',
  editable = false,
  showLineNumbers = true,
  lineWrapping = false,
  ...CodeMirrorProps
}) => {
  const [script, setScript] = useControllableValue<string>({
    defaultValue: '',
    value: children,
    onChange,
  });
  const extensions = [loadLanguage(language)!];

  return (
    <CodeMirror
      value={script}
      onChange={(value, viewUpdate) => setScript(value)}
      theme={'dark'}
      extensions={
        lineWrapping ? [EditorView.lineWrapping, ...extensions] : extensions
      }
      editable={editable}
      readOnly={!editable}
      basicSetup={{
        lineNumbers: showLineNumbers,
      }}
      {...CodeMirrorProps}
    />
  );
};

export default BAICodeEditor;
