import React from 'react';
import { IPublicModelPluginContext, IPublicModelResource } from '@alilc/lowcode-types';
import { OthersIcon } from '../resourceTree/icon';
import { IOptions } from '../..';

export function Behaviors(props: {
  pluginContext: IPublicModelPluginContext;
  resource: IPublicModelResource;
  options: IOptions;
  safeNode: any;
}) {
  const menus = (props.options?.resourceContextMenuActions?.(props.pluginContext, props.resource) || []).filter(d => !d.condition || d.condition && d.condition());
  const ContextMenu = props.pluginContext.commonUI?.ContextMenu || React.Fragment;

  if (!menus.length) {
    return null;
  }

  return (
    <div
      className="resource-tree-group-item-behaviors-trigger"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        ContextMenu.create(menus, e);
      }}
    >
      <OthersIcon />
    </div>
  );
}
