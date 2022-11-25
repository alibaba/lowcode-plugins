import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import MonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';

import { Dialog, Message, Button } from '@alifd/next';

import { common } from '@alilc/lowcode-engine'
import { Project, Skeleton, Event } from '@alilc/lowcode-shell';
import { IEditorInstance } from '@alilc/lowcode-plugin-base-monaco-editor/lib/helper';

interface PluginCodeDiffProps {
  project: Project;
  skeleton: Skeleton;
  event: Event;
  // 是否显示项目级 schema
  showProjectSchema: boolean;
}

export default function PluginSchema({ project, skeleton, event, showProjectSchema = false }: PluginCodeDiffProps) {
  const [editorSize, setEditorSize] = useState({ width: 0, height: 0 });
  const [schemaValue, setSchemaValue] = useState(() => {
    const schema = project.exportSchema(common.designerCabin.TransformStage.Save);
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

  useEffect(() => {
    event.on('skeleton.panel-dock.active', (pluginName) => {
      if (pluginName == 'LowcodePluginAliLowcodePluginSchema') {
        const schema = project.exportSchema(common.designerCabin.TransformStage.Save)
        const str = schema?.componentsTree?.[0] ? JSON.stringify(schema.componentsTree[0], null, 2) : ''
        setSchemaValue(str);
      }
    });
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
            ...project.exportSchema(common.designerCabin.TransformStage.Save),
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
        保存 Schema
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
