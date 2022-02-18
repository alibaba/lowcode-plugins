import React, { PureComponent } from 'react';
import { connect } from '@formily/react';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import _noop from 'lodash/noop';
import { editor } from 'monaco-editor';

export interface CodeProps {
  className: string;
  value: string;
  onChange?: (val: any) => void;
  language?: string;
}

export interface CodeState {}

export class CodeComp extends PureComponent<CodeProps, CodeState> {
  static isFieldComponent = true;

  static defaultProps = {
    onChange: _noop,
    language: 'json',
  };

  private monacoRef: any = null;

  handleEditorChange = (newValue) => {
    if (this.monacoRef) {
      if (
        !(this.monacoRef as any)
          .getModelMarkers()
          .find((marker: editor.IMarker) => marker.owner === 'json')
      ) {
        this.props.onChange?.(newValue);
      }
    }
  };

  handleEditorDidMount = (isFullscreen, editor, monaco) => {
    this.monacoRef = monaco?.editor;
  };

  render() {
    const { value, language } = this.props;
    return (
      <div style={{ width: '100%', height: 150 }}>
        <MonacoEditor
          theme="vs-vision"
          value={value ?? ''}
          language={language}
          onChange={this.handleEditorChange}
          editorDidMount={this.handleEditorDidMount}
        />
      </div>
    );
  }
}

export const Code = connect(CodeComp);
