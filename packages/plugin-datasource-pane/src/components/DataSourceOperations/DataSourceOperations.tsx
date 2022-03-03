import React, { PureComponent } from 'react';
import { Button, MenuButton } from '@alifd/next';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@alilc/lowcode-datasource-types';
import _isArray from 'lodash/isArray';
import { generateClassName } from '../../utils/misc';
import { DataSourcePaneImportPlugin, DataSourceType, DataSourcePanelMode } from '../../types';

const { Item: MenuButtonItem } = MenuButton;

// function deriveTypeFromValue(val: any) {
//   if (_isBoolean(val)) return 'bool';
//   if (_isNumber(val)) return 'number';
//   if (_isPlainObject(val)) return 'obj';
//   return 'string';
// }

export interface DataSourceOperationsProps {
  importPlugins?: DataSourcePaneImportPlugin[];
  dataSourceTypes: DataSourceType[];
  dataSource: DataSourceConfig[];
  onCreate?: (dataSourceType: string) => void;
  onImport?: (importPluginName: string) => void;
  onStartSort?: () => void;
  onFinishSort?: () => void;
  onCancelSort?: () => void;
  onStartExport?: () => void;
  onFinishExport?: () => void;
  onCancelExport?: () => void;
  selectedList: string[];
  mode: DataSourcePanelMode;
  empty: boolean;
}

export class DataSourceOperations extends PureComponent<DataSourceOperationsProps> {
  handleDataSourceFormBtnClick = (dataSourceType: string) => {
    this.props.onCreate?.(dataSourceType);
  };

  handleDataSourceFormMenuBtnClick = (dataSourceType: string) => {
    this.props.onCreate?.(dataSourceType);
  };

  handleImportDataSourceMenuBtnClick = (importPluginName: string) => {
    // TODO: 这个是什么
    // @ts-ignore
    this.props.onImport?.({
      name: importPluginName,
    } as unknown as DataSourceConfig);
  };

  renderOperatons = () => {
    const { importPlugins, dataSourceTypes, mode, selectedList, empty } =
      this.props;

    if (mode === DataSourcePanelMode.SORTING) {
      return [
        <Button onClick={this.props.onFinishSort}>完成</Button>,
        <Button text onClick={this.props.onCancelSort}>
          取消
        </Button>,
      ];
    }
    if (mode === DataSourcePanelMode.EXPORTING) {
      return [
        <Button
          disabled={selectedList.length === 0}
          key="do-export"
          onClick={this.props.onFinishExport}
        >
          导出 {selectedList.length} 项
        </Button>,
        <Button text key="finish-export" onClick={this.props.onCancelExport}>
          取消
        </Button>,
      ];
    }

    return [
      _isArray(dataSourceTypes) && dataSourceTypes.length > 0 ? (
        <MenuButton
          key="create"
          label="新建"
          onItemClick={this.handleDataSourceFormMenuBtnClick}
        >
          {dataSourceTypes.map((type) => (
            <MenuButtonItem key={type.type}>{type.type}</MenuButtonItem>
          ))}
        </MenuButton>
      ) : _isArray(dataSourceTypes) && dataSourceTypes.length === 1 ? (
        <Button
          key="create"
          onClick={this.handleDataSourceFormBtnClick.bind(
            this,
            dataSourceTypes[0].type,
          )}
        >
          新建
        </Button>
      ) : null,
      !empty ? (
        <Button text key="sort" onClick={this.props.onStartSort}>
          排序
        </Button>
      ) : null,
      _isArray(importPlugins) && importPlugins.length > 1 ? (
        <MenuButton
          text
          key="import"
          label="导入"
          onItemClick={this.handleImportDataSourceMenuBtnClick}
        >
          {importPlugins.map((plugin) => (
            <MenuButtonItem key={plugin.name}>{plugin.name}</MenuButtonItem>
          ))}
        </MenuButton>
      ) : _isArray(importPlugins) && importPlugins.length === 1 ? (
        <Button
          key="import"
          onClick={this.handleImportDataSourceMenuBtnClick.bind(
            this,
            importPlugins[0].name,
          )}
          text
        >
          导入
        </Button>
      ) : null,
      !empty ? (
        <Button text key="export" onClick={this.props.onStartExport}>
          导出
        </Button>
      ) : null,
    ];
  };

  render() {
    return (
      <div className={generateClassName('operations')}>
        {this.renderOperatons()}
      </div>
    );
  }
}
