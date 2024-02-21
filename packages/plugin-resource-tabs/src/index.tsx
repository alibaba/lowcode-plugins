import { Tab, Dialog } from '@alifd/next';
import {
  IPublicModelPluginContext,
  IPublicModelResource,
  IPublicModelWindow,
  IPublicTypePlugin,
} from '@alilc/lowcode-types';
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import './index.scss';
import { CloseIcon, LockIcon, WarnIcon } from './icon';
import { intl } from './locale';

function CustomTabItem(props: {
  icon: any;
  title: string;
  onClose: () => void;
  key: string;
  ctx: IPublicModelPluginContext;
  id: string;
}) {
  const { id: propsId } = props;
  const { event } = props.ctx;
  const [changed, setChanged] = useState(false);
  const [locked, setLocked] = useState(false);
  const [warned, setWarned] = useState(false);
  const [title, setTitle] = useState(props.title);
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
  const ResourceIcon = props.icon;
  return (
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
                onCancel: () => {
                  props.onClose();
                },
                cancelProps: {
                  children: intl('resource_tabs.src.DiscardChanges'),
                },
                okProps: {
                  children: intl('resource_tabs.src.ContinueEditing'),
                },
              });
              return;
            }
            props.onClose();
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
  );
}

interface ITabItem {
  id: string;
  windowId: string;
}

function Content(props: {
  ctx: IPublicModelPluginContext;
  appKey?: string;
  onSort?: (windows: IPublicModelWindow[]) => IPublicModelWindow[];
  shape?: 'pure' | 'wrapped' | 'text' | 'capsule';
  tabClassName?: string;
}) {
  const { ctx } = props;
  const { workspace } = ctx;

  const [resourceListMap, setResourceListMap] = useState<{
    [key: string]: IPublicModelResource;
  }>({});

  const getTabs = useCallback((): ITabItem[] => {
    let windows = workspace.windows;
    if (props.onSort) {
      windows = props.onSort(workspace.windows);
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
      '___lowcode_plugin_resource_tabs___' + props.appKey,
      JSON.stringify(getTabs())
    );
    localStorage.setItem(
      '___lowcode_plugin_resource_tabs_active_title___' + props.appKey,
      JSON.stringify({
        id:
          workspace.window?.resource.id ||
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
        workspace.window?.resource.id || workspace.window?.resource?.options.id
      );
      saveTabsToLocal();
    });
  }, []);

  useEffect(() => {
    const initResourceListMap = () => {
      const resourceListMap = {};
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
          '___lowcode_plugin_resource_tabs___' + props.appKey
        )
      );
      const activeValue: {
        id: string;
      } = JSON.parse(
        localStorage.getItem(
          '___lowcode_plugin_resource_tabs_active_title___' + props.appKey
        )
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

  return (
    <Tab
      size="small"
      activeKey={activeTitle}
      shape={props.shape || 'wrapped'}
      animation={false}
      className={`${props.tabClassName} resource-tabs`}
      excessMode="slide"
      disableKeyboard={true}
      contentStyle={{
        height: 0,
      }}
      tabRender={(
        key,
        props: {
          key: string;
          title: string;
          icon: any;
          onClose: () => void;
          value: string;
        }
      ) => (
        <CustomTabItem
          key={key}
          icon={props.icon}
          title={props.title}
          onClose={props.onClose}
          id={props.value}
          ctx={ctx}
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
            title={resource.title}
            // @ts-ignore
            icon={resource.icon}
            value={item.windowId}
            onClose={() => {
              (workspace as any).removeEditorWindow(resource);
            }}
          />
        );
      })}
    </Tab>
  );
}

const resourceTabs: IPublicTypePlugin = function (
  ctx: IPublicModelPluginContext,
  options: {
    appKey?: string;
    onSort?: (windows: IPublicModelWindow[]) => IPublicModelWindow[];
    shape?: string;
    tabClassName?: string;
  }
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
          ctx,
          appKey: options?.appKey,
          onSort: options?.onSort,
          shape: options?.shape,
          tabClassName: options?.tabClassName,
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
    ],
  },
};

export default resourceTabs;
