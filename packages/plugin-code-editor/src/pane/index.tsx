import React, { useEffect, useState, useMemo, memo, useRef } from 'react';
import { Dialog, Message } from '@alifd/next';

import { JsEditor, CssEditor } from '../components';
import { schema2JsCode, schema2CssCode } from '../utils';
import { WORDS, TAB_KEY } from '../config';
import { common } from '@alilc/lowcode-engine';

import { FunctionEventParams } from '../types';
import { Project, Event, Skeleton } from '@alilc/lowcode-shell';

import '@alilc/lowcode-plugin-base-monaco-editor/lib/style';
import './index.less';
import { SaveIcon } from '../components/SaveIcon';

interface CodeEditorPaneProps {
  project: Project;
  event: Event;
  skeleton: Skeleton;
}

export const CodeEditorPane = memo(({ project, event, skeleton }: CodeEditorPaneProps) => {
  const [activeKey, setActiveKey] = useState(TAB_KEY.JS);
  const lowcodeProjectRef = useRef(project);
  const skeletonRef = useRef(skeleton);
  const eventRef = useRef(event);
  const jsEditorRef = useRef<JsEditor>(null);
  const cssEditorRef = useRef<CssEditor>(null);
  const saveSchemaRef = useRef<() => void>(); // save code to schema

  const [schema, setSchema] = useState(() => project.exportSchema(common.designerCabin.TransformStage.Save));

  const jsCode = useMemo(() => {
    return schema2JsCode(schema);
  }, [schema]);

  const cssCode = useMemo(() => {
    return schema2CssCode(schema);
  }, [schema]);

  useEffect(() => {
    saveSchemaRef.current = () => {
      try {
        const currentSchema = lowcodeProjectRef.current?.exportSchema(common.designerCabin.TransformStage.Save);
        const pageNode = currentSchema.componentsTree[0];
        const { state, methods, lifeCycles, originCode = '' } = jsEditorRef.current?.getSchemaFromCode() ?? {};
        const css = cssEditorRef.current?.getBeautifiedCSS() ?? cssCode;
        pageNode.state = state;
        pageNode.methods = methods;
        pageNode.lifeCycles = lifeCycles;
        pageNode.originCode = originCode;

        pageNode.css = css;
        lowcodeProjectRef.current?.importSchema(currentSchema);

        setSchema(currentSchema);

        Message.success({
          content: WORDS.saveSuccess,
          duration: 1000,
        });
      } catch (err) {
        if (err instanceof Error) {
          Dialog.alert({
            title: WORDS.title,
            content: (
              <>
                {WORDS.generalParseError}
                <pre>{err.message}</pre>
              </>
            ),
            onOk: () => {
              skeletonRef.current?.showPanel('codeEditor');
            },
          });
        }
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };
  }, [cssCode]);

  useEffect(() => {
    lowcodeProjectRef.current = project;
  }, [project]);

  useEffect(() => {
    skeletonRef.current = skeleton;
  }, [skeleton]);

  useEffect(() => {
    eventRef.current = event;
  }, [event]);

  useEffect(() => {
    // load schema on open
    skeletonRef.current?.onShowPanel((pluginName: string) => {
      if (pluginName === 'codeEditor') {
        const schema = lowcodeProjectRef.current?.exportSchema(common.designerCabin.TransformStage.Save);
        if (!schema) {
          return;
        }
        const jsCode = schema2JsCode(schema);
        const cssCode = schema2CssCode(schema);
        setSchema(schema);
        jsEditorRef.current?._updateCode(jsCode);
        cssEditorRef.current?._updateCode(cssCode);
      }
    });

    // save schema when panel closed
    skeletonRef.current?.onHidePanel((pluginName: string) => {
      if (pluginName === 'codeEditor') {
        saveSchemaRef.current?.();
      }
    });

    // focus function by functionName
    eventRef.current?.on('common:codeEditor.focusByFunction', (params) => {
      setActiveKey(TAB_KEY.JS);
      setTimeout(() => {
        jsEditorRef.current?.focusByFunctionName(params as FunctionEventParams);
      }, 100);
    });

    eventRef.current?.on('common:codeEditor.addFunction', (params) => {
      setActiveKey(TAB_KEY.JS);
      setTimeout(() => {
        jsEditorRef.current?.addFunction(params as FunctionEventParams);
      }, 100);
    });
  }, []);

  return (
    <div className="plugin-code-editor-pane">
      <JsEditor
        jsCode={jsCode}
        ref={jsEditorRef}
        currentTab={activeKey}
        onTabChange={(key) => setActiveKey(key as TAB_KEY)}
      />
      <CssEditor
        cssCode={cssCode}
        ref={cssEditorRef}
        currentTab={activeKey}
        onTabChange={(key) => setActiveKey(key as TAB_KEY)}
      />
      <SaveIcon
        onClick={() => {
          saveSchemaRef.current?.();
        }}
        // isDisabled={code === jsCode || hasError}
      />
    </div>
  );
});

CodeEditorPane.displayName = 'LowcodeCodeEditor';
