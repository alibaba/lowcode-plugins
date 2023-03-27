// TODO 抽离 renderItem
import React, { PureComponent, Component, CSSProperties } from 'react';
import { Button, Icon, Checkbox, Tag, Balloon } from '@alifd/next';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@alilc/lowcode-datasource-types';
import cn from 'classnames';
import { DragSource, DropTarget } from 'react-dnd';
import _uniqueId from 'lodash/uniqueId';
import type { DataSourceInfoTag } from '../../types';
import { DataSourcePanelMode } from '../../pane';
import { generateClassName } from '../../utils/misc';
import { DataSourcePaneContext } from '../../utils/panel-context';

import './list-item.scss';

export const ListDndTypes = {
  DATASOURCE_ITEM: 'DATASOURCE_ITEM',
};

function defaultRenderInfoTags(dataSource: DataSourceConfig) {
  return [
    {
      type: 'primary',
      content: dataSource.type,
    },
  ];
}

interface DataSourceListItemDragHandlerProps {}

class DataSourceListItemDragHandler extends PureComponent<DataSourceListItemDragHandlerProps> {
  render() {
    return (
      <Button size="small" text>
        <Icon type="list" />
      </Button>
    );
  }
}

export interface IDataSourceListItemOperation {
  title: string;
  type: string;
  disabled?: boolean;
  visible?: boolean;
  icon: string;
}

export interface DataSourceListItemProps {
  className?: string;
  style?: CSSProperties;
  dataSource: DataSourceConfig & { typeTitle: string };
  operations: IDataSourceListItemOperation[];
  connectDragSource: any;
  connectDragPreview: any;
  connectDropTarget: any;
  onOperationClick?: (operationType: string, dataSourceId: string) => void;
  isDragging: boolean;
  isOver: boolean;
  dropResult: any;
  onStartDrag?: (id: string) => void;
  onDragOver?: (from: string, to: string) => void;
  onDrop?: (from: string, to: string) => void;
  mode: DataSourcePanelMode;
  onToggleSelect?: (id: string) => void;
  selected: boolean;
  renderInfoTags: (dataSource: DataSourceConfig) => DataSourceInfoTag[];
}

export class DataSourceListItem extends Component<DataSourceListItemProps> {
  static contextType = DataSourcePaneContext;

  componentDidUpdate(prevProps: DataSourceListItemProps) {
    if (prevProps.dropResult !== this.props.dropResult) {
      if (this.props.dropResult?.moved) {
        this.handleDragEnd(
          this.props.dropResult?.from,
          this.props?.dropResult?.to,
        );
      }
    }
    if (
      prevProps.isDragging !== this.props.isDragging &&
      this.props.isDragging
    ) {
      this.props.onStartDrag?.(this.props.dataSource.id);
    }
    if (prevProps.isOver !== this.props.isOver && this.props.isOver) {
      // console.log('is over 2', this.props.dataSource.id);
      this.props.onDragOver?.(this.props.dataSource.id);
    }
  }

  handleDragEnd = (from, to) => {
    this.props.onDrop?.(from, to);
  };

  handleExportCheckChange = () => {
    this.props.onToggleSelect?.(this.props.dataSource.id);
  };

  render() {
    const {
      operations,
      dataSource,
      className,
      style,
      onOperationClick,
      isDragging,
      mode,
      selected,
      renderInfoTags = defaultRenderInfoTags,
    } = this.props;

    // 拖拽中，需要向右偏移 8p，避免覆盖
    const offsetStyle = mode === DataSourcePanelMode.SORTING ? { marginLeft: '8px' } : null;

    return this.props?.connectDropTarget?.(
      this.props?.connectDragPreview?.(
        <div
          className={cn(
            generateClassName('list-item'),
            {
              [generateClassName('list-item-dragging')]: isDragging,
              [generateClassName('list-item-sort')]: mode === DataSourcePanelMode.SORTING,
              [generateClassName('list-item-export')]: mode === DataSourcePanelMode.EXPORTING,
            },
            className,
          )}
          style={style}
        >
          {mode === DataSourcePanelMode.SORTING &&
            this.props.connectDragSource?.(
              <span className={generateClassName('list-item-drag-handle')}>
                <DataSourceListItemDragHandler />
              </span>,
            )}
          {mode === DataSourcePanelMode.EXPORTING && (
            <Checkbox
              className={generateClassName('list-item-export-checkbox')}
              checked={selected}
              onChange={this.handleExportCheckChange}
            />
          )}
          <div className={generateClassName('list-item-title')} style={offsetStyle}>
            <div
              className={generateClassName('list-item-id')}
              title={dataSource.id}
            >
              {dataSource.id}
            </div>
            {
              <div className={generateClassName('list-item-operations')}>
                {operations?.map((operation) => {
                  // TODO 获取不到 dataSourceTypes
                  // if (!this.context.dataSourceTypes?.find((i: any) => i.type === dataSource.type) && operation.type !== 'remove') return null;
                  return (
                    operation.visible && (
                      <DataSourceListItemOperation
                        key={operation.type}
                        dataSourceId={dataSource.id}
                        onOperationClick={onOperationClick}
                        title={operation.title}
                        icon={operation.icon}
                        type={operation.type}
                      />
                    )
                  );
                })}
              </div>
            }
          </div>
          <div className={generateClassName('list-item-desc')} style={offsetStyle}>
            {renderInfoTags(dataSource)?.map?.((tag: DataSourceInfoTag) => {
              if (tag.tooltip === true) {
                return (
                  <Balloon.Tooltip
                    key={_uniqueId('ds-tag-')}
                    delay={100}
                    trigger={
                      <Tag
                        style={{ maxWidth: tag.maxWidth || 120 }}
                        size="small"
                        type={tag.type || 'normal'}
                        color={tag.color}
                      >
                        {tag.content}
                      </Tag>
                    }
                  >
                    {tag.tooltipContent || tag.content}
                  </Balloon.Tooltip>
                );
              }
              return (
                <Tag
                  key={_uniqueId('ds-tag-')}
                  style={{ maxWidth: tag.maxWidth || 120 }}
                  size="small"
                  type={tag.type || 'normal'}
                  color={tag.color}
                >
                  {tag.content}
                </Tag>
              );
            }) ?? null}
          </div>
        </div>,
      ),
    );
  }
}

interface DataSourceListItemOperationProps {
  dataSourceId: string;
  title: string;
  icon?: string;
  type: string;
  onOperationClick: (operationType: string, dataSourceId: string) => void;
}

export class DataSourceListItemOperation extends PureComponent<DataSourceListItemOperationProps> {
  handleOperationClick = () => {
    const { type, dataSourceId, onOperationClick } = this.props;
    onOperationClick?.(type, dataSourceId);
  };
  render() {
    const { icon, title } = this.props;
    if (!icon) {
      return (
        <Button
          key={title}
          size="small"
          onClick={this.handleOperationClick}
          text
        >
          {title}
        </Button>
      );
    }
    return (
      <Balloon.Tooltip
        key={icon}
        delay={100}
        trigger={
          <Button iconSize="small" className={generateClassName('item-operate')} onClick={this.handleOperationClick} text>
            <Icon type={icon} />
          </Button>
        }
      >
        {title}
      </Balloon.Tooltip>
    );
  }
}
const DraggableDataSourceListItem = DragSource(
  ListDndTypes.DATASOURCE_ITEM,
  {
    canDrag(props) {
      return true;
    },

    isDragging(props, monitor) {
      // If your component gets unmounted while dragged
      // (like a card in Kanban board dragged between lists)
      // you can implement something like this to keep its
      // appearance dragged:
      return monitor.getItem().id === props?.dataSource?.id;
    },

    beginDrag(props, monitor, component) {
      // Return the data describing the dragged item
      const item = { id: props?.dataSource?.id };
      return item;
    },

    endDrag(props, monitor, component) {
      if (!monitor.didDrop()) {
        // You can check whether the drop was successful
        // or if the drag ended but nobody handled the drop
        return;
      }

      // When dropped on a compatible target, do something.
      // Read the original dragged item from getItem():
      const item = monitor.getItem();

      // You may also read the drop result from the drop target
      // that handled the drop, if it returned an object from
      // its drop() method.
      const dropResult = monitor.getDropResult();

      // This is a good place to call some Flux action
      // CardActions.moveCardToList(item.id, dropResult.listId)
    },
  },
  (connect, monitor) => {
    return {
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging(),
    };
  },
)(DataSourceListItem);

export const DroppableDataSourceListItem = DropTarget(
  ListDndTypes.DATASOURCE_ITEM,
  {
    drop: (props, monitor, component) => {
      if (monitor.didDrop()) {
        return;
      }
      const item = monitor.getItem();
      return { moved: true, from: item.id, to: props?.dataSource?.id };
    },
  },
  (connect, monitor) => {
    return {
      connectDropTarget: connect.dropTarget(),
      dropResult: monitor.getDropResult(),
      isOver: monitor.isOver(),
    };
  },
)(DraggableDataSourceListItem);
