import { SnippetMeta } from '@/utils/transform';

export default class ComponentManager {
  snippets = new Map<string, SnippetMeta>();

  setSnippets = (snippets: SnippetMeta[]) => {
    for (const snippet of snippets) {
      if (snippet.id) {
        this.snippets.set(snippet.id, snippet.schema);
      }
    }
  };

  getSnippetById = (id: string) => {
    return this.snippets.get(id);
  };
}
