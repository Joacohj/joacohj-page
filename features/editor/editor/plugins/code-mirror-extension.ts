import {defineExtension} from 'lexical';
import {CodeMirrorNode} from './code-mirror-node';

export const CodeMirrorExtension = defineExtension({
  name: '@my-app/code-mirror',
  nodes: () => [CodeMirrorNode],
});