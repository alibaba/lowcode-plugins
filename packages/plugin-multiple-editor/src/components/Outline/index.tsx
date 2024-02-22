import { parse, generateOutline } from '../../utils/ghostBabel';
import './index.less';
import cls from 'classnames';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Icon } from '@alifd/next';
import classIcon from './img/class.png';
import functionIcon from './img/function.png';
import propsIcon from './img/props.png';
import { focusByContent } from './utils';
import { editorController } from '../../Controller';
export interface OutlineProps {
  content?: string;
  className?: string;
  filePath?: string;
  ilpOutLineStyle?: any;
}
export interface DirProps {
  children?: DirProps[];
  name: string;
  type: string;
}
export interface OutlineNodeProps {
  disableAction?: boolean;
  node: DirProps;
  selectedKey?: string;
  level?: number;
  className?: string;
}
const Outline: FC<OutlineProps> = ({
  content = '',
  className,
  filePath,
  ilpOutLineStyle,
}) => {
  const iconMap: Record<string, string> = {
    FunctionDeclaration: functionIcon,
    ClassMethod: functionIcon,
    ObjectMethod: functionIcon,
    ClassProperty: propsIcon,
    VariableDeclarator: propsIcon,
    ObjectProperty: propsIcon,
    ClassDeclaration: classIcon,
  };
  const [dir, setDir] = useState<any[]>([]);
  const [path, setPath] = useState<any>(filePath);
  useEffect(() => {
    try {
      const ast = parse(content);
      if (ast && generateOutline(ast)) {
        setDir(generateOutline(ast));
      }
    } catch (e) {
      if (path !== filePath) {
        setPath(filePath);
        setDir([]);
      }
    }
    if (path !== filePath) {
      setPath(filePath);
    }
  }, [content, filePath, path]);
  const OutlineNode: FC<OutlineNodeProps> = ({
    node,
    className,
    level = 1,
  }) => {
    const [selectedKey, setSelectedKey] = useState();
    const [expand, setExpand] = useState(true); // 根目录默认展开
    const levelStyle = useMemo(() => ({ paddingLeft: level * 8 }), [level]);
    const onRelatedEventClick = (event: any) => {
      setSelectedKey(event);
      focusByContent(
        editorController.codeEditor!,
        event,
        editorController.monaco!,
        filePath!
      );
    };
    return (
      <div className={cls('ilp-outline-node', className)}>
        <div className={cls('ilp-outline-node-title')} style={levelStyle}>
          <div
            className="ilp-outline-node-title-content"
            onClick={() => {
              onRelatedEventClick(node);
            }}
          >
            {!!node?.children?.length && (
              <Icon
                size={10}
                className={cls(
                  'ilp-outline-node-title-prefix',
                  expand && 'ilp-outline-node-title-prefix-expand'
                )}
                type="arrow-right"
                onClick={() => setExpand(!expand)}
              />
            )}
            <img src={iconMap[node?.type]} alt="" />
            <span>{node.name}</span>
          </div>
        </div>
        <div className="ilp-outline-node-children">
          {expand && (
            <>
              {node?.children?.map((f) => {
                return (
                  <div
                    key={f.name}
                    style={{ paddingLeft: 8 * (level + 1) }}
                    onClick={() => {
                      onRelatedEventClick(f);
                    }}
                    className={cls(
                      'ilp-outline-node-file',
                      selectedKey === f.name && 'ilp-outline-node-file-selected'
                    )}
                  >
                    <img src={iconMap[f.type]} alt="" />
                    <span>{f.name}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  };
  return dir?.length ? (
    <div className={className}>
      <div className={cls('ilp-outline-bar')} style={ilpOutLineStyle}>
        <h4 className="ilp-outline-bar-title">
          <span>大纲树</span>
        </h4>
        <div className="ilp-outline-nodeList">
          {dir?.map((item) => {
            return <OutlineNode node={item} key={item.name} />;
          })}
        </div>
      </div>
    </div>
  ) : null;
};
export default Outline;
