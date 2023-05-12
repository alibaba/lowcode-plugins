import React from 'react';
import Editor from '@/MultipleFileEditor';
import { EditorProvider } from './Context';

const App = () => {
  return (
    <EditorProvider>
      <Editor />
    </EditorProvider>
  );
};
export default App;
