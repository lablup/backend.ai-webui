import useControllableState_deprecated from '../hooks/useControllableState';
import { useThemeMode } from '../hooks/useThemeMode';
import { loadLanguage, LanguageName } from '@uiw/codemirror-extensions-langs';
import CodeMirror, {
  ReactCodeMirrorProps,
  EditorView,
} from '@uiw/react-codemirror';

interface BAICodeEditorProps extends Omit<ReactCodeMirrorProps, 'language'> {
  value?: string;
  onChange?: (value: string) => void;
  language?: LanguageName;
  editable?: boolean;
  showLineNumbers?: boolean;
  lineWrapping?: boolean;
}

const BAICodeEditor: React.FC<BAICodeEditorProps> = ({
  value,
  onChange,
  language = 'sh',
  editable = false,
  showLineNumbers = true,
  lineWrapping = false,
  ...CodeMirrorProps
}) => {
  const { isDarkMode } = useThemeMode();

  const [script, setScript] = useControllableState_deprecated<string>({
    defaultValue: '',
    value,
    onChange,
  });
  const extensions = [loadLanguage(language)!];

  return (
    <CodeMirror
      theme={isDarkMode ? 'dark' : 'light'}
      extensions={
        lineWrapping ? [EditorView.lineWrapping, ...extensions] : extensions
      }
      editable={editable}
      readOnly={!editable}
      basicSetup={{
        lineNumbers: showLineNumbers,
      }}
      value={script}
      onChange={(value) => setScript(value)}
      {...CodeMirrorProps}
    />
  );
};

export default BAICodeEditor;
