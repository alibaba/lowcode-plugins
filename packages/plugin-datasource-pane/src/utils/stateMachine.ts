import { createMachine, interpret, assign } from 'xstate';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@alilc/lowcode-datasource-types';
import _uniqueId from 'lodash/uniqueId';
import { DataSourceType } from '../types';

export interface DataSourcePaneStateContext {
  dataSourceList: DataSourceConfig[];
  dataSourceListFilter: {
    type?: DataSourceType;
    keyword: string;
    renderKey: number;
  };
  detail: {
    visible: boolean;
    title?: string;
    target?: string;
    ok?: boolean;
    okText?: string;
    cancelText?: string;
    data?: any;
  };
  sort: {
    dataSourceList: DataSourceConfig[];
  };
  export: {
    selectedDataSourceIdList: string[];
  };
}
type DataSourcePaneStateEvent =
  | { type: 'START_DUPLICATE' }
  | { type: 'FINISH_IMPORT' }
  | { type: 'SHOW_EXPORT_DETAIL' }
  | { type: 'SHOW_IMPORT_DETAIL' }
  | { type: 'START_EXPORT' }
  | { type: 'START_SORT' }
  | { type: 'START_CREATE' }
  | { type: 'DETAIL_CANCEL' }
  | { type: 'START_EDIT' }
  | { type: 'FILTER_CHANGE' }
  | { type: 'FINISH_SORT' }
  | { type: 'SORT_UPDATE' }
  | { type: 'FINISH_EXPORT' }
  | { type: 'FINISH_CREATE' }
  | { type: 'FINISH_EDIT' }
  | { type: 'UPDATE_DS' }
  | { type: 'REMOVE' }
  | { type: 'START_EXPORT' }
  | { type: 'SAVE_SORT' }
  | { type: 'CANCEL_SORT' }
  | { type: 'START_VIEW' }
  | { type: 'EXPORT.toggleSelect' };

export const createStateMachine = (dataSourceList: DataSourceConfig[] = []) => createMachine<DataSourcePaneStateContext, DataSourcePaneStateEvent>(
    {
      id: 'dataSourcePane',
      initial: 'idle',
      states: {
        idle: {
          on: {
            UPDATE_DS: {
              actions: assign({
                dataSourceList: (context, event) => {
                  return event.payload;
                },
              }),
            },
          },
        },
        sort: {
          on: {
            CANCEL_SORT: 'idle',
            SAVE_SORT: {
              actions: assign({
                sort: (context, event) => {
                  return {
                    dataSourceList: event.payload,
                  };
                },
              }),
            },
            FINISH_SORT: {
              target: 'idle',
              actions: assign({
                dataSourceList: (context, event) => {
                  return context.sort.dataSourceList;
                },
              }),
            },
          },
        },
        exit: {
          type: 'final',
        },
        export: {
          on: {
            FINISH_EXPORT: {
              target: 'idle',
              actions: assign({
                export: (context, event) => ({
                  selectedDataSourceIdList: [],
                }),
              }),
            },
            'EXPORT.toggleSelect': {
              actions: assign({
                export: (context, event) => {
                  const { selectedDataSourceIdList } = context.export;
                  const index = selectedDataSourceIdList.indexOf(
                    event.dataSourceId,
                  );
                  if (index !== -1) {
                    return {
                      selectedDataSourceIdList: selectedDataSourceIdList
                        .slice(0, index)
                        .concat(selectedDataSourceIdList.slice(index + 1)),
                    };
                  }
                  return {
                    selectedDataSourceIdList:
                      context.export.selectedDataSourceIdList.concat(
                        event.dataSourceId,
                      ),
                  };
                },
              }),
            },
            SHOW_EXPORT_DETAIL: {
              target: 'detail.export',
              actions: assign({
                detail: (context, event) => {
                  return {
                    visible: true,
                    title: '导出',
                    // okText: '创建',
                    target: 'export',
                    data: event.payload,
                  };
                },
              }),
            },
          },
        },
        detail: {
          initial: 'idle',
          on: {
            DETAIL_CANCEL: {
              target: 'idle',
              actions: assign({
                detail: {
                  visible: false,
                },
              }),
            },
          },
          states: {
            idle: {},
            view: {},
            import: {
              on: {
                FINISH_IMPORT: {
                  target: 'idle',
                  actions: assign({
                    dataSourceList: (context, event) => {
                      // 直接 concat 会出现重复
                      const filterDataSourceList = context.dataSourceList.filter((item) => {
                        return !event.payload.find(
                          (dataSource: DataSourceConfig) => dataSource.id === item.id,
                        )
                      })

                      return filterDataSourceList.concat(event.payload);
                    },
                    detail: {
                      visible: false,
                    },
                  }),
                },
              },
            },
            export: {},
            create: {
              on: {
                /* FINISH_CREATE: {
                            target: 'idle',
                            actions: assign({
                                dataSourceList: (context, event) => {
                                    return context.dataSourceList.concat(event.payload);
                                },
                                detail: {
                                    visible: false
                                }
                            })
                        }, */
              },
            },
            edit: {
              on: {
                /* FINISH_EDIT: {
                            type: 'idle',
                            actions: assign({
                                dataSourceList: (context, event) => {
                                    const nextDataSourceList = [...context.dataSourceList];
                                    const id = context.detail.data.dataSourceId;
                                    const dataSourceUpdateIndex = _findIndex(nextDataSourceList, (dataSource) => dataSource.id === id);
                                    nextDataSourceList[dataSourceUpdateIndex] = event.payload;
                                    return nextDataSourceList;
                                },
                                detail: {
                                    visible: false
                                }
                            })
                        }, */
              },
            },
          },
        },
      },
      context: {
        dataSourceList,
        dataSourceListFilter: {
          type: '',
          keyword: '',
          renderKey: 1,
        },
        detail: {
          visible: false,
          target: 'idle',
        },
        sort: {
          dataSourceList: [],
        },
        export: {
          selectedDataSourceIdList: [],
        },
      },
      on: {
        FINISH_CREATE: {
          target: 'idle',
          actions: assign({
            dataSourceList: (context, event) => {
              return context.dataSourceList.concat(event.payload);
            },
            detail: {
              visible: false,
            },
          }),
        },
        FINISH_EDIT: {
          target: 'idle',
          actions: assign({
            dataSourceList: (context, event) => {
              const dataSourceList =
                context.dataSourceList as DataSourceConfig[];

              const { id } = context.detail.data.dataSource;
              const dataSourceUpdateIndex = dataSourceList.findIndex(
                (dataSource) => {
                  return dataSource.id === id;
                },
              );
              dataSourceList[dataSourceUpdateIndex] = event.payload;
              return dataSourceList;
            },
            detail: {
              visible: false,
            },
          }),
        },

        START_EXPORT: 'export',
        START_SORT: {
          target: 'sort',
          actions: assign({
            dataSourceListFilter: (context, event) => {
              return {
                keyword: '',
                type: '',
                renderKey: context.dataSourceListFilter.renderKey + 1,
              };
            },
          }),
        },
        REMOVE: {
          actions: assign({
            dataSourceList: (context, event) => {
              return context.dataSourceList.filter(
                (item) => item.id !== event.dataSourceId,
              );
            },
          }),
        },
        START_CREATE: {
          target: 'detail.create',
          actions: assign({
            detail: (context, event) => ({
              visible: true,
              title: `创建数据源 ${event.dataSourceType.type}`,
              okText: '创建',
              // target: 'FINISH_CREATE',
              data: {
                dataSourceType: event.dataSourceType,
              },
            }),
          }),
        },
        START_EDIT: {
          target: 'detail.edit',
          actions: assign({
            detail: (context, event) => {
              const dataSource = context.dataSourceList.find(
                (item) => item.id === event.dataSourceId,
              );
              const dataSourceType = event.dataSourceTypes.find(
                (i) => i.type === dataSource.type,
              );
              return {
                visible: true,
                title: `编辑数据源 ${dataSourceType.type}`,
                data: {
                  dataSource,
                  dataSourceType,
                },
              };
            },
          }),
        },
        START_VIEW: {
          target: 'detail.view',
          actions: assign({
            detail: (context, event) => {
              const dataSource = context.dataSourceList.find(
                (item) => item.id === event.dataSourceId,
              );
              return {
                visible: true,
                title: '查看数据源',
                ok: false,
                cancelText: '关闭',
                data: {
                  dataSource,
                  dataSourceType: event.dataSourceTypes.find(
                    (i) => i.type === dataSource.type,
                  ),
                },
              };
            },
          }),
        },
        START_DUPLICATE: {
          target: 'detail.create',
          actions: assign({
            detail: (context, event) => {
              const dataSource = context.dataSourceList.find(
                (item) => item.id === event.dataSourceId,
              );
              return {
                visible: true,
                title: '复制数据源',
                data: {
                  dataSource: {
                    ...dataSource,
                    id: _uniqueId(`${event.dataSourceId}_`),
                  },
                  dataSourceType: event.dataSourceTypes.find(
                    (i) => i.type === dataSource.type,
                  ),
                },
              };
            },
          }),
        },
        FILTER_CHANGE: {
          actions: assign({
            dataSourceListFilter: (context, event) => {
              return {
                ...context.dataSourceListFilter,
                ...event.payload,
              };
            },
          }),
        },
        SHOW_IMPORT_DETAIL: {
          target: 'detail.import',
          actions: assign({
            detail: (context, event) => {
              return {
                visible: true,
                title: '导入',
                data: {
                  pluginName: event.pluginName,
                },
              };
            },
          }),
        },
      },
    },
    {
      actions: {},
    },
  );

export const createStateService = () => interpret(createStateMachine()).onTransition((current) => {
    // console.log('current transition list', current.value);
  });
