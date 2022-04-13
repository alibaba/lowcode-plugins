import React, { useEffect, useRef, useState } from 'react';
import { ILowCodePluginContext, project } from '@alilc/lowcode-engine';
import { Button, Icon } from '@alifd/next';
import { PluginProps } from '@alilc/lowcode-types';
import { History } from '@alilc/lowcode-shell';
import './index.scss';

export interface IUndoRedoProps extends PluginProps {
  logo?: string;
}

const UndoRedo: React.FC<IUndoRedoProps> = () => {
  const [undoEnable, setUndoEnable] = useState<boolean>(false);
  const [redoEnable, setRedoEnable] = useState<boolean>(false);
  const historyRef = useRef<History | null>(null);

  useEffect(() => {
    project.onChangeDocument((doc) => {
      historyRef.current = doc.history;
      updateState(historyRef.current.getState() || 0);

      historyRef.current.onChangeState(() => {
        updateState(historyRef.current?.getState() || 0);
      });
    });
  }, []);

  const updateState = (state: number): void => {
    setUndoEnable(!!(state & 1));
    setRedoEnable(!!(state & 2));
  };

  const handleUndoClick = (): void => {
    historyRef.current?.back();
  };

  const handleRedoClick = (): void => {
    historyRef.current?.forward();
  };
  return (
    <div className="lowcode-plugin-undo-redo">
      <Button
        size="medium"
        data-tip="撤销"
        data-dir="bottom"
        onClick={handleUndoClick}
        ghost
        disabled={!undoEnable}
      >
        <Icon type="houtui" />
      </Button>
      <Button
        size="medium"
        data-tip="恢复"
        data-dir="bottom"
        onClick={handleRedoClick}
        ghost
        disabled={!redoEnable}
      >
        <Icon type="qianjin" />
      </Button>
    </div>
  );
};

const plugin = (ctx: ILowCodePluginContext) => {
  return {
    // 插件名，注册环境下唯一
    name: 'PluginUndoRedo',
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {
      // 往引擎增加面板
      ctx.skeleton.add({
        area: 'topArea',
        type: 'Widget',
        name: 'undoRedo',
        content: UndoRedo,
        props: {
          align: 'right',
          width: 88,
        },
      });
    },
  };
};

plugin.pluginName = 'PluginUndoRedo';

export default plugin;
