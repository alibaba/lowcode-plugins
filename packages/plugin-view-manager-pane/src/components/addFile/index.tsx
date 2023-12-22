import { Overlay, Menu } from '@alifd/next';
import * as React from 'react';
import { observer } from 'mobx-react';
import { AddIcon } from '../../icon';
import { IOptions } from '../..';

import './index.scss';
import { intl } from '../../locale';

const { Popup } = Overlay;
const { Item } = Menu;

function AddFileComponent(props: { options: IOptions }) {
  if (props.options?.renderAddFileComponent && typeof props.options.renderAddFileComponent === 'function') {
    return props.options.renderAddFileComponent();
  }

  if (!props.options?.onAddPage && !props.options?.onAddComponent) {
    return null;
  }

  return (
    <>
      <Popup
        v2
        trigger={
          <span className='add-file-icon-wrap'>
            <AddIcon />
          </span>
        }
        triggerType="click"
        align="bl"
        className="view-pane-popup"
      >
        <Menu openMode="single">
          {props.options.onAddPage ? (
            <Item
              onClick={(e) => {
                props.options.onAddPage?.();
              }}
            >
              {intl('view_manager.components.addFile.CreatePage')}
            </Item>
          ) : null}

          {props.options.onAddComponent ? (
            <Item
              onClick={(e) => {
                props.options.onAddComponent?.();
              }}
            >
              {intl('view_manager.components.addFile.CreateAComponent')}
            </Item>
          ) : null}
        </Menu>
      </Popup>
    </>
  );
}

export const AddFile = observer(AddFileComponent);
