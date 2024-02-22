import { EditorController } from './Controller';
import { getFilesByPath, pathResolve, resolveFilePath } from './utils';

export class MonacoSuggestions {
  private editorInitialed = false;
  constructor(private controller: EditorController) {}

  get monaco() {
    return this.controller.monaco!;
  }

  get editor() {
    return this.controller.codeEditor!;
  }

  init() {
    if (!this.editorInitialed) {
      this.initPathSuggestion();
    }
  }

  private initPathSuggestion() {
    this.editorInitialed = true;
    const monaco = this.monaco;
    const getFileMap = () =>
      this.controller.getCodeTemp()?._sourceCodeMap.files || {};
    this.monaco?.languages.registerCompletionItemProvider(
      ['javascript', 'typescript'],
      {
        triggerCharacters: ['/'],
        provideCompletionItems(model, position) {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column + 1,
          });
          const currentFilePath = resolveFilePath(model.uri.path);
          const match = textUntilPosition.match(/('.*')|(".*")/gim);
          if (!match) return;
          const relativePath = match?.[0]?.replace(/'|"/g, '') || '';
          const filesList = getFilesByPath(
            getFileMap(),
            pathResolve(currentFilePath, relativePath)
          );
          return {
            suggestions: filesList.map(({ type, path }) => ({
              label: path,
              sortText: type === 'dir' ? '1' : '2',
              range: {
                startColumn: position.column,
                endColumn: position.column,
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
              },
              kind:
                type === 'file'
                  ? monaco.languages.CompletionItemKind.File
                  : monaco.languages.CompletionItemKind.Folder,
              insertText: path.replace(/\.\w+$/, ''),
            })),
          };
        },
      }
    );
  }
}
