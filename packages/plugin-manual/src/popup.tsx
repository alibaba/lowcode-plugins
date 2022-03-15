import * as React from 'react';
import { useEffect, useState } from 'react';
import { material } from '@alilc/lowcode-engine';
import { Tree, Tag, Loading } from '@alifd/next';

import { IconBug, IconLink } from './icon';

export function Documents() {
  const [menu, setMenu] = useState([] as Array<{ title: string, url: string }>)
  const [loading, setLoading] = useState(false)
  const [selection, setSelection] = useState([] as string[])

  useEffect(() => {
    setLoading(true)
    fetch('https://lowcode-engine.cn/api/get_usage')
      .then((res) => res.json())
      .then((val) => {
        const menu = val.data.filter((a: any) => !isNaN(parseInt(a.title)))
        menu.sort((a: any, b: any) => parseInt(a.title) > parseInt(b.title) ? 1 : -1)
        setMenu(menu)
        setSelection(menu.length ? ['0'] : [])
      })
      .catch(err => console.error(err))
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <Loading visible={loading} style={{ display: 'block' }}>
      <div style={{ display: 'flex', height: window.innerHeight - 200 }}>
        <div style={{ width: 240, height: '100%', overflowY: 'auto' }}>
          {!loading && (
            <Tree
              defaultExpandAll={true}
              selectedKeys={selection}
              onSelect={(newSelection) => {
                if (Array.isArray(newSelection) && newSelection.length > 0) {
                  setSelection(newSelection)
                }
              }}
              isNodeBlock={{
                defaultPadingLeft: 1,
                indent: 1,
              }}
              style={{ lineHeight: '26px' }}
            >
              {menu.map((item, index) => (
                <Tree.Node key={String(index)} label={item.title} />
              ))}
              <Tree.Node selectable={false} label="技术文档">
                <Tree.Node
                  selectable={false}
                  label={(
                    <>
                      {IconLink}
                      <span>低代码引擎技术文档</span>
                    </>
                  )}
                  onClick={() => {
                    window.open('https://lowcode-engine.cn/doc')
                  }}
                />
                <Tree.Node
                  selectable={false}
                  label={(
                    <>
                      {IconLink}
                      <span>engine</span>
                      <Tag size="small" style={{ marginLeft: 8 }}>
                        {getVerionOf('ali-lowcode/ali-lowcode-engine') ?? (window as any).AliLowCodeEngine.version ?? '-'}
                      </Tag>
                    </>
                  )}
                  onClick={() => {
                    window.open('https://lowcode-engine.cn/doc?url=engine-changelog')
                  }}
                />
                <Tree.Node
                  selectable={false}
                  label={(
                    <>
                      {IconLink}
                      <span>ext</span>
                      <Tag size="small" style={{ marginLeft: 8 }}>
                        {getVerionOf('ali-lowcode/lowcode-engine-ext') ?? (window as any).AliLowCodeEngineExt.version ?? '-'}
                      </Tag>
                    </>
                  )}
                  onClick={() => {
                    window.open('https://lowcode-engine.cn/doc?url=engine-ext-changelog')
                  }}
                />
                <Tree.Node
                  selectable={false}
                  label={(
                    <>
                      {IconBug}
                      <span>提交 bug</span>
                    </>
                  )}
                  onClick={() => {
                    const assets = material.getAssets()
                    const message = `## 复现截图

## 复现流程与链接

## 期望结果

## 环境信息

- 引擎版本 ${getVerionOf('ali-lowcode/ali-lowcode-engine') ?? (window as any).AliLowCodeEngine.version ?? '-'}
- ext 版本 ${getVerionOf('ali-lowcode/lowcode-engine-ext') ?? (window as any).AliLowCodeEngineExt.version ?? '-'}
- 物料
${assets.packages
  .filter((item: any) => !!item.package)
  .map((item: any) => (`  - ${item.package}${item.version ? '@' + item.version : ''}`.replace(/@/g, '﹫')))
  .join('\n')
}`
                    window.open(`https://github.com/alibaba/lowcode-engine/issues/new?body=${
                      encodeURIComponent(message)
                    }`)
                  }}
                />
              </Tree.Node>
            </Tree>
          )}
        </div>
        {menu[+selection[0]]?.url && (
          <iframe
            src={`https://www.yuque.com/lce/usage/${menu[selection[0]].url}?view=doc_embed&from=kb&from=kb&outline=1&title=1`}
            style={{ marginLeft: 10, flex: '1 0', border: '1px solid #DBDBDB', display: 'block', padding: '10px 0 10px 10px', height: '100%' }}
          />
        )}
      </div>
    </Loading>
  )
}

function getVerionOf(pkg: string, extraBinding?: string) {
  const regExp = new RegExp(pkg + '/([^/]+)/' + (extraBinding || ''))
  const arr = Array.prototype.slice.call(document.querySelectorAll('script'))
  for (const item of arr) {
    if (!item.src) {
      continue
    }
    regExp.lastIndex = -1
    const result = regExp.exec(item.src)
    if (!result) {
      continue
    }
    const [, version] = result
    return /dev\.|@beta/.test(item.src)
      ? version + '-beta'
      : version
  }
  return undefined
}
