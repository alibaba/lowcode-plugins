/* eslint-disable no-unreachable */
export class File {
  public ext: string | undefined;

  public type = 'file';

  constructor(public name: string, public content: string) {
    this.ext = name.match(/\.(\w+)$/)?.[1];
  }
}

export class Dir {
  public dirs: Dir[];
  public files: File[];
  public type = 'dir';

  constructor(public name: string, dirs?: Dir[], files?: File[]) {
    this.dirs = dirs || [];
    this.files = files || [];
  }
}

export const getKey = (parent: string | undefined, cur: string) => {
  const finalParent = parent ? `${parent.replace(/\/$/, '')}/` : '/';
  return `${finalParent}${cur}`;
};

export function getKeyByPath(path: string[], name: string) {
  return ['', ...path, name].join('/');
}

export const parseKey = (key: string) => {
  const fragment = key.split('/').filter(Boolean);
  const file = fragment[fragment.length - 1];
  return { path: fragment.slice(0, fragment.length - 1), file };
};

export function getFileOrDirTarget(root: Dir, path: string[]) {
  let cur = 0;
  let finalNode: Dir | undefined = root;
  while (cur < path.length) {
    finalNode = finalNode?.dirs.find((d) => d.name === path[cur]);
    cur++;
  }
  return finalNode;
}

export function getInitFile(root: Dir): File | undefined {
  return root.files.find((f) => f.name === 'index.js') || root.files[0];
}

export function insertNodeToTree(
  root: Dir,
  path: string[],
  target: Dir | File
) {
  const targetNode = getFileOrDirTarget(root, path);
  if (targetNode) {
    if (target.type === 'file') {
      targetNode.files.push(target as File);
    } else {
      targetNode.dirs.push(target as Dir);
    }
  }
}

export function deleteNodeOnTree(
  root: Dir,
  path: string[],
  target: Dir | File
) {
  const targetNode = getFileOrDirTarget(root, path);
  if (targetNode) {
    if (target.type === 'file') {
      targetNode.files = targetNode.files.filter((f) => f.name !== target.name);
    } else {
      targetNode.dirs = targetNode.dirs.filter((f) => f.name !== target.name);
    }
  }
}

export function getFileByPath(root: Dir, filename: string, path: string[]) {
  const targetNode = getFileOrDirTarget(root, path);
  if (targetNode) {
    return targetNode.files.find((f) => f.name === filename);
  }
}

/**
 * 生成一个文件，其中 file 格式为：{name: 'path/to/file.js', content: 'file content'}
 * @param file
 * @param dir
 */
export function generateFile(
  file: { name: string; content: string },
  dir: Dir
) {
  const fragments = file.name
    .replace(/^\.?\//, '')
    .split('/')
    .filter(Boolean);
  const filename = fragments[fragments.length - 1];
  const path = fragments.slice(0, fragments.length - 1);
  // 找到或生成文件要被添加到的文件夹
  let nextDir = dir;
  for (const dir of path) {
    let found: Dir | undefined = nextDir.dirs.find((d) => d.name === dir);
    if (!found) {
      found = new Dir(dir);
      nextDir.dirs.push(found);
    }
    nextDir = found;
  }
  // 添加文件
  nextDir.files.push(new File(filename, file.content));
}

/**
 * 后续 sourceCodeMap 对象格式为：{files: {}, meta: {}};
 * 需要对以前的格式做兼容
 * @param obj
 * @returns
 */
export function fileMapToTree(obj: any) {
  const { files } = compatGetSourceCodeMap(obj);
  const keys = Object.keys(files);
  const dir = new Dir('/');
  for (const key of keys) {
    generateFile({ name: key, content: files[key] }, dir);
  }
  return dir;
}

export function treeToMap(root: Dir, base = '') {
  const files: any = {};
  for (const file of root.files) {
    const key = [base, root.name.replace(/^\//, ''), file.name]
      .filter(Boolean)
      .join('/');
    files[key] = file.content;
  }
  for (const dir of root.dirs) {
    Object.assign(files, treeToMap(dir, root.name.replace(/^\//, '')));
  }
  return files;
}

export function compatGetSourceCodeMap(origin: any = {}) {
  const { meta, files, ...rest } = origin;
  return {
    files: files || rest,
    meta: meta || {},
  };
}

export function sortDir(tree: Dir) {
  tree.dirs = tree.dirs.sort((a, b) =>
    a.name === 'modules' ? -1 : a.name.charCodeAt(0) - b.name.charCodeAt(0)
  );
  return tree;
}
