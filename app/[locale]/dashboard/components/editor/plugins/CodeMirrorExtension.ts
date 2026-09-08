import {defineExtension} from 'lexical';
import {CodeMirrorNode} from './CodeMirrorNode';

export const CodeMirrorExtension = defineExtension({
  name: '@my-app/code-mirror',
  nodes: () => [CodeMirrorNode],
});