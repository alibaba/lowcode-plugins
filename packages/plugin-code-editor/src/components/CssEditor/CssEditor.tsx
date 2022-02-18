import React, { PureComponent } from 'react';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import { Tab } from '@alifd/next';

import { IEditorInstance } from '@alilc/lowcode-plugin-base-monaco-editor/lib/helper';

import { TAB_KEY } from '../../config';

import './CssEditor.less';
import { beautifyCSS } from '../../utils';

export interface CssEditorProps {
  cssCode?: string;
  currentTab: TAB_KEY;
  onTabChange: (tab: TAB_KEY) => void;
  saveSchema: () => void;
}

export interface CssEditorState {
  code: string;
}

// TODO: CSS语法提示后续再添加
export class CssEditor extends PureComponent<CssEditorProps, CssEditorState> {
  static defaultProps: Partial<CssEditorProps>;

  state: CssEditorState = {
    code: this.props.cssCode ?? '',
  };

  cssEditor: IEditorInstance;

  editorDidMount(editor: IEditorInstance): void {
    this.cssEditor = editor;
  }

  getBeautifiedCSS() {
    const { code } = this.state;
    const nextCode = beautifyCSS(code);
    // css 将会经过格式化，因此需要同步回来
    this.setState({
      code: nextCode,
    });
    return nextCode;
  }

  render() {
    const { code } = this.state;
    return (
      <>
        <Tab
          size="small"
          shape="wrapped"
          activeKey={this.props.currentTab}
        >
          <Tab.Item
            title={`${code !== this.props.cssCode ? '* ' : ''}index.css`}
            key={TAB_KEY.CSS}
            onClick={() => this.props.onTabChange(TAB_KEY.CSS)}
          />
          {/** 当以后需要扩展多文件时，在这里控制 */}
        </Tab>
        {this.props.currentTab === TAB_KEY.CSS && (
          <div className="plugin-code-editor-css plugin-code-editor-inner">
            <MonacoEditor
              value={code}
              language="css"
              height="100%"
              supportFullScreen
              onChange={(newCode: string) => {
                this._updateCode(newCode);
              }}
              editorDidMount={(useMonaco, editor: IEditorInstance) => {
                this.editorDidMount(editor);
              }}
            />
          </div>
        )}
      </>
    );
  }

  _updateCode(newCode: string) {
    this.setState({ code: newCode });
  }
}
