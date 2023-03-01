import * as React from 'react';
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';

import { Dialog, Message, Button } from '@alifd/next';
import { IPublicEnumTransformStage, IPublicModelPluginContext } from '@alilc/lowcode-types';
import { IEditorInstance } from '@alilc/lowcode-plugin-base-monaco-editor/lib/helper';

interface PluginCodeDiffProps {
  pluginContext: IPublicModelPluginContext;
  // 是否显示项目级 schema
  showProjectSchema: boolean;
}

export default function PluginSchema({ pluginContext, showProjectSchema = false }: PluginCodeDiffProps) {
  const { project, skeleton } = pluginContext;

  const [editorSize, setEditorSize] = useState({ width: 0, height: 0 });
  const [schemaValue, setSchemaValue] = useState(() => {
    const schema = project.exportSchema(IPublicEnumTransformStage.Save);
    const schemaToShow = showProjectSchema? schema : schema?.componentsTree?.[0];
    return schemaToShow? JSON.stringify(schemaToShow, null, 2) : '';
  });
  const monacoEditorRef = useRef<IEditorInstance>();

  const resize = useCallback(() => {
    setEditorSize({
      width: document.documentElement.clientWidth - 60,
      height: document.documentElement.clientHeight - 100,
    });
  }, []);

  useLayoutEffect(() => {
    const cancelListenShowPanel = skeleton.onShowPanel((pluginName: string) => {
      if (pluginName == 'LowcodePluginAliLowcodePluginSchema') {
        const schema = project.exportSchema(IPublicEnumTransformStage.Save);
        const str = schema?.componentsTree?.[0] ? JSON.stringify(schema.componentsTree[0], null, 2) : '';
        setSchemaValue(str);
      }
    })
    return cancelListenShowPanel;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [resize]);

  const onSave = () => {
    Dialog.alert({
      content: 'Are you 100% sure? Lowcode editor may crash.',
      footerActions: ['cancel', 'ok'],
      onOk: () => {
        let json;
        try {
          json = JSON.parse(monacoEditorRef.current?.getValue() ?? schemaValue);
        } catch (err) {
          Message.error('Cannot save schema. Schema Parse Error.' + err.message);
          return;
        }
        if (showProjectSchema) {
          // 当前操作项目级 schema
          project.importSchema(json);
        } else {
          // 当前操作页面级 schema
          project.importSchema({
            ...project.exportSchema(IPublicEnumTransformStage.Save),
            componentsTree: [json],
          });
        }
        Message.success('Schema Saved!');
        skeleton.hidePanel('LowcodePluginAliLowcodePluginSchema');
      }
    });
  }

  return (
    <>
      <Button
        onClick={onSave}
        style={{ position: 'absolute', right: 68, zIndex: 100, top: -38 }}
      >
        {pluginContext.intl('Save Schema')}
      </Button>
      <MonacoEditor
        height={editorSize.height}
        language="json"
        theme="vs-light"
        value={schemaValue}
        onChange={(input) => {
          setSchemaValue(input);
        }}
        editorDidMount={(_, monacoEditor) => {
          monacoEditorRef.current = monacoEditor
          monacoEditor.addAction({
            id: 'my-unique-id',
            label: 'Save Schema',
            keybindingContext: null,
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: onSave,
          });
        }}
      />
    </>
  )
}
