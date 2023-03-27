/* eslint-disable @typescript-eslint/indent */
/**
 * 源码导入插件
 * @todo editor 关联 types，并提供详细的出错信息
 */
import React, { PureComponent } from 'react';
import _isArray from 'lodash/isArray';
import _last from 'lodash/last';
import _isPlainObject from 'lodash/isPlainObject';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import type { editor } from 'monaco-editor';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@alilc/lowcode-datasource-types';
import Ajv from 'ajv';
import { DataSourcePaneImportPluginComponentProps } from '../../types';

// import './import-plugins/code.scss';

export interface DataSourceImportProps
  extends DataSourcePaneImportPluginComponentProps {
  defaultValue?: DataSourceConfig[];
}

export interface DataSourceImportState {
  code: string;
  isCodeValid: boolean;
}

export class DataSourceImport extends PureComponent<
  DataSourceImportProps,
  DataSourceImportState
> {
  static defaultProps = {
    defaultValue: [
      {
        type: 'fetch',
        isInit: false,
        options: {
          method: 'GET',
          isCors: true,
          timeout: 5000,
          uri: '/info',
          params: {},
          headers: {}
        },
        id: 'info'
      }
    ],
  };

  state = {
    code: '',
    isCodeValid: true,
  };

  submit = () => {
    return new Promise((resolve, reject) => {
      const { isCodeValid, code } = this.state;

      if (!isCodeValid) reject(new Error('导入格式有误'));

      // 只 resolve 通过 schema 校验的数据
      resolve(this.deriveValue(JSON.parse(code)));
    });
  };

  private monacoRef: any;

  constructor(props: DataSourceImportProps) {
    super(props);
    this.state.code = JSON.stringify(this.deriveValue(this.props.defaultValue), null, 2);
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

      // 向下兼容
      if (dataSourceType.schema) {
        // 校验失败的数据源，给予用户提示
        const validate = ajv.compile(dataSourceType.schema)
        const valid = validate(dataSource)
        if (!valid) console.warn(validate.errors)
        return valid
      } else {
        // 用户不传入 schema 校验规则，默认返回 true
        return true
      }
    });
  };

  /**
   * 看代码是未使用到
   * @deprecated
   */
  handleComplete = () => {
    if (this.monacoRef) {
      if (
        !this.monacoRef
          .getModelMarkers()
          .find((marker: editor.IMarker) => marker.owner === 'json')
      ) {
        this.setState({ isCodeValid: true });
        const model: any = _last(this.monacoRef.getModels());
        if (!model) return;
        this.props.onImport?.(this.deriveValue(JSON.parse(model.getValue())));
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

  handleEditorDidMount = (editor: MonacoEditor, monaco: MonacoEditor) => {
    this.monacoRef = editor?.editor;
  };

  render() {
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
      </div>
    );
  }
}
