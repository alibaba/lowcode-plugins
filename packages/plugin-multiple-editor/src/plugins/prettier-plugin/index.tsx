import React from 'react';
import { EditorPluginInterface, Service } from '@/Service';
import icon from './prettier.png';
import { HookKeys } from '@/EditorHook';
import { Message } from '@alifd/next';

export class PrettierPlugin implements EditorPluginInterface {
  private service!: Service;

  apply(service: Service): void {
    this.service = service;
    this.service.registerAction({
      key: 'format',
      title: '格式化',
      icon: <img src={icon} alt="" />,
      action: () => {
        const currentFile = service.controller.codeEditorCtx?.currentFile;
        if (currentFile?.file && window.prettier) {
          const { file } = currentFile;
          const { ext, content } = file;
          const parseMap: any = {
            js: 'babel',
            ts: 'babel-ts',
            less: 'less',
            css: 'css',
          };
          const formatted = window.prettier.format(content, {
            parser: parseMap[ext as string],
            semi: true,
            singleQuote: true,
            bracketSpacing: true,
            trailingComma: 'es5',
            // endOfLine: false,
            plugins: [
              window.prettierPlugins?.babel,
              window.prettierPlugins?.postcss,
            ].filter(Boolean),
          });
          const editor = service.controller.codeEditor;
          editor?.executeEdits('', [
            {
              range: editor.getModel()!.getFullModelRange(),
              text: formatted,
              forceMoveMarkers: true,
            },
          ]);
          editor?.pushUndoStop();
          service.controller.triggerHook(HookKeys.onEditCodeChange, {
            file: file?.fullPath,
            content: formatted,
          });
          Message.success('格式化代码成功');
        }
      },
      priority: 1,
    });
  }
}
