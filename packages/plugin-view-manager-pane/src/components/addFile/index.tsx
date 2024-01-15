import * as React from 'react';
import { observer } from 'mobx-react';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { AddIcon } from '../../icon';
import { IOptions } from '../..';
import './index.scss';

function AddFileComponent(props: { options: IOptions, pluginContext: IPublicModelPluginContext }) {
  if (props.options?.renderAddFileComponent && typeof props.options.renderAddFileComponent === 'function') {
    return props.options.renderAddFileComponent();
  }

  const menus = props.options?.contextMenuActions?.(props.pluginContext);

  if (!menus || !menus.length) {
    return null;
  }

  const ContextMenu = props.pluginContext?.commonUI?.ContextMenu || React.Fragment;

  return (
    <span onClick={(e) => {
      ContextMenu.create(menus, e)
    }} className='add-file-icon-wrap'>
      <AddIcon />
    </span>
  )
}

export const AddFile = observer(AddFileComponent);
