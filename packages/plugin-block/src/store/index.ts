

class BlockStore {

  store;

  constructor() {
    this.store = new Map();
  }

  init(blocks) {
    blocks.forEach(block => {
      const { id, schema } = block;
      this.store.set(`${id}`, JSON.parse(schema));
    });
  }

  set(id, snippets) {
    this.store.set(id, snippets);
  }

  get(id) {
    return this.store.get(id);
  }

}

const singleton = new BlockStore();

export default singleton;