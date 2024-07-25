import useControllableState from '../hooks/useControllableState';
import { loadLanguage, LanguageName } from '@uiw/codemirror-extensions-langs';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { EditorView } from '@uiw/react-codemirror';

interface BAICodeEditorProps extends Omit<ReactCodeMirrorProps, 'language'> {
  value: string;
  onChange: (value: string) => void;
  language: LanguageName;
  editable?: boolean;
  showLineNumbers?: boolean;
  lineWrapping?: boolean;
}

const BAICodeEditor: React.FC<BAICodeEditorProps> = ({
  value,
  onChange,
  language = 'shell',
  editable = false,
  showLineNumbers = true,
  lineWrapping = false,
  ...CodeMirrorProps
}) => {
  const [script, setScript] = useControllableState<string>({
    defaultValue: '',
    value,
    onChange,
  });
  const extensions = [loadLanguage(language)!];

  return (
    <CodeMirror
      {...CodeMirrorProps}
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
    />
  );
};

export default BAICodeEditor;
