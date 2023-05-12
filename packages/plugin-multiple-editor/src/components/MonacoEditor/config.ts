import * as monaco from 'monaco-editor';

export const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions =
  {
    tabSize: 2,
    theme: 'vs',
    automaticLayout: true,
    minimap: { enabled: false, showSlider: 'mouseover' },
  };
