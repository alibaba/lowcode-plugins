# @alilc/lowcode-plugin-components-pane

## 注意

当前组件面板不兼容旧的资产包协议定义内容，支持的资产包协议如下：

```TypeScript
export interface ComponentSort {
  groupList?: String[]; // 用于描述组件面板的 tab 项及其排序，例如：["精选组件", "原子组件"]
  categoryList?: String[]; // 组件面板中同一个 tab 下的不同区间用 category 区分，category 的排序依照 categoryList 顺序排列；
}

export interface Assets {
  version: string; // 资产包协议版本号
  packages?: Array<Package>; // 大包列表，external与package的概念相似，融合在一起
  components: Array<ComponentDescription> | Array<RemoteComponentDescription>; // 所有组件的描述协议列表
  componentList?: ComponentCategory[]; // 【待废弃】组件分类列表，用来描述物料面板
  sort: ComponentSort; // 新增字段，用于描述组件面板中的 tab 和 category
}

export interface RemoteComponentDescription {
  exportName: string; // 组件描述导出名字，可以通过 window[exportName] 获取到组件描述的 Object 内容；
  url: string; // 组件描述的资源链接；
  package: { // 组件(库)的 npm 信息；
	  npm: string;
  }
}
```
