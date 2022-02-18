---
title: Controlled Value
order: 3
---

```jsx
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import SingleMonacoEditorComponent from '@alilc/lowcode-plugin-base-monaco-editor';

function App() {
  const [val, setValue] = React.useState('{}')
  const [language, setLanguage] = React.useState('json')
  return (
    <div>
      <button onClick={() => {
        setValue('{ "a": 1 }')
        setLanguage('json')
      }}>Fill json data</button>
      <button onClick={() => {
        setValue('var a = 1')
        setLanguage('javascript')
      }}>Fill javascript data</button>
      <button onClick={() => {
        setValue('SELECT * from table where id = 1')
        setLanguage('sql')
      }}>Fill sql data</button>
      <SingleMonacoEditorComponent
        height={40}
        value={val}
        language={language}
        options={{ readOnly: true }}
        onChange={(next) => {
          setValue(next);
        }}
      />
      <SingleMonacoEditorComponent.MonacoDiffEditor
        height={40}
        value={val}
        options={{ readOnly: true }}
        language={language}
      />
    </div>
  );
}

ReactDOM.render(<App />, mountNode);
```
