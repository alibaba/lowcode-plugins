## monaco-editor for lowcode environments

This is monaco-editor's react port for lowcode environments.

It removes those obstacles when using monaco-editor directly:

1. using webpack font loader
2. using wepback-monaco-editor 
3. make web worker appear in the same host as origin site
4. make font accessable and in the same repository
5. if using amd loader, make sure it dosen't collide with webpack loader
6. do above things again if it appears in dependencies in the package.json

And it supports **some** of the monaco-editor typescript definitions without referring to monaco-editor directly.

BTW. Style is seperate from index.js. Use `import '@alilc/lowcode-plugin-base-monaco-editor/lib/style';` for styling.

## API

| prop  | description  | type annotation |
| --- | --- | --- |
| value | value, controlled | `string` |
| defaultValue | defaultValue for creating model, uncontrolled | `string` |
| language | language of the editor | `string` |
| theme | theme of the editor, `"light" | "vs-dark"` | `string` |
| options | [Monaco editor options](https://microsoft.github.io/monaco-editor/) | `Record<string, any>` |
| requireConfig | [config passing to require](https://github.com/suren-atoyan/monaco-react#loader-config), can be used to upgrade monaco-editor | `Record<string, any>` |
| path | path of the current model, useful when creating a multi-model editor | `string` |
| saveViewState | whether to save the models' view states between model changes or not | `boolean` |
| className | className of wrapper | `string` |
| width | width of wrapper | `number | string` |
| height | height of wrapper | `number | string` |
| enableOutline | whether to enable outline of wrapper or not | `boolean` |
| style | style of wrapper | `CSSProperties` |
| editorWillMount | callback after monaco's loaded and before editor's loaded | `(monaco: IMonacoInstance) => void` |
| editorDidMount | callback after monaco's loaded and after editor's loaded | `(monaco: IMonacoInstance, editor: IEditorInstance) => void` |

## Usage

### Simple usage with fullscreen toggle

```typescript
<SingleMonacoEditorComponent
  value={val}
  language="json"
  onChange={(next) => {
    setValue(next);
  }}
  supportFullScreen={true}
/>
```

### Diff Editor

```typescript
<LowcodePluginBaseMonacoEditor.MonacoDiffEditor
  original={JSON.stringify({a: 1}, null, 2)}
  value={JSON.stringify({b: 2}, null, 2)}
  height={100}
  language="json"
/>
```

### Multi Model Saving Scrolling States

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

### Using controller

```ts
import { controller } from '@alilc/lowcode-plugin-base-monaco-editor';

// configure Monaco to be singleton
controller.updateMeta({ singleton: true });

// Get all metadata
controller.getMeta();

// register a custom method
controller.registerMethod('methodName', (a, b, c) => { });

// call custom methods
const ret = controller.call('methodName', a, b, c);
```

## Citation

This is forked from [monaco-react](https://github.com/suren-atoyan/monaco-react). Thanks for [suren-atoyan](https://github.com/suren-atoyan)'s effort for making monaco editor appoachable.
