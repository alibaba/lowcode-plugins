# 区块管理 - 保存为区块

## 区块实体

```

interface Block {
  name: string;
  title: string;
  schema: string;
  screenshot: string;
  created_at?: string;
  updated_at?: string;
}

```

## 注意

使用区块管理需要提前将对应的 API 注册到 engine config 里：

```

interface BlockAPI {
  listBlocks: () => Block[];
  createBlock: (Block) => any;
}

function setupConfig() {
  config.set('apiList', {
    block: {
      listBlocks,
      createBlock
    },
  })
}
```

# 使用方式

```
import { material } from '@alilc/lowcode-engine';
import { default as saveAsBlock } from '@alilc/action-block';

material.addBuiltinComponentAction(saveAsBlock);
```