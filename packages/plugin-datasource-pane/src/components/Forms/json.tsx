import React, { PureComponent } from 'react';
import { connect } from '@formily/react';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import _noop from 'lodash/noop';
// import { editor } from 'monaco-editor';

export interface JSONProps {
  className?: string;
  value: Record<string, any>;
  onChange?: (val: any) => void;
}

export interface JSONState {}

export class JSONComp extends PureComponent<JSONProps, JSONState> {
  static isFieldComponent = true;

  static defaultProps = {
    onChange: _noop,
  };

  // private monacoRef: any = null;

  handleEditorChange = (newValue: string) => {
    this.props.onChange?.(newValue);
  };

  // handleEditorDidMount = (editor) => {
  //   this.monacoRef = editor;
  // };

  render() {
    const { value, className } = this.props;
    return (
      <div className={className} style={{ width: '100%', height: 150 }}>
        <MonacoEditor
          theme="vs-vision"
          value={value ?? ''}
          language="json"
          onChange={this.handleEditorChange}
          // editorDidMount={this.handleEditorDidMount}
        />
      </div>
    );
  }
}

export const JSON = connect(JSONComp);
