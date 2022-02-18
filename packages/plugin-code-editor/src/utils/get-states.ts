import traverse from '@babel/traverse';
import { Node } from '@babel/types';

export const getState = (ast: Node) => {
  const state = {};
  traverse(ast, {
    enter(path) {
      // get state
      if (path.isIdentifier({ name: 'state' })) {
        const properties = path.container?.value?.properties;
        if (properties) {
          properties.forEach((property) => {
            state[property.key.name ?? property.key.extra.rawValue] = property.value.value;
          });
        }
      }
    },
  });
  return state;
};
