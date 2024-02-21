import * as React from 'react';
import {
  IPublicModelPluginContext,
  IPublicModelResource,
  IPublicTypeSkeletonConfig,
  IPublicTypeContextMenuAction,
} from '@alilc/lowcode-types';
import Icon from './icon';
import { Pane } from './pane';
import './index.scss';
import { intl } from './locale';

export interface IOptions {
  init?: (ctx: IPublicModelPluginContext) => {};

  renderAddFileComponent?: () => React.JSX.Element;

  handleClose?: (force?: boolean) => void;

  filterResourceList?: () => {};

  showIconText?: boolean;

  skeletonConfig?: IPublicTypeSkeletonConfig;

  /**
   * 右键菜单项
   */
  contextMenuActions?: (ctx: IPublicModelPluginContext) => IPublicTypeContextMenuAction[];

  /**
   * 右键资源项，菜单项
   */
  resourceContextMenuActions?: (ctx: IPublicModelPluginContext, resource: IPublicModelResource) => IPublicTypeContextMenuAction[];

  /**
   * 右键资源组，菜单项
   */
  resourceGroupContextMenuActions?: (ctx: IPublicModelPluginContext, resources: IPublicModelResource[]) => IPublicTypeContextMenuAction[];
}

const ViewManagerPane = (
  ctx: IPublicModelPluginContext,
  options: IOptions = {}
) => {
  return {
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    async init() {
      const showIconText = options.showIconText ?? true;
      // 往引擎增加面板
      ctx.skeleton.add({
        area: 'leftArea',
        name: 'ViewManagerPane',
        props: {
          icon: <Icon showIconText={showIconText} />,
          description: intl('view_manager.src.ViewManagement'),
          className: `workspace-view-pane-icon ${showIconText ? 'show-icon-text' : null }`,
        },
        panelProps: {
          width: '200px',
        },
        content: Pane,
        contentProps: {
          options: {
            handleClose: () => {
              ctx.skeleton.hidePanel('ViewManagerPane');
            },
            ...options,
          },
          pluginContext: ctx,
        },
        ...(options.skeletonConfig || {}),
        type: options.skeletonConfig?.type || 'PanelDock',
      });
    },
  };
};

// 插件名，注册环境下唯一
ViewManagerPane.pluginName = 'ViewManagerPane';
ViewManagerPane.meta = {
  // 依赖的插件（插件名数组）
  dependencies: [],
  engines: {
    lowcodeEngine: '^1.3.0', // 插件需要配合 ^1.0.0 的引擎才可运行
  },
  preferenceDeclaration: {
    title: intl('view_manager.src.ViewManagementPanelPlugIn'),
    properties: [
      {
        key: 'init',
        type: 'function',
        description: '',
      },
      {
        key: 'handleClose',
        type: 'function',
        description: '',
      },
      {
        key: 'showIconText',
        type: 'boolean',
        description: '',
      },
      {
        key: 'skeletonConfig',
        type: 'object',
        description: '',
      },
      {
        key: 'contextMenuActions',
        type: 'function',
        description: '右键菜单项',
      },
      {
        key: 'resourceContextMenuActions',
        type: 'function',
        description: '右键资源项，菜单项',
      },
      {
        key: 'resourceGroupContextMenuActions',
        type: 'function',
        description: '右键资源组，菜单项',
      },
      {
        key: 'filterResourceList',
        type: 'function',
        description: '',
      },
      {
        key: 'showIconText',
        type: 'boolean',
        description: '',
      },
      {
        key: 'skeletonConfig',
        type: 'object',
        description: '',
      }
    ],
  },
};

export default ViewManagerPane;
