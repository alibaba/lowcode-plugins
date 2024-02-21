import { EditorController } from './Controller';
import { EditorHook } from './EditorHook';
import type { Skeleton } from '@alilc/lowcode-shell';

export enum PluginHooks {
  onActive = 'onActive',
  onDeActive = 'onDeActive',
  onSelectFileChange = 'onSelectFileChange',
}

export interface EditorPluginInterface {
  apply(service: Service): void;
}

export interface ServiceInitOptions {
  plugins?: EditorPluginInterface[];
}

export class Service extends EditorHook {
  // private options: ServiceInitOptions;
  public onActive = this.hookFactory(PluginHooks.onActive);

  public onDeActive = this.hookFactory(PluginHooks.onDeActive);

  public onSelectFileChange = this.hookFactory(PluginHooks.onSelectFileChange);

  constructor(public controller: EditorController, private skeleton: Skeleton) {
    super();
  }

  init(options: ServiceInitOptions) {
    // this.options = options;
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
    this.skeleton.onShowPanel((pluginName) => {
      if (pluginName === 'codeEditor') {
        this.triggerHook(PluginHooks.onDeActive);
      }
    });
    this.skeleton.onHidePanel((pluginName) => {
      if (pluginName === 'codeEditor') {
        this.triggerHook(PluginHooks.onActive);
      }
    });
  }

  public triggerHook(key: PluginHooks, ...args: any[]): void {
    super.triggerHook(key, ...args);
  }
}
