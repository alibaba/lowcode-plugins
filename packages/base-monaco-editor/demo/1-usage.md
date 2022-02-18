---
title: Basic Usage
order: 1
---

```jsx
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import SingleMonacoEditorComponent from '@alilc/lowcode-plugin-base-monaco-editor';

function App() {
  const [val, setValue] = React.useState(JSON.stringify({ a: 100 }, null, 2))
  return (
    <div>
      <SingleMonacoEditorComponent
        value={val}
        language="json"
        onChange={(next) => {
          setValue(next);
        }}
        supportFullScreen={true}
      />
      <pre>{val}</pre>
    </div>
  );
}

ReactDOM.render(<App />, mountNode);
```
