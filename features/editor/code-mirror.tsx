import { javascript } from '@codemirror/lang-javascript';
import CodeMirror from '@uiw/react-codemirror';
import { NodeKey } from 'lexical';
import { useTheme } from 'next-themes';

type Props = {
    code: string;
    language: string;
    nodeKey: NodeKey;
};

export function CodeMirrorEditor({
    code,
    language,
    nodeKey,
}: Props) {
    const {theme} = useTheme()
    return (
        <CodeMirror
        className='pr-20 text-xl'
            value={`console.log('hello world')`}
            height="80px"
            width='auto'
            extensions={[javascript({ jsx: true, typescript: true })]}
            theme={theme == 'light' ? 'light' : 'dark'}
            basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: true,
                autocompletion: true,
            }}
        />
    );
}