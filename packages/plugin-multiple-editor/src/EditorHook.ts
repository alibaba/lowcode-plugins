export enum HookKeys {
  onImport = 'onImport',
  onSourceCodeChange = 'onSourceCodeChange',
  onEditCodeChange = 'onEditCodeChange',
}

export class EditorHook {
  private hooks: Map<string, any[]>;

  constructor() {
    this.hooks = new Map();
  }

  triggerHook(key: string, ...args: any[]) {
    this.hooks.get(key)?.forEach((fn) => fn(...args));
  }

  protected hookFactory(key: string) {
    return ((fn: any) => {
      const newList = this.hooks.get(key) || [];
      newList.push(fn);
      this.hooks.set(key, newList);
      return () => {
        const list = this.hooks.get(key) || [];
        this.hooks.set(
          key,
          list.filter((f) => f !== fn)
        );
      };
    }) as any;
  }
}
