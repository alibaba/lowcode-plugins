import React, { PureComponent } from 'react';
import { connect } from '@formily/react';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import _noop from 'lodash/noop';
import { editor } from 'monaco-editor';

export interface JSONProps {
  className: string;
  value: Record<string, any>;
  onChange?: (val: any) => void;
}

export interface JSONState {}

export class JSONComp extends PureComponent<JSONProps, JSONState> {
  static isFieldComponent = true;

  static defaultProps = {
    onChange: _noop,
  };

  private monacoRef: any = null;

  handleEditorChange = (newValue) => {
    if (this.monacoRef) {
      if (!(this.monacoRef as any).getModelMarkers().find((marker: editor.IMarker) => marker.owner === 'json')) {
        this.props.onChange?.({
          type: 'JSON',
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
      <div style={{ width: '100%', height: 150 }}>
        <MonacoEditor
          theme="vs-vision"
          value={value ?? ''}
          language="json"
          onChange={this.handleEditorChange}
          editorDidMount={this.handleEditorDidMount}
        />
      </div>
    );
  }
}

export const JSON = connect(JSONComp);
