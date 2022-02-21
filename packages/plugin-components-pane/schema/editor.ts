import EventEmitter from 'eventemitter3';

export default class Editor extends EventEmitter {
  private store = new Map();

  set(key, value) {
    return this.store.set(key, value);
  }

  get(key) {
    return this.store.get(key);
  }
}
