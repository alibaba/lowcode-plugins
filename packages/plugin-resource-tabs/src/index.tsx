import { Tab, Dialog } from '@alifd/next';
import {
  IPublicModelPluginContext,
  IPublicModelResource,
  IPublicModelWindow,
  IPublicTypeContextMenuAction,
  IPublicTypePlugin,
} from '@alilc/lowcode-types';
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import './index.scss';
import { CloseIcon, LockIcon, WarnIcon } from './icon';
import { intl } from './locale';

function CustomTabItem(props: {
  key: string;
  pluginContext: IPublicModelPluginContext;
  options: IOptions;
  resource: IPublicModelResource;
}): React.ReactElement {
  const { resource } = props;
  const { icon: ResourceIcon } = resource;
  const propsId = resource.id || resource.options.id;
  const { event } = props.pluginContext;
  const [changed, setChanged] = useState(false);
  const [locked, setLocked] = useState(false);
  const [warned, setWarned] = useState(false);
  const [title, setTitle] = useState(resource.title);
  const onClose = useCallback(() => {
    props.pluginContext.workspace.removeEditorWindow(resource);
  }, []);
  useEffect(() => {
    event.on('common:windowChanged', (id, changed) => {
      if (propsId === id) {
        setChanged(changed);
      }
    });

    event.on('common:windowLock', (id, locked) => {
      if (propsId === id) {
        setLocked(locked);
      }
    });

    event.on('common:windowWarn', (id, warned) => {
      if (propsId === id) {
        setWarned(warned);
      }
    });

    event.on('common:windowSave', (id, warned) => {
      if (propsId === id) {
        setWarned(false);
      }
    });

    event.on('common:titleChanged', (id, title) => {
      if (propsId === id) {
        setTitle(title);
      }
    });
  }, []);
  const ContextMenu = props.pluginContext?.commonUI?.ContextMenu || React.Fragment;
  return (
    <ContextMenu menus={props.options?.tabContextMenuActions?.(props.pluginContext, resource) || []}>
      <div className="next-tabs-tab-inner resource-tab-item">
        <div className="resource-tab-item-resource-icon">
          {ResourceIcon ? <ResourceIcon /> : null}
        </div>
        <div className="resource-tab-item-title">{title}</div>
        <div className="resource-tab-item-tips">
          <div
            onClick={async (e) => {
              e.stopPropagation();
              if (changed) {
                Dialog.show({
                  v2: true,
                  title: intl('resource_tabs.src.Warning'),
                  content: intl('resource_tabs.src.TheCurrentWindowHasUnsaved'),
                  onOk: () => {},
                  onCancel: onClose,
                  cancelProps: {
                    children: intl('resource_tabs.src.DiscardChanges'),
                  },
                  okProps: {
                    children: intl('resource_tabs.src.ContinueEditing'),
                  },
                });
                return;
              }
              onClose();
            }}
            className="resource-tab-item-close-icon"
          >
            <CloseIcon />
          </div>
          <div className="resource-tab-item-others">
            {changed && !warned ? (
              <span className="resource-tab-item-changed-icon"></span>
            ) : null}

            {locked ? <LockIcon /> : null}

            {warned ? <WarnIcon /> : null}
          </div>
        </div>
      </div>
    </ContextMenu>
  );
}

interface ITabItem {
  id: string;
  windowId: string;
}

function Content(props: {
  pluginContext: IPublicModelPluginContext;
  options: IOptions;
}) {
  const { pluginContext, options } = props;
  const {
    onSort,
    appKey,
    shape,
    tabClassName,
  } = options;
  const { workspace } = pluginContext;

  const [resourceListMap, setResourceListMap] = useState<{
    [key: string]: IPublicModelResource;
  }>({});

  const getTabs = useCallback((): ITabItem[] => {
    let windows = workspace.windows;
    if (onSort) {
      windows = onSort(workspace.windows);
    }

    return windows.map((d) => {
      return {
        id: d.resource?.id || d.resource?.options.id,
        windowId: d.id,
      };
    });
  }, []);

  const [tabs, setTabs] = useState(getTabs());
  const [activeTitle, setActiveTitle] = useState(
    workspace.window?.resource?.id || workspace.window?.resource?.options?.id
  );

  const saveTabsToLocal = useCallback(() => {
    localStorage.setItem(
      '___lowcode_plugin_resource_tabs___' + appKey,
      JSON.stringify(getTabs())
    );
    localStorage.setItem(
      '___lowcode_plugin_resource_tabs_active_title___' + appKey,
      JSON.stringify({
        id:
          workspace.window?.resource?.id ||
          workspace.window?.resource?.options.id,
      })
    );
  }, []);

  const initEvent = useCallback<() => void>(() => {
    workspace.onChangeWindows(() => {
      setTabs(getTabs());
      saveTabsToLocal();
    });
    workspace.onChangeActiveWindow(() => {
      setActiveTitle(
        workspace.window?.resource?.id || workspace.window?.resource?.options.id
      );
      saveTabsToLocal();
    });
  }, []);

  useEffect(() => {
    const initResourceListMap = () => {
      const resourceListMap: {
        [key: string]: IPublicModelResource;
      } = {};
      workspace.resourceList.forEach((d) => {
        resourceListMap[d.id || d.options.id] = d;
      });
      setResourceListMap(resourceListMap);
    };

    if (workspace.resourceList) {
      initResourceListMap();
    }
    return workspace.onResourceListChange(() => {
      initResourceListMap();
    });
  }, []);
  useEffect(() => {
    try {
      if (!Object.keys(resourceListMap).length || tabs.length) {
        return;
      }
      const value: ITabItem[] = JSON.parse(
        localStorage.getItem(
          '___lowcode_plugin_resource_tabs___' + appKey
        ) || 'null'
      );
      const activeValue: {
        id: string;
      } = JSON.parse(
        localStorage.getItem(
          '___lowcode_plugin_resource_tabs_active_title___' + appKey
        ) || 'null'
      );

      if (value && value.length) {
        value.forEach((d) => {
          const resource = resourceListMap[d.id];
          resource && workspace.openEditorWindow(resource, true);
        });

        setTabs(getTabs());
      }

      initEvent();

      if (activeValue) {
        const resource = resourceListMap[activeValue.id];
        if (resource) {
          workspace.openEditorWindow(resource);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [resourceListMap]);

  const ContextMenu = pluginContext?.commonUI?.ContextMenu || React.Fragment;
  return (
    <ContextMenu menus={props.options.contextMenuActions?.(props.pluginContext) || []}>
      <div>
        <Tab
          size="small"
          activeKey={activeTitle}
          shape={shape || 'wrapped'}
          animation={false}
          className={`${tabClassName} resource-tabs`}
          excessMode="slide"
          disableKeyboard={true}
          contentStyle={{
            height: 0,
          }}
          tabRender={(
            key,
            props: {
              resource: IPublicModelResource;
              key: string;
            }
          ) => (
            <CustomTabItem
              key={key}
              resource={props.resource}
              pluginContext={pluginContext}
              options={options}
            />
          )}
          onChange={(name) => {
            setActiveTitle(name);
            const item = tabs.filter((d) => String(d.id) === String(name))?.[0];
            const resource = resourceListMap[item.id];
            workspace.openEditorWindow(resource);
          }}
        >
          {tabs.map((item) => {
            const resource = resourceListMap[item.id];
            if (!resource) {
              return null;
            }

            return (
              <Tab.Item
                key={resource.id || resource.options.id}
                // @ts-ignore
                resource={resource}
              />
            );
          })}
        </Tab>
      </div>
    </ContextMenu>
  );
}

interface IOptions {
  appKey?: string;
  onSort?: (windows: IPublicModelWindow[]) => IPublicModelWindow[];
  shape?: 'pure' | 'wrapped' | 'text' | 'capsule';
  tabClassName?: string;
  /**
   * 右键菜单项
   */
  contextMenuActions: (ctx: IPublicModelPluginContext) => IPublicTypeContextMenuAction[];
  /**
   * 右键 Tab 菜单项
   */
  tabContextMenuActions: (ctx: IPublicModelPluginContext, resource: IPublicModelResource) => IPublicTypeContextMenuAction[];
}

const resourceTabs: IPublicTypePlugin = function (
  ctx: IPublicModelPluginContext,
  options: IOptions,
) {
  const { skeleton } = ctx;
  return {
    async init() {
      skeleton.add({
        area: 'subTopArea',
        type: 'Widget',
        name: 'resourceTabs',
        props: {
          align: 'left',
          width: 800,
        },
        index: -1,
        content: Content,
        contentProps: {
          pluginContext: ctx,
          options,
        },
      });
    },
  };
};

resourceTabs.pluginName = 'resourceTabs';

resourceTabs.meta = {
  preferenceDeclaration: {
    title: intl('resource_tabs.src.ApplicationTagColumnPlugIn'),
    properties: [
      {
        key: 'appKey',
        type: 'string',
        description: intl(
          'resource_tabs.src.UniqueIdentifierForCachingApplication'
        ),
      },
      {
        key: 'onSort',
        type: 'function',
        description: 'tabs sort function',
      },
      {
        key: 'shape',
        type: 'string',
        description: 'Tab shape',
      },
      {
        key: 'tabClassName',
        type: 'string',
        description: 'Tab className',
      },
      {
        key: 'contextMenuActions',
        type: 'function',
        description: '右键菜单项',
      },
      {
        key: 'tabContextMenuActions',
        type: 'function',
        description: '右键 Tab 菜单项',
      }
    ],
  },
  engines: {
    lowcodeEngine: '^1.3.0', // 插件需要配合 ^1.0.0 的引擎才可运行
  },
};

export default resourceTabs;
