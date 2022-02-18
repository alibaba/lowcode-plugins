import React, { PureComponent } from 'react';
import { connect } from '@formily/react';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import _noop from 'lodash/noop';
import { editor } from 'monaco-editor';

export interface JSFunctionProps {
  className: string;
  value: {
    type: 'JSFunction';
    value: string;
  };
  onChange?: (val: any) => void;
}

export interface JSFunctionState {}

export class JSFunctionComp extends PureComponent<JSFunctionProps, JSFunctionState> {
  static isFieldComponent = true;

  static defaultProps = {
    onChange: _noop,
  };

  private monacoRef: any = null;

  handleEditorChange = (newValue) => {
    if (this.monacoRef) {
      if (!(this.monacoRef as any).getModelMarkers().find((marker: editor.IMarker) => marker.owner === 'json')) {
        this.props.onChange?.({
          type: 'JSFunction',
          value: newValue,
        });
      }
    }
  };

  handleEditorDidMount = (isFullscreen, editor, monaco) => {
    this.monacoRef = monaco?.editor;
  };

  render() {
    const { value } = this.props;
    return (
      <div>
        <MonacoEditor
          theme="vs-vision"
          value={value?.value ?? ''}
          language="javascript"
          onChange={this.handleEditorChange}
          editorDidMount={this.handleEditorDidMount}
        />
      </div>
    );
  }
}

export const JSFunction = connect(JSFunctionComp);
