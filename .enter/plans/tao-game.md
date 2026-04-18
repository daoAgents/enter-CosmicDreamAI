# 天道录集成方案

## Context
用户希望将道衍的问答结果「嵌入」游戏主界面，作为名为「天道录」的第二个日志标签，与现有的「化生录」（CosmicEvent Log）并列。每次道衍回答完毕，该条问答自动存档到天道录，供玩家随时回看。

## 目标
- 右侧日志区增加两个标签页：「化生录」和「天道录」
- 道衍每次完成流式回答 → 自动保存到天道录
- 天道录以古典卷轴风格展示问答对
- 支持双语（中/英）
- 本地 localStorage 持久化

---

## 需要修改的文件

### 1. `src/components/game/DaoMasterPanel.tsx`
- 新增 prop：`onRecordSaved?: (question: string, answer: string) => void`
- 流式完成后（`setIsStreaming(false)` 之前）调用 `onRecordSaved(question, finalAnswer)`
- 在 `askDaoyan` 末尾用 `ref` 收集完整 answer 字符串，流结束时回调

### 2. 新建 `src/components/game/TaoRecords.tsx`
- Props: `records: TaoRecord[]`
- 每条记录卡片：
  - 顶部：`问道` 问题文本（小字，user 角色颜色）
  - 主体：道衍回答（serif 字体，卷轴样式）
  - 底部：时间戳
- 空状态：「天道未启，先向道衍问道」
- 支持 Markdown 基础渲染（`**bold**` → 加粗，`\n\n` → 段落）

### 3. 新建 `src/hooks/useTaoRecords.ts`
```typescript
interface TaoRecord {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
}
```
- `useState<TaoRecord[]>` 管理记录列表
- `addRecord(question, answer)` 方法
- localStorage key: `tao-dao-records-v1`
- 初始化时从 localStorage 加载

### 4. `src/pages/TaoGame.tsx`
- 引入 `useTaoRecords`
- 给 `DaoMasterPanel` 传入 `onRecordSaved`
- 右侧面板增加标签页：
  ```
  [化生录]  [天道录 (新:2)]
  ```
- `activeTab: "events" | "records"` 本地 state
- 新记录到来时，若不在天道录 tab，显示数字 badge

### 5. `src/i18n/locales/zh.json` + `en.json`
新增键（需两文件同步）：
- `tao.tabs.events` = "化生录" / "Cosmic Events"
- `tao.tabs.records` = "天道录" / "Celestial Records"
- `tao.taorecords.empty_title` = "天道待启" / "Awaiting Wisdom"
- `tao.taorecords.empty_desc` = "向道衍问道，智慧将在此留存" / "Ask Dao Yan a question..."
- `tao.taorecords.question_label` = "问" / "Question"
- `tao.taorecords.answer_label` = "道衍曰" / "Dao Yan"

---

## 样式规范
- 卷轴卡片：`border-left: 2px solid hsl(45 80% 50% / 0.6)` 金色左边框
- 问题部分：`hsl(220 15% 50%)` 淡色，`font-size: 0.78rem`
- 答案部分：`hsl(45 70% 80%)` 金色调，`font-serif`，行高 1.8
- 标签页：glassmorphism 风格，active 时金色底线

---

## 验证方法
1. 点击化生录事件的「问道」按钮 → 道衍面板弹出
2. 道衍回答完毕 → 天道录标签出现数字 badge
3. 切到天道录 tab → 看到该条问答以卷轴样式呈现
4. 刷新页面 → 天道录记录依然存在（localStorage）
5. 中英文切换后标签名和空状态文本正确切换
