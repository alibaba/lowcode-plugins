import React from 'react';
import { Balloon } from '@alifd/next';
import { IPublicModelResource } from '@alilc/lowcode-types';
import { OthersIcon } from '../resourceTree/icon';
import { IOptions } from '../..';
import { intl } from '../../locale';

export function Behaviors(props: {
  resource: IPublicModelResource;
  options: IOptions;
  showBehaviors: boolean;
  onVisibleChange: any;
  safeNode: any;
}) {
  const { description, name } = props.resource;
  let behaviors = [];
  if (name === 'lowcode') {
    props.options?.onEditComponent && behaviors.push('edit');
    props.options?.onCopyComponent && behaviors.push('copy');
    props.options?.onDeleteComponent && behaviors.push('delete');
  } else if (name === 'page') {
    props.options?.onEditPage && behaviors.push('edit');
    props.options?.onCopyPage && behaviors.push('copy');
    props.options?.onDeletePage && behaviors.push('delete');
  }

  if (!behaviors.length) {
    return null;
  }

  return (
    <Balloon
      v2
      trigger={
        <div
          className="resource-tree-group-item-behaviors-trigger"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <OthersIcon />
        </div>
      }
      triggerType="click"
      align="bl"
      popupClassName="view-pane-popup"
      closable={false}
      visible={props.showBehaviors}
      safeNode={props.safeNode}
      onVisibleChange={props.onVisibleChange}
    >
      {behaviors.map((d) => {
        let text, handleLowcodeClick, handlePageClick;
        switch (d) {
          case 'edit':
            text = intl(
              'view_manager.components.addFile.behaviors.DescriptionSettings',
              { description: description }
            );
            handleLowcodeClick = props.options?.onEditComponent;
            handlePageClick = props.options?.onEditPage;
            break;
          case 'copy':
            text = intl(
              'view_manager.components.addFile.behaviors.CopyDescription',
              { description: description }
            );
            handleLowcodeClick = props.options?.onCopyComponent;
            handlePageClick = props.options?.onCopyPage;
            break;
          case 'delete':
            text = intl(
              'view_manager.components.addFile.behaviors.DeleteDescription',
              { description: description }
            );
            handleLowcodeClick = props.options?.onDeleteComponent;
            handlePageClick = props.options?.onDeletePage;
            break;
        }

        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              props.onVisibleChange(false);
              if (name === 'lowcode') {
                handleLowcodeClick(props.resource);
              } else {
                handlePageClick(props.resource);
              }
            }}
            className="view-pane-popup-item"
          >
            {text}
          </div>
        );
      })}
    </Balloon>
  );
}
