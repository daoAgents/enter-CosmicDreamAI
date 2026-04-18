# 道衍 SSE 解析修复

## 根本原因

通过 `curl` 直接测试道衍 API，确认：
- **`stream:false`** 返回 `{"answer":""}` 空字符串（API 问题，不可用）
- **`stream:true`** 返回标准 Claude SSE 格式：
  ```
  event:message_start
  data:{"message":{...}}
  event:content_block_delta
  data:{"delta":{"text":"道是...","type":"text_delta"},"index":0,"type":"content_block_delta"}
  ```
- **CORS 正常**：`access-control-allow-origin: *`，不是跨域问题

当前代码用 `decoder.decode(value)` 把 SSE chunk 直接拼接到消息内容，
导致用户看到的是原始 SSE 格式字符串，而不是纯文本答案。

## 修复方案

### 只改 `src/components/game/DaoMasterPanel.tsx`

在 `askDaoyan` 函数的流式读取循环中，替换当前的原始拼接逻辑，改为正确解析 SSE：

```typescript
// 维护跨 chunk 的行缓冲区
let lineBuffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  lineBuffer += decoder.decode(value, { stream: true });

  // 按换行分割，最后一个未完成行留在 buffer
  const lines = lineBuffer.split("\n");
  lineBuffer = lines.pop() ?? "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;

    const jsonStr = trimmed.slice(5).trim();
    if (!jsonStr || jsonStr === "[DONE]") continue;

    try {
      const parsed = JSON.parse(jsonStr);
      // 只提取 content_block_delta 类型的文本增量
      if (
        parsed.type === "content_block_delta" &&
        parsed.delta?.type === "text_delta" &&
        typeof parsed.delta.text === "string"
      ) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content + parsed.delta.text }
              : m
          )
        );
      }
    } catch {
      // 非 JSON 行忽略
    }
  }
}
```

### 修改摘要

| 项目 | 变更 |
|------|------|
| 文件 | `src/components/game/DaoMasterPanel.tsx` |
| 改动位置 | `askDaoyan` 函数内 `while (true)` 读取循环 |
| 变更内容 | 新增 `lineBuffer`；解析 SSE `data:` 行；只提取 `content_block_delta` 的 `delta.text` |
| 其余代码 | 不变 |

## 验证

1. 点击「问道」按钮打开面板
2. 输入「道可道，非常道 是什么意思？」发送
3. 期望：看到流式中文回答，不出现 `event:` / `data:` 等 SSE 原始格式
