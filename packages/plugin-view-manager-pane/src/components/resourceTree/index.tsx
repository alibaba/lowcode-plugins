import { workspace } from '@alilc/lowcode-engine';
import {
  IPublicModelPluginContext,
  IPublicModelResource,
} from '@alilc/lowcode-types';
import { Search, Overlay } from '@alifd/next';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { FileIcon, IconArrowRight } from './icon';
import './index.scss';
import { IOptions } from '../..';
import { intl } from '../../locale';

export function ResourcePaneContent(props: IPluginOptions) {
  const { workspace } = props.pluginContext;
  const [resourceList, setResourceList] = useState<IPublicModelResource[]>(
    workspace.resourceList
  );
  workspace.onResourceListChange(() => {
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
    resourceList: IPublicModelResource[];
  } & Required<IPluginOptions>
) {
  const [category, setCategory] = useState<{
    [key: string]: IPublicModelResource[];
  }>({});
  const [filterValue, setFilterValue] = useState();
  const [activeId, setActiveId] = useState(
    props.pluginContext.workspace.window?.resource.id
  );
  useEffect(() => {
    let category = {};
    props.resourceList.forEach((d) => {
      category[d.category] = category[d.category] || [];
      category[d.category].push(d);
    });
    setCategory(category);
  }, [props.resourceList]);
  const handleSearchChange = useCallback((key) => {
    setFilterValue(key);
  }, []);
  workspace.onChangeActiveWindow(() => {
    setActiveId(workspace.window?.title);
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
    activeId: string;
    categoryName: string;
    resourceArr: IPublicModelResource[];
    filterValue: string;
  } & Required<IPluginOptions>
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
        (d) => d && d.toLowerCase().includes(props.filterValue.toLowerCase())
      )
  );

  if (!resourceArr || !resourceArr.length) {
    return null;
  }

  if (!props.categoryName || props.categoryName === 'undefined') {
    return (
      <div className="resource-tree-group">
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
          />
        ))}
      </div>
    );
  }

  return (
    <div className="resource-tree-group">
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
          className={`resource-tree-group-expand ${expanded ? 'expanded' : ''}`}
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
                      props.options.onAddPage();
                    } else {
                      props.options.onAddComponent();
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
        <div className="resource-tree-group-items">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceItem(props: {
  resource: IPublicModelResource;
  icon: any;
  children: IPublicModelResource[];
  activeId: string;
  behaviors: any;
  options: IOptions;
  pluginContext: IPublicModelPluginContext;
}) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const [showBehaviors, setShowBehaviors] = useState(false);
  const PropsIcon = props.icon;
  const Behaviors = props.behaviors;
  const display = (props.resource.config as any)?.display ?? true;

  if (!display) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={`resource-tree-group-item ${
        props.resource.options.isProCodePage
          ? 'resource-tree-group-item-pro-code'
          : ''
      } ${props.activeId === props.resource.options.id ? 'active' : ''}`}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowBehaviors(!showBehaviors);
      }}
    >
      {props.resource.options.modified ? (
        <div className="resource-tree-group-item-modified"></div>
      ) : null}

      <div
        onClick={() => {
          props.pluginContext.workspace.openEditorWindow(props.resource);
          props.options.handleClose(true);
        }}
        className="resource-tree-group-item-children"
      >
        {((props.children && props.children.length) || null) && (
          <div
            className={`expand-btn-wrap ${expanded ? 'expanded' : ''}`}
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
        <div className="resource-tree-group-item-title">
          {props.resource.options?.label || props.resource.title}
          {props.resource.options.isProCodePage
            ? intl('view_manager.components.resourceTree.SourceCode')
            : ''}
        </div>
        <div className="resource-tree-group-item-code">
          {props.resource.options?.slug ||
            props.resource.options?.componentName ||
            ''}
        </div>
        <div className="resource-tree-group-item-behaviors">
          {Behaviors &&
          (props.resource.config as any)?.disableBehaviors !== true ? (
            <Behaviors
              showBehaviors={showBehaviors}
              resource={props.resource}
              onVisibleChange={(visible, fromTrigger) => {
                setShowBehaviors(visible);
              }}
              safeNode={ref?.current}
            />
          ) : null}
        </div>
      </div>
      {expanded &&
        props.children &&
        props.children.map((child) => (
          <ResourceItem
            children={child.children}
            icon={child.icon}
            key={child.id}
            activeId={props.activeId}
            resource={child}
            behaviors={props.behaviors}
            options={props.options}
            pluginContext={props.pluginContext}
          />
        ))}
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
