import { workspace } from '@alilc/lowcode-engine';
import {
  IPublicModelPluginContext,
  IPublicModelResource,
} from '@alilc/lowcode-types';
import { Search, Overlay, Balloon } from '@alifd/next';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { FileIcon, IconArrowRight } from './icon';
import './index.scss';
import { IOptions } from '../..';
import { intl } from '../../locale';
import { AddFile } from '../addFile';

export function ResourcePaneContent(props: IPluginOptions) {
  const { workspace } = props.pluginContext || {};
  const [resourceList, setResourceList] = useState<IPublicModelResource[] | undefined>(
    workspace?.resourceList
  );
  workspace?.onResourceListChange(() => {
    setResourceList(workspace.resourceList);
  });
  return (
    <ResourceListTree
      resourceList={resourceList}
      defaultExpandedCategoryKeys={props.defaultExpandedCategoryKeys}
      defaultExpandAll={props.defaultExpandAll}
      pluginContext={props.pluginContext}
      behaviors={props.behaviors}
      options={props.options}
    />
  );
}

function ResourceListTree(
  props: {
    resourceList?: IPublicModelResource[];
  } & IPluginOptions
) {
  const [category, setCategory] = useState<{
    [key: string]: IPublicModelResource[];
  }>({});
  const [filterValue, setFilterValue] = useState();
  const [activeId, setActiveId] = useState(
    props.pluginContext?.workspace.window?.resource?.id + ''
  );
  useEffect(() => {
    let category: {
      [key: string]: any;
    } = {};
    props.resourceList?.forEach((d) => {
      category[d.category!] = category[d.category!] || [];
      category[d.category!].push(d);
    });
    setCategory(category);
  }, [props.resourceList]);
  const handleSearchChange = useCallback((key) => {
    setFilterValue(key);
  }, []);
  workspace.onChangeActiveWindow(() => {
    setActiveId(workspace.window?.resource?.id + '');
  });
  return (
    <>
      <div className="resource-tree-filter">
        <Search
          hasClear
          shape="simple"
          placeholder={intl(
            'view_manager.components.resourceTree.SearchPagesAndComponents'
          )}
          className="resource-list-filter-search-input"
          value={filterValue}
          onChange={handleSearchChange}
        />
        <AddFile options={props.options} />
      </div>
      <div className="resource-tree">
        {Array.from(Object.entries(category)).map(
          ([categoryName, resourceArr]) => {
            return (
              <ResourceGroup
                defaultExpandAll={props.defaultExpandAll}
                defaultExpandedCategoryKeys={props.defaultExpandedCategoryKeys}
                activeId={activeId}
                categoryName={categoryName}
                resourceArr={resourceArr}
                filterValue={filterValue}
                pluginContext={props.pluginContext}
                behaviors={props.behaviors}
                options={props.options}
                depth={0}
              />
            );
          }
        )}
      </div>
    </>
  );
}

function ResourceGroup(
  props: {
    activeId?: string;
    categoryName: string;
    resourceArr: IPublicModelResource[];
    filterValue?: string;
    depth: number;
  } & IPluginOptions
) {
  const [expanded, setExpanded] = useState(
    props.defaultExpandAll ||
      props.defaultExpandedCategoryKeys?.includes(props.categoryName)
  );
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  const resourceArr = props.resourceArr.filter(
    (d) =>
      !props.filterValue ||
      [d.options.title, d.options.slug, d.options.componentName].some(
        (d) => d && d.toLowerCase().includes(props.filterValue?.toLowerCase())
      )
  );

  if (!resourceArr || !resourceArr.length) {
    return null;
  }

  if (!props.categoryName || props.categoryName === 'undefined') {
    return (
      <div
        className="resource-tree-group"
        data-depth={props.depth}
      >
        {resourceArr.map((d) => (
          <ResourceItem
            children={d.children}
            icon={d.icon}
            key={d.title}
            activeId={props.activeId}
            resource={d}
            behaviors={props.behaviors}
            options={props.options}
            pluginContext={props.pluginContext}
            depth={props.depth + 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="resource-tree-group"
      data-depth={props.depth}
    >
      <div
        className="resource-tree-group-wrap"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setVisible(!visible);
        }}
        ref={ref}
      >
        <div
          className={`resource-tree-expand ${expanded ? 'expanded' : ''}`}
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <IconArrowRight />
        </div>
        <div className="resource-tree-group-icon">
          <FileIcon />
        </div>
        <div className="resource-tree-group-title">{props.categoryName}</div>
        {
          [intl('view_manager.components.resourceTree.Page'), intl('view_manager.components.resourceTree.Component')].includes(props.categoryName) ? (
            <Overlay
              v2
              visible={visible}
              target={ref?.current}
              onRequestClose={() => {
                setVisible(false);
              }}
              safeNode={ref?.current}
              // @ts-ignore
              placement="br"
              className="view-pane-popup"
            >
              <div>
                <div
                  onClick={(e) => {
                    if (
                      props.categoryName ===
                      intl('view_manager.components.resourceTree.Page')
                    ) {
                      props.options.onAddPage?.();
                    } else {
                      props.options.onAddComponent?.();
                    }
                  }}
                  className="view-pane-popup-item"
                >
                  {intl('view_manager.components.resourceTree.CreateItem', {
                    categoryName: props.categoryName === intl('view_manager.components.resourceTree.Page')
                    ? intl('view_manager.components.resourceTree.Page')
                    : intl('view_manager.components.resourceTree.Component'),
                  })}
                </div>
              </div>
            </Overlay>
          ) : null
        }
      </div>
      {expanded && (
        <div className="resource-tree-children">
          {resourceArr.map((d) => (
            <ResourceItem
              children={d.children}
              icon={d.icon}
              key={d.options.id}
              activeId={props.activeId}
              resource={d}
              behaviors={props.behaviors}
              options={props.options}
              pluginContext={props.pluginContext}
              depth={props.depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceItem(props: {
  resource?: IPublicModelResource;
  icon?: any;
  children?: IPublicModelResource[];
  activeId?: string;
  behaviors?: any;
  options?: IOptions;
  pluginContext?: IPublicModelPluginContext;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const [showBehaviors, setShowBehaviors] = useState(false);
  const PropsIcon = props.icon;
  const Behaviors = props.behaviors;
  const display = (props.resource?.config as any)?.display ?? true;

  const indent = props.depth * 28 + 12;
  const style = {
    paddingLeft: indent,
    marginLeft: -indent,
  }
  if (!display) {
    return null;
  }

  const children = props.children?.filter(d => d.config?.display !== false);

  return (
    <div
      ref={ref}
      className={`resource-tree-group-node ${
        props.resource?.options.isProCodePage
          ? 'resource-tree-group-item-pro-code'
          : ''
      } ${props.activeId === props.resource?.options.id || props.activeId === props.resource?.id ? 'active' : ''}`}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowBehaviors(!showBehaviors);
      }}
      data-depth={props.depth}
    >
      <div
        onClick={() => {
          props.resource && props.pluginContext?.workspace.openEditorWindow(props.resource);
        }}
        className="resource-tree-title"
        style={style}
      >
        {props.resource?.options.modified ? (
          <Balloon
            v2
            trigger={<div className='resource-tree-group-item-modified-wrap'><div className="resource-tree-group-item-modified"></div></div>}
            triggerType="hover"
            align='bl'
            title=""
          >
            {props.resource.options.modifiedTips}
          </Balloon>
        ) : null}

        {((children && children.length) || null) && (
          <div
            className={`resource-tree-expand ${expanded ? 'expanded' : ''}`}
            onClick={(e) => {
              setExpanded(!expanded);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <IconArrowRight />
          </div>
        )}

        <div className="resource-tree-group-item-icon">
          {PropsIcon && <PropsIcon />}
        </div>
        <div className="resource-tree-group-title-label">
          {props.resource?.options?.label || props.resource?.title}
          {props.resource?.options.isProCodePage
            ? intl('view_manager.components.resourceTree.SourceCode')
            : ''}

          {
            props.resource?.options?.slug ||
            props.resource?.options?.componentName ? (
              <span className="resource-tree-group-item-code">
                ({ props.resource.options?.slug || props.resource.options?.componentName })
              </span>
            ) : null
          }
        </div>


        <div className="resource-tree-group-item-behaviors">
          {Behaviors &&
          (props.resource?.config as any)?.disableBehaviors !== true ? (
            <Behaviors
              showBehaviors={showBehaviors}
              resource={props.resource}
              onVisibleChange={(visible: boolean) => {
                setShowBehaviors(visible);
              }}
              safeNode={ref?.current}
            />
          ) : null}
        </div>
      </div>

      {
        expanded && children?.length ? (
          <div className='resource-tree-children'>
            {
              props.children?.map((child) => (
                <ResourceItem
                  children={child.children}
                  icon={child.icon}
                  key={child.id}
                  activeId={props.activeId}
                  resource={child}
                  behaviors={props.behaviors}
                  options={props.options}
                  pluginContext={props.pluginContext}
                  depth={props.depth + 1}
                />
              ))
            }
          </div>
        ) : null
      }
    </div>
  );
}

interface IPluginOptions {
  defaultExpandedCategoryKeys?: string[];
  defaultExpandAll?: boolean;
  pluginContext?: IPublicModelPluginContext;
  behaviors?: any;
  options: IOptions;
}
