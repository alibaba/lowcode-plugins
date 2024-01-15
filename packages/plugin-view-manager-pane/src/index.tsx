import * as React from 'react';
import {
  IPublicModelPluginContext,
  IPublicModelResource,
  IPublicTypeSkeletonConfig,
} from '@alilc/lowcode-types';
import Icon from './icon';
import { Pane } from './pane';
import './index.scss';
import { intl } from './locale';

export interface IOptions {
  init?: (ctx: IPublicModelPluginContext) => {};

  renderAddFileComponent?: () => React.JSX.Element;

  onAddPage?: () => {};

  onDeletePage?: (resource: IPublicModelResource) => {};

  onEditPage?: (resource: IPublicModelResource) => {};

  onCopyPage?: (resource: IPublicModelResource) => {};

  onAddComponent?: () => {};

  onEditComponent?: (resource: IPublicModelResource) => {};

  onCopyComponent?: (resource: IPublicModelResource) => {};

  onDeleteComponent?: (resource: IPublicModelResource) => {};

  handleClose?: (force?: boolean) => void;

  filterResourceList?: () => {};

  showIconText?: boolean;

  skeletonConfig?: IPublicTypeSkeletonConfig;
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
    lowcodeEngine: '^1.0.0', // 插件需要配合 ^1.0.0 的引擎才可运行
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
        key: 'onAddPage',
        type: 'function',
        description: '',
      },
      {
        key: 'onDeletePage',
        type: 'function',
        description: '',
      },
      {
        key: 'onEditPage',
        type: 'function',
        description: '',
      },
      {
        key: 'onCopyPage',
        type: 'function',
        description: '',
      },
      {
        key: 'onAddComponent',
        type: 'function',
        description: '',
      },
      {
        key: 'onEditComponent',
        type: 'function',
        description: '',
      },
      {
        key: 'onCopyComponent',
        type: 'function',
        description: '',
      },
      {
        key: 'onDeleteComponent',
        type: 'function',
        description: '',
      },
      {
        key: 'handleClose',
        type: 'function',
        description: '',
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
