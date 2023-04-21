/**
 * 源码导入插件
 * @todo editor 关联 types，并提供详细的出错信息
 */
import React, { PureComponent } from 'react';
import { Button, Message } from '@alifd/next';
import _noop from 'lodash/noop';
import _isArray from 'lodash/isArray';
import _last from 'lodash/last';
import _isPlainObject from 'lodash/isPlainObject';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import type { editor } from 'monaco-editor';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@alilc/lowcode-datasource-types';
import Ajv from 'ajv';
import { DataSourcePaneImportPluginComponentProps } from '../../types';

import './index.scss';

export interface DataSourceImportPluginCodeProps
  extends DataSourcePaneImportPluginComponentProps {
  defaultValue?: DataSourceConfig[];
}

export interface DataSourceImportPluginCodeState {
  code: string;
  isCodeValid: boolean;
}

export class DataSourceImportPluginCode extends PureComponent<
  DataSourceImportPluginCodeProps,
  DataSourceImportPluginCodeState
> {
  static defaultProps = {
    defaultValue: [
      {
        type: 'http',
        id: 'test',
      },
    ],
  };

  state = {
    code: '',
    isCodeValid: true,
  };

  /* @author daifuyang
  ** @description：修复默认panel ref没有submit方法
  */
  submit = () => {
    return new Promise((resolve, reject) => {
      const { isCodeValid, code } = this.state;

      if (!isCodeValid) reject(new Error('导入格式有误'));

      // 只 resolve 通过 schema 校验的数据
      resolve(this.deriveValue(JSON.parse(code)));
    });
  };

  private monacoRef: any;

  constructor(props: DataSourceImportPluginCodeProps) {
    super(props);
    this.state.code = JSON.stringify(this.deriveValue(this.props.defaultValue));
    this.handleEditorDidMount = this.handleEditorDidMount.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.handleComplete = this.handleComplete.bind(this);
  }

  deriveValue = (value: any) => {
    const { dataSourceTypes } = this.props;

    if (!_isArray(dataSourceTypes) || dataSourceTypes.length === 0) return [];

    let result = value;
    if (_isPlainObject(result)) {
      // 如果是对象则转化成数组
      result = [result];
    } else if (!_isArray(result)) {
      return [];
    }

    const ajv = new Ajv();

    return (result as DataSourceConfig[]).filter((dataSource) => {
      if (!dataSource.type) return false;
      const dataSourceType = dataSourceTypes.find(
        (type) => type.type === dataSource.type,
      );
      if (!dataSourceType) return false;
      // 处理下默认为空的情况，向下兼容
      return ajv.validate(dataSourceType.schema || {}, dataSource);
    });
  };

  handleComplete = () => {
    if (this.monacoRef) {
      if (
        !this.monacoRef
          .getModelMarkers()
          .find((marker: editor.IMarker) => marker.owner === 'json')
      ) {
        Message.success("检验成功，点击右上方确定完成导入！")
        this.setState({ isCodeValid: true });
        // const model: any = _last(this.monacoRef.getModels());
        // if (!model) return;
        // this.props.onImport?.(this.deriveValue(JSON.parse(model.getValue())));
        return;
      }
    }
    this.setState({ isCodeValid: false });
  };

  handleEditorChange = (newValue: string) => {
    if (this.monacoRef) {
      if (
        !this.monacoRef
          .getModelMarkers()
          .find((marker: editor.IMarker) => marker.owner === 'json')
      ) {
        this.setState({ isCodeValid: true, code: newValue });
      }
    }
  };

  /* @author daifuyang
  ** @description：修复编辑器挂载事件
  */
  handleEditorDidMount = (editor: MonacoEditor, monaco: MonacoEditor) => {
    this.monacoRef = editor?.editor;
  };


  render() {
    const { onCancel = _noop } = this.props;
    const { code, isCodeValid } = this.state;

    // @todo
    // formatOnType formatOnPaste
    return (
      <div className="lowcode-plugin-datasource-import-plugin-code">
        <MonacoEditor
          theme="vs-vision"
          width={800}
          height={400}
          value={code}
          language="json"
          onChange={this.handleEditorChange}
          editorDidMount={this.handleEditorDidMount}
        />
        {!isCodeValid && <p className="error-msg">格式有误</p>}
        <p className="btns">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={this.handleComplete}>
            检验
          </Button>
        </p>
      </div>
    );
  }
}
