import React, { FC, useMemo, MouseEvent, useState } from 'react';
import cls from 'classnames';
import { Dropdown, Icon, Overlay } from '@alifd/next';
import { Dir, File, getKey, parseKey } from '../../../utils/files';
import dirIcon from './img/file-directory.png';
import fileIcon from './img/file.png';
import menuIcon from './img/menu.png';
import deleteIcon from './img/delete.png';

import './index.less';

export type HandleAddFn = (type: 'file' | 'dir', path: string[]) => void;

export type HandleDeleteFn = (path: string[], target: Dir | File) => void;

export type HandleChangeFn = (value: File, path: string[]) => void;

export interface TreeNodeProps {
  disableAction?: boolean;
  dir?: Dir;
  parentKey?: string;
  selectedKey?: string;
  modifiedKeys?: string[];
  level?: number;
  onChange?: HandleChangeFn;
  onAdd?: HandleAddFn;
  onDelete?: HandleDeleteFn;
  className?: string;
}

const helpPopupProps = {
  animation: {
    in: 'zoomIn',
    out: 'zoomOut',
  },
  triggerType: 'hover',
  placementOffset: 4,
};

const defaultDir = new Dir('root');

const TreeNode: FC<TreeNodeProps> = ({
  dir = defaultDir,
  className,
  selectedKey,
  parentKey,
  level = 1,
  onChange,
  onDelete,
  onAdd,
  modifiedKeys,
  disableAction,
}) => {
  const [expand, setExpand] = useState(dir.name === '/'); // 根目录默认展开
  const levelStyle = useMemo(() => ({ paddingLeft: level * 8 }), [level]);
  const dirActions = useMemo(() => {
    const key = getKey(parentKey, dir.name);
    const path = parseKey(key).path;
    const baseActions = [
      {
        title: '新建文件夹',
        action: () => {
          setExpand(true);
          onAdd?.('dir', path);
        },
        id: 'dir',
      },
      {
        title: '新建文件',
        action: () => {
          onAdd?.('file', path);
        },
        id: 'file',
      },
    ];
    // 根目录不能删除
    if (parentKey) {
      baseActions.push({
        title: '删除目录',
        action: () => {
          path.pop();
          onDelete?.(path, dir);
        },
        id: 'delete',
      });
    }
    return baseActions;
  }, [dir, onAdd, onDelete, parentKey]);
  const handleFileClick = (f: File, key: string) => {
    onChange?.(f, parseKey(key).path);
  };
  const handleDelete = (
    e: MouseEvent<HTMLImageElement>,
    file: File,
    key: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.(parseKey(key).path, file);
  };
  const dropdownOverlay = (
    <div className="ilp-tree-node-title-dropdown">
      {dirActions.map(({ title, action, id }) => (
        <div
          className="ilp-tree-node-title-dropdown-item"
          key={id}
          onClick={action}
        >
          {title}
        </div>
      ))}
    </div>
  );

  const actionDisabled = dir.name === 'modules' || disableAction;
  return (
    <div className={cls('ilp-tree-node', className)}>
      <div
        className={cls(
          'ilp-tree-node-title',
          dir.name === 'modules' && 'ilp-tree-node-title-modules'
        )}
        style={levelStyle}
      >
        <div
          className="ilp-tree-node-title-content"
          onClick={() => setExpand(!expand)}
        >
          <Icon
            size={10}
            className={cls(
              'ilp-tree-node-title-prefix',
              expand && 'ilp-tree-node-title-prefix-expand'
            )}
            type="arrow-right"
          />
          <img src={dirIcon} alt="directory" />
          <span>{dir.name}</span>
          {actionDisabled && (
            <Overlay.Popup
              {...helpPopupProps}
              v2
              trigger={<Icon size={10} type="help" style={{ marginLeft: 4 }} />}
              placement="rt"
            >
              <span className="help-tooltips">
                内置模块，不可操作文件，内容修改不会影响最终结果
              </span>
            </Overlay.Popup>
          )}
        </div>
        {!actionDisabled && (
          <Dropdown
            triggerType={['click']}
            trigger={
              <img
                src={menuIcon}
                alt="menu"
                className="ilp-tree-node-title-icon"
              />
            }
          >
            {dropdownOverlay}
          </Dropdown>
        )}
      </div>
      <div className="ilp-tree-node-children">
        {expand && (
          <>
            {dir.dirs.map((d) => (
              <TreeNode
                selectedKey={selectedKey}
                level={level + 1}
                dir={d}
                key={d.name}
                parentKey={getKey(parentKey, d.name)}
                onChange={onChange}
                onAdd={onAdd}
                onDelete={onDelete}
                modifiedKeys={modifiedKeys}
              />
            ))}
            {dir.files.map((f) => {
              const key = getKey(parentKey, f.name);
              return (
                <div
                  key={f.name}
                  style={{ paddingLeft: 8 * (level + 1) }}
                  className={cls(
                    'ilp-tree-node-file',
                    selectedKey === key && 'ilp-tree-node-file-selected',
                    modifiedKeys?.find((k) => k === key) &&
                      'ilp-tree-node-file-modified'
                  )}
                  onClick={() => handleFileClick(f, key)}
                >
                  <img src={fileIcon} alt="file" />
                  <span>{f.name}</span>
                  {f.ext !== 'css' &&
                    !(f.name === 'index.js' && !parentKey) &&
                    !actionDisabled && (
                    <img
                      src={deleteIcon}
                      className="ilp-tree-node-file-icon"
                      alt=""
                      onClick={(e) => handleDelete(e, f, key)}
                    />
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default TreeNode;
