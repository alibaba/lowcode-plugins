import { common, project, event } from '@alilc/lowcode-engine';
import { Designer } from '@alilc/lowcode-designer';
import TreeNode from './tree-node';
import { Tree } from './tree';
import { Backup } from './views/backup-pane';

const { editorCabin, designerCabin } = common;
const { dragon, activeTracker, isLocationChildrenDetail } = designerCabin;
const { computed, makeObservable, obx } = editorCabin;

export interface ITreeBoard {
  readonly visible: boolean;
  readonly at: string | symbol;
  scrollToNode(treeNode: TreeNode, detail?: any): void;
}

export class TreeMaster {
  constructor() {
    makeObservable(this);
    let startTime: any;
    dragon.onDragstart(() => {
      startTime = Date.now() / 1000;
      // needs?
      this.toVision();
    });
    activeTracker.onChange(({ node, detail }) => {
      const tree = this.currentTree;
      if (!tree || node.document.id !== tree.document.id) {
        return;
      }

      const treeNode = tree.getTreeNode(node);
      if (detail && isLocationChildrenDetail(detail)) {
        treeNode.expand(true);
      } else {
        treeNode.expandParents();
      }

      this.boards.forEach((board) => {
        board.scrollToNode(treeNode, detail);
      });
    });
    dragon.onDragend(() => {
      const endTime: any = Date.now() / 1000;
      const nodes = project.currentDocument?.selection.getNodes();
      event?.emit('outlinePane.drag', {
        selected: nodes
          ?.map((n) => {
            if (!n) {
              return;
            }
            const npm = n?.componentMeta?.npm;
            return (
              [npm?.package, npm?.componentName].filter((item) => !!item).join('-') || n?.componentMeta?.componentName
            );
          })
          .join('&'),
        time: (endTime - startTime).toFixed(2),
      });
    });
    // designer.editor.on('designer.document.remove', ({ id }) => {
    //   this.treeMap.delete(id);
    // });
    project.onRemoveDocument(({ id }) => {
      this.treeMap.delete(id);
    });
  }

  private toVision() {
    const tree = this.currentTree;
    if (tree) {
      tree.document.selection.getTopNodes().forEach((node) => {
        tree.getTreeNode(node).setExpanded(false);
      });
    }
  }

  @obx.shallow private boards = new Set<ITreeBoard>();

  addBoard(board: ITreeBoard) {
    this.boards.add(board);
  }

  removeBoard(board: ITreeBoard) {
    this.boards.delete(board);
  }

  hasVisibleTreeBoard() {
    for (const item of this.boards) {
      if (item.visible && item.at !== Backup) {
        return true;
      }
    }
    return false;
  }

  purge() {
    // todo others purge
  }

  private treeMap = new Map<string, Tree>();

  get currentTree(): Tree | null {
    const doc = project?.currentDocument;
    if (doc) {
      const { id } = doc;
      if (this.treeMap.has(id)) {
        return this.treeMap.get(id)!;
      }
      const tree = new Tree(doc);
      this.treeMap.set(id, tree);
      return tree;
    }
    return null;
  }
}

const mastersMap = new Map<string, TreeMaster>();
export function getTreeMaster(): TreeMaster {
  let master = mastersMap.get('designer');
  if (!master) {
    master = new TreeMaster();
    mastersMap.set('designer', master);
  }
  return master;
}
