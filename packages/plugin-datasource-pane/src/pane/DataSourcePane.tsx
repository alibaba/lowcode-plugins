/**
 * 面板，先通过 Dialog 呈现
 */
import React, { PureComponent, createRef } from 'react';
import cn from 'classnames';
import {
  RuntimeDataSource as DataSource,
  RuntimeDataSourceConfig as DataSourceConfig,
} from '@alilc/lowcode-datasource-types';
import { Button, Message, Dialog } from '@alifd/next';
import _isArray from 'lodash/isArray';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { createStateMachine } from '../utils/stateMachine';
import { DataSourcePaneContext } from '../utils/panel-context';
import { DataSourceFilter } from '../components/DataSourceFilter';
import { DataSourceOperations } from '../components/DataSourceOperations';
import { DataSourceList } from '../components/DataSourceList';
import { generateClassName } from '../utils/misc';
import { DataSourceForm } from '../components/DataSourceForm';
import { DataSourceExport as ExportDetail } from '../components/DataSourceExport';
import { DataSourceImport as ImportDetail } from '../components/DataSourceImport';
import { DataSourcePanelMode } from '../types';
import type {
  DataSourceInfoTag,
  DataSourcePaneImportPlugin,
  DataSourceType,
} from '../types';

export interface DataSourcePaneProps {
  className?: string;
  style?: React.CSSProperties;
  /** 自定义数据源 */
  formComponents?: any[];
  /** 数据源类型定义 */
  dataSourceTypes?: DataSourceType[];
  /** 导入插件 */
  importPlugins?: DataSourcePaneImportPlugin[];
  /** 导出插件 */
  exportPlugins?: DataSourcePaneImportPlugin[];
  /** 默认的协议 */
  initialSchema?: DataSource;
  /** 协议变化事件处理 */
  onSchemaChange?: (schema: DataSource) => void;
  /** 导出事件处理 */
  onExport?: (dataSourceConfigList: DataSourceConfig[]) => void;
  // TODO
  helpLink?: string;
  /** 渲染数据源信息标签 */
  renderDataSourceInfoTags?: (
    dataSource: DataSourceConfig
  ) => DataSourceInfoTag[];
}

export interface DataSourcePaneState {
  // TOOD
  current: any;
  listMode: DataSourcePanelMode;
}

export class DataSourcePane extends PureComponent<
  DataSourcePaneProps,
  DataSourcePaneState
> {
  static contextType = DataSourcePaneContext;

  private serviceS: any;

  state: DataSourcePaneState = {
    // TODO
    current: createStateMachine(this.props.initialSchema?.list).initialState,
    listMode: DataSourcePanelMode.NORMAL,
  };

  detailRef ?= createRef<DataSourceForm>();

  exportRef ?= createRef<ExportDetail>();

  importRef ?= createRef<ImportDetail>();

  private send = (...args: any[]) => {
    this.context.stateService.send(...args);
  };

  componentDidMount() {
    this.serviceS = this.context?.stateService?.subscribe?.((state: any) => {
      this.setState({ current: state });
      // 监听导入成功事件
      if (state.changed && (state.value === 'idle' || state.event?.type === 'FINISH_IMPORT')) {
        // TODO add hook
        this.props.onSchemaChange?.({
          list: state.context.dataSourceList,
        });
      }
    });
    setTimeout(() => {
      this.send({ type: 'UPDATE_DS', payload: this.props.initialSchema?.list });
    }, 80);
  }

  componentWillUnmount() {
    this.serviceS?.unsubscribe?.();
  }

  handleStartSort = () => {
    this.send({ type: 'START_SORT' });
  };

  handleFinishSort = () => {
    this.send('FINISH_SORT');
  };

  handleCancelSort = () => {
    this.send('CANCEL_SORT');
  };

  handleCancelExport = () => {
    this.send('FINISH_EXPORT');
  };

  handleStartExport = () => {
    this.send('START_EXPORT');
  };

  handleFinishExport = () => {
    // TODO
    const { context } = this.state.current;
    const target = context.dataSourceList.filter(
      (item: any) => context.export.selectedDataSourceIdList.indexOf(item.id) !== -1,
    );
    this.props?.onExport?.(target);
    this.send({
      type: 'SHOW_EXPORT_DETAIL',
      payload: { dataSourceList: target },
    });
  };

  handleOperationClick = (operationType: string, dataSourceId: string) => {
    const { dataSourceTypes } = this.props;

    if (operationType === 'view') {
      this.send({
        type: 'START_VIEW',
        dataSourceId,
        dataSourceTypes,
      });
    }
    if (operationType === 'edit') {
      this.send({
        type: 'START_EDIT',
        dataSourceId,
        dataSourceTypes,
      });
    }
    if (operationType === 'duplicate') {
      this.send({
        type: 'START_DUPLICATE',
        dataSourceId,
        dataSourceTypes,
      });
    }
    if (operationType === 'remove') {
      Dialog.confirm({
        content: '确定要删除吗？',
        onOk: () => {
          this.send({ type: 'REMOVE', dataSourceId });
        },
      });
    }
  };

  handleImport = (importPluginName: string) => {
    this.send({ type: 'SHOW_IMPORT_DETAIL', pluginName: importPluginName });
  };

  handleFilterChange = (keyword: string, dataSourceType: string) => {
    this.send({ type: 'FILTER_CHANGE', payload: { dataSourceType, keyword } });
  };

  handleOperationCancel = () => {
    this.send({ type: 'DETAIL_CANCEL' });
  };

  handleCreate = (dataSourceType: string) => {
    const { dataSourceTypes } = this.props;
    this.send({
      type: 'START_CREATE',
      dataSourceType: dataSourceTypes!.find((i) => i.type === dataSourceType),
    });
  };

  handleOperationFinish = () => {
    const { current } = this.state;
    if (current.matches('detail.create')) {
      this.detailRef?.current?.submit().then((data) => {
        if (data) {
          this.send({
            type: 'FINISH_CREATE',
            payload: data,
          });
        }
      });
    } else if (current.matches('detail.edit')) {
      this.detailRef?.current?.submit().then((data) => {
        this.send({
          type: 'FINISH_EDIT',
          payload: data,
        });
      });
    } else if (current.matches('detail.export')) {
      this.exportRef?.current?.submit().then(() => {
        this.send('FINISH_EDIT');
      });
    } else if (current.matches('detail.import')) {
      this.importRef?.current?.submit().then((data) => {
        const importDataSourceList = () => {
          this.send({
            type: 'FINISH_IMPORT',
            payload: data,
          });
        };
        if (!_isArray(data) || data.length === 0) {
          Message.error('没有找到可导入的数据源');
          return;
        }
        const repeatedDataSourceList = data.filter(
          (item) => !!this.state.current.context.dataSourceList.find(
            (dataSource: DataSourceConfig) => dataSource.id === item.id,
          ),
        );
        if (repeatedDataSourceList.length > 0) {
          Dialog.confirm({
            content: `数据源（${repeatedDataSourceList
              .map((item) => item.id)
              .join('，')}）已存在，如果导入会替换原数据源，是否继续？`,
            onOk: () => {
              importDataSourceList();
            },
          });
          return;
        }
        importDataSourceList();
      }).catch(err => {
        console.warn(err?.message);
      });
    }
  };

  renderDetail = () => {
    const { current } = this.state;
    const { dataSourceTypes = [], importPlugins = [], exportPlugins = [], formComponents = [] } = this.props;
    let content = null;

    if (current.matches('detail.edit')) {
      content = (
        <DataSourceForm
          ref={this.detailRef}
          dataSourceType={current.context.detail?.data?.dataSourceType}
          dataSource={current.context.detail?.data?.dataSource}
          dataSourceList={current.context.dataSourceList}
          mode="edit"
        />
      );
    } else if (current.matches('detail.view')) {
      content = (
        <DataSourceForm
          ref={this.detailRef}
          readonly
          dataSourceType={current.context.detail.data.dataSourceType}
          dataSource={current.context.detail.data.dataSource}
          dataSourceList={current.context.dataSourceList}
        />
      );
    } else if (current.matches('detail.create')) {
      content = (
        <DataSourceForm
          ref={this.detailRef}
          dataSourceType={current.context.detail.data.dataSourceType}
          dataSource={current.context.detail.data.dataSource}
          dataSourceList={current.context.dataSourceList}
          mode="create"
        />
      );
    } else if (current.matches('detail.import')) {
      // TODO
      // pluginName
      const currentPluginName = current.context.detail?.data?.pluginName?.name;
      const importPlugin = importPlugins?.find((item) => item.name === currentPluginName);
      const Component = (importPlugin ? importPlugin.component : ImportDetail) as React.ElementType;
      content = <Component dataSourceTypes={dataSourceTypes} ref={this.importRef} />;

    } else if (current.matches('detail.export')) {
      // TODO
      content = (
        <ExportDetail
          ref={this.exportRef}
          dataSourceTypes={dataSourceTypes}
          dataSourceList={current.context.detail.data.dataSourceList}
        />
      );
    }
    if (!current.matches('detail') || !current.context.detail.visible) {
      return null;
    }
    return (
      <div className={generateClassName('detail')}>
        <div className={generateClassName('detail-header')}>
          <span className={generateClassName('detail-title')}>
            {current.context.detail.title}
          </span>
          <div className={generateClassName('detail-actions')}>
            {current.context.detail.ok !== false && (
              <Button text type="primary" onClick={this.handleOperationFinish}>
                {current.context.detail.okText || '确认'}
              </Button>
            )}
            <Button text onClick={this.handleOperationCancel}>
              {current.context.detail.cancelText || '取消'}
            </Button>
          </div>
        </div>
        <div className={generateClassName('detail-body')}>{content}</div>
      </div>
    );
  };

  render() {
    const {
      renderDataSourceInfoTags,
      style = {},
      className = '',
      helpLink = '',
      dataSourceTypes = [],
      importPlugins = [],
    } = this.props;
    const { current, listMode } = this.state;

    if (!dataSourceTypes || dataSourceTypes.length === 0) {
      return (
        <div className={generateClassName('error')}>没有找到数据源类型</div>
      );
    }

    let mode: DataSourcePanelMode = listMode;

    if (current.matches('sort')) {
      mode = DataSourcePanelMode.SORTING;
    } else if (current.matches('export')) {
      mode = DataSourcePanelMode.EXPORTING;
    }

    const isEmpty = current.context.dataSourceList.length === 0;

    return (
      <DndProvider backend={HTML5Backend}>
        <div
          className={cn(generateClassName('container'), className)}
          style={style}
        >
          <div className={generateClassName('title')}>
            数据源
            {helpLink && <Button component="a" href={helpLink}>使用帮助</Button>}
          </div>
          <DataSourceFilter
            key={current.context.dataSourceListFilter.renderKey}
            dataSourceTypes={dataSourceTypes}
            onFilter={this.handleFilterChange}
          />
          <DataSourceOperations
            dataSource={current.context.dataSourceList}
            empty={isEmpty}
            importPlugins={importPlugins}
            dataSourceTypes={dataSourceTypes}
            onCreate={this.handleCreate}
            onStartExport={this.handleStartExport}
            onCancelExport={this.handleCancelExport}
            onFinishExport={this.handleFinishExport}
            onStartSort={this.handleStartSort}
            onCancelSort={this.handleCancelSort}
            onFinishSort={this.handleFinishSort}
            onImport={this.handleImport}
            mode={mode}
            selectedList={current.context.export.selectedDataSourceIdList}
          />
          <div className={generateClassName('list')}>
            <DataSourceList
              renderItemInfoTags={renderDataSourceInfoTags}
              dataSource={current.context.dataSourceList.filter((i: DataSourceConfig) => {
                return (
                  i.id.indexOf(current.context.dataSourceListFilter.keyword) !==
                  -1 &&
                  (!current.context.dataSourceListFilter.dataSourceType ||
                    current.context.dataSourceListFilter.dataSourceType ===
                    i.type)
                );
              })}
              onOperationClick={this.handleOperationClick}
            />
          </div>
          {this.renderDetail()}
        </div>
      </DndProvider>
    );
  }
}
