/* eslint-disable @typescript-eslint/indent */
/**
 * 源码导入插件
 * @todo editor 关联 types，并提供详细的出错信息
 */
import React, { PureComponent } from 'react';
import { Button, Message } from '@alifd/next';
import _isArray from 'lodash/isArray';
import _isPlainObject from 'lodash/isPlainObject';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import type { editor } from 'monaco-editor';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@alilc/lowcode-datasource-types';
import Ajv from 'ajv';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { DataSourceType } from '../../types';
import { generateClassName } from '../../utils/misc';

// import './import-plugins/code.scss';

export interface DataSourceExportProps {
dataSourceList: DataSourceConfig[];
dataSourceTypes: DataSourceType[];
}

export interface DataSourceExportState {
code: string;
isCodeValid: boolean;
}

export class DataSourceExport extends PureComponent<
DataSourceExportProps,
DataSourceExportState
> {
static defaultProps = {
    dataSourceList: [],
};

state = {
    code: '',
    isCodeValid: true,
};

submit = () => {
    return new Promise((resolve, reject) => {
    const { isCodeValid, code } = this.state;

    if (isCodeValid) reject(new Error('格式有误'));
    resolve({ schema: code });
    });
};

private monacoRef: any;

constructor(props: DataSourceExportProps) {
    super(props);
    this.state.code = JSON.stringify(this.deriveValue(this.props.dataSourceList));
    this.handleEditorDidMount = this.handleEditorDidMount.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
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
    const dataSourceType = dataSourceTypes.find((type) => type.type === dataSource.type);
    if (!dataSourceType) return false;
    return ajv.validate(dataSourceType.schema, dataSource);
    });
};

handleCopy = () => {
    Message.success('粘贴成功！');
};

handleEditorChange = (newValue) => {
    if (this.monacoRef) {
    if (!this.monacoRef.getModelMarkers().find((marker: editor.IMarker) => marker.owner === 'json')) {
        this.setState({ isCodeValid: true, code: newValue });
    }
    }
};

handleEditorDidMount = (isFullscreen, editor, monaco) => {
    this.monacoRef = monaco?.editor;
};

handleReset = () => {
if (this.monacoRef) {
    this.monacoRef.getModels()?.[0]?.setValue?.(code);
}
};

render() {
    const { code, isCodeValid } = this.state;

    // @todo
    // formatOnType formatOnPaste
    return (
      <div className={generateClassName('export')}>
        <MonacoEditor
          theme="vs-vision"
          width={1000}
          height={300}
          value={code}
          wordWrap="on"
          lineNumbers
          language="json"
          onChange={this.handleEditorChange}
          editorDidMount={this.handleEditorDidMount}
        />
        {!isCodeValid && <p className="error-msg">格式有误</p>}
        <p className={generateClassName('export-btns')}>
          <CopyToClipboard text={code} onCopy={this.handleCopy}>
            <Button type="primary">
              将代码复制到粘贴板
            </Button>
          </CopyToClipboard>
          <Button onClick={this.handleReset}>
            重置
          </Button>
        </p>
      </div>
    );
}
}
