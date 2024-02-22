import { ReactElement } from 'react';
import { EditorController, HookHandleFn } from './Controller';
import { EditorHook } from './EditorHook';
import type {IPublicApiSkeleton} from '@alilc/lowcode-types';
import { Monaco } from './types';

export enum PluginHooks {
  onActive = 'onActive',
  onDeActive = 'onDeActive',
  onSelectFileChange = 'onSelectFileChange',
  onEditorMount = 'onEditorMount',
  onMonacoLoaded = 'onMonacoLoaded',
}

export interface EditorPluginInterface {
  apply(service: Service): void;
}

export interface ServiceInitOptions {
  plugins?: EditorPluginInterface[];
}

export interface PluginAction {
  key: string;
  title: string;
  icon: ReactElement;
  action: () => any;
  priority: number;
}

export class Service extends EditorHook {
  // private options: ServiceInitOptions;
  public onActive = this.hookFactory(PluginHooks.onActive);

  public onDeActive = this.hookFactory(PluginHooks.onDeActive);

  public onSelectFileChange = this.hookFactory(PluginHooks.onSelectFileChange);

  public onEditorMount = this.hookFactory(PluginHooks.onEditorMount);

  public onMonacoLoaded: HookHandleFn<(monaco: Monaco) => void> =
    this.hookFactory(PluginHooks.onMonacoLoaded);

  actionMap: Array<PluginAction>;

  constructor(public controller: EditorController, private skeleton: IPublicApiSkeleton) {
    super();
    this.actionMap = [];
  }

  init(options: ServiceInitOptions) {
    const { plugins } = options;
    if (plugins) {
      for (const plugin of plugins) {
        plugin.apply(this);
      }
    }
    this.setupHooks();
    return this;
  }

  private setupHooks() {
    this.skeleton.onHidePanel((pluginName) => {
      if (pluginName === 'codeEditor') {
        this.triggerHook(PluginHooks.onDeActive);
      }
    });
    this.skeleton.onShowPanel((pluginName) => {
      if (pluginName === 'codeEditor') {
        this.triggerHook(PluginHooks.onActive);
      }
    });
  }

  public triggerHook(key: PluginHooks, ...args: any[]): void {
    super.triggerHook(key, ...args);
  }

  public registerAction(action: PluginAction) {
    const index = this.actionMap.findIndex((item) => item.key === action.key);
    if (index > -1) {
      console.error(
        `Action ${action.key}, 已被注册，此 Action 将覆盖原 Action`
      );
      this.actionMap.splice(index, 1);
    }
    this.actionMap.push(action);
  }
}
