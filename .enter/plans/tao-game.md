# 道衍 API 集成优化计划

## Context

之前的集成方式是通过 iframe 嵌入 道衍 SPA，用 postMessage（跨域失败）+ QueryBanner（剪贴板复制）来传递问题。
API 文档揭示 道衍 提供了标准 REST Agent API，支持流式响应和多轮对话，anon key 是可公开的 publishable key。
因此可以**完全移除 iframe**，改为直接调用 API，构建原生聊天 UI，实现真正无缝集成。

## API 信息

- **Endpoint**: `POST https://spb-t4nnhrh7ch7j2940.supabase.opentrust.net/functions/v1/daoyan-agent-api`
- **Auth**: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InNwYi10NG5uaHJoN2NoN2oyOTQwIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzYwNzQ1MjMsImV4cCI6MjA5MTY1MDUyM30.5GFdUIA3rHOUoCI99ocBzBxDZjjQxOHRV-T6CKiHzCQ`（publishable，前端安全）
- **参数**: `question`, `conversation_history[]`, `locale`, `stream`
- **流式**: `stream: true` → ReadableStream 直接返回文本块

## 变更文件

### 1. `src/components/game/DaoMasterPanel.tsx` — 完全重写

**移除**:
- iframe 和 DAO_YAN_URL 相关代码
- QueryBanner 组件（复制粘贴方案）
- postMessage / tryPostMessage 逻辑
- iframeReady 状态

**新增**:
- `ChatMessage` 类型: `{ role: "user" | "assistant", content: string, id: string }`
- `messages: ChatMessage[]` 状态 — 对话历史
- `inputValue: string` 状态 — 输入框
- `isStreaming: boolean` 状态 — 防止并发
- `askDaoyan(question: string)` 函数:
  1. 追加 user 消息到 messages
  2. 追加空 assistant 消息（流式占位）
  3. fetch API，`stream: true`，locale 跟随 `i18n.language`
  4. ReadableStream reader 逐块追加文本到 assistant 消息
  5. 完成后 setIsStreaming(false)
- 聊天 UI（滚动消息列表 + 底部输入框）
- 消息气泡：user 右对齐，assistant 左对齐，风格匹配游戏主题
- `conversation_history` 由 messages 状态自动维护（每次调用传入所有历史）

**contextQuery 行为**:
- 当 `contextQuery` 到来 → setIsOpen(true) + 自动调用 `askDaoyan(contextQuery)` → 不再需要手动复制

### 2. `src/i18n/locales/zh.json` 和 `en.json`

**移除旧 key（不再需要）**:
- `query_banner_label`, `copy_button`, `copied`, `copy_hint`

**新增 key**:
```json
"tao.daomaster.input_placeholder": "向道衍提问……"
"tao.daomaster.send_button": "问"
"tao.daomaster.thinking": "道衍正在思索……"
"tao.daomaster.empty_hint": "游戏事件会自动为你提问，也可直接输入"
```

## 关键技术细节

### 流式读取
```typescript
const response = await fetch(DAOYAN_API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
  body: JSON.stringify({ question, conversation_history: history, locale, stream: true }),
});
const reader = response.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // append chunk to current assistant message
}
```

### conversation_history 格式
```typescript
messages
  .filter(m => m.id !== currentAssistantId)  // exclude streaming placeholder
  .map(m => ({ role: m.role, content: m.content }))
```

## 验证

1. 点击「问道师」按钮 → 侧边栏打开，显示空聊天或历史消息
2. 点击事件卡片「问道」→ 侧边栏自动打开，问题自动发送，流式答案出现
3. 在输入框输入自定义问题 → 发送后流式显示答案
4. 多轮对话 → 历史消息正确传递，道衍能参考上下文回答
5. 中英文切换 → locale 参数跟随语言切换
