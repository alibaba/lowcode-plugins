---
title: Usage
order: 1
---

用法

````jsx
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Icon } from '@alifd/next';
import ComponentPane, { PaneIcon } from '@alilc/lowcode-plugin-components-pane';
import './index.scss';

const packages = [
  {
    package: 'polyfill',
    urls: ['//g.alicdn.com/platform/c/react15-polyfill/0.0.1/dist/index.js'],
  },
  { package: 'react', version: '16.5.2', urls: null, library: 'React' },
  { package: 'react-dom', version: '16.12.0', urls: null, library: 'ReactDOM' },
  { package: 'prop-types', version: '15.6.2', urls: null, library: 'PropTypes' }
];

class App extends Component {
  componentDidMount() {
    VisualEngine.init(this.container);
    VisualEngine.Panes.add(() => {
      return {
        type: 'dock',
        name: 'trunk',
        width: 300,
        title: '零售云 - 在线设计',
        description: '组件库',
        menu: <PaneIcon />,
        content: ComponentPane,
        props: {
          editor: VisualEngine.editor,
          Trunk: VisualEngine.Trunk,
        },
      };
    });

    VisualEngine.editor.set('assets', {
      version: '1.0.0',
      externals: [],
      packages,
    });
    VisualEngine.Pages.addPage({
      id: 'test',
      componentsTree: []
    });
  }
  render() {
    return (
      <div id="engine" style={{ position: 'relative' }} ref={(ref) => (this.container = ref)}></div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
````
