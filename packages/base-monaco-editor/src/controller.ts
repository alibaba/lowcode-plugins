export interface EditorMeta {
  singleton: boolean;
  [key: string]: any;
}

export class Controller {
  private methodMap: Record<string, Function>;
  private meta: EditorMeta;

  constructor() {
    this.methodMap = {};
    this.meta = { singleton: false };
  }

  registerMethod(name: string, fn: Function) {
    this.methodMap[name] = fn;
  }

  call(name: string, ...args: any[]) {
    return this.methodMap[name]?.(...args);
  }

  updateMeta(obj: Partial<EditorMeta>) {
    Object.assign(this.meta, obj);
  }

  getMeta() {
    return Object.freeze({ ...this.meta });
  }
}

const CONFIGURE_KEY = '__base_monaco_editor_controller__';
const fakeWindow: any = window;

if (!fakeWindow[CONFIGURE_KEY]) {
  fakeWindow[CONFIGURE_KEY] = new Controller();
}

export const controller: Controller = fakeWindow[CONFIGURE_KEY];
