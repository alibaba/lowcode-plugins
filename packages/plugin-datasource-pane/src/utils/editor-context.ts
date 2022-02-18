/**
 * 设计态编辑器上下文
 */
import { createContext } from 'react';
import { Project, Setters } from '@alilc/lowcode-shell';
import Logger from 'zen-logger';

interface IEditorContext {
  project?: Project;
  logger?: Logger;
  setters?: Setters | null;
}

export const EditorContext = createContext<IEditorContext>({});
