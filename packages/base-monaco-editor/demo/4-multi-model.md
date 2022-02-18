---
title: Multi model
order: 4
---

```jsx
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import SingleMonacoEditorComponent from '@alilc/lowcode-plugin-base-monaco-editor';

function App() {
  const [files, setFiles] = React.useState({
    'a.json': {
      name: 'a.json',
      language: 'json',
      value: '{ "a": 1 }',
    },
    'b.js': {
      name: 'b.js',
      language: 'javascript',
      value: 'var a = 1',
    },
    'c.sql': {
      name: 'c.sql',
      language: 'sql',
      value: 'SELECT * from table where id = 1',
    },
  })
  const [fileName, setFileName] = React.useState("a.json");
  const file = files[fileName];

  return (
    <div>
      {Object.keys(files).map(key => (
        <button
          key={key}
          disabled={key === fileName}
          onClick={() => {
            setFileName(key)
          }}
        >
          {key}
        </button>
      ))}
      <SingleMonacoEditorComponent
        height={40}
        path={file.name}
        language={file.language}
        defaultValue={file.value}
        saveViewState={true}
        onChange={(next) => {
          setFiles(v => ({
            ...v,
            [file.name]: {
              ...v[file.name],
              value: next,
            },
          }))
        }}
      />
    </div>
  );
}

ReactDOM.render(<App />, mountNode);
```
