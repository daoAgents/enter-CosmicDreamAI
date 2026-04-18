# 太初·道德经宇宙创世养成游戏

## Context
基于飞书文档《道德经宇宙生成论》构建一个养成系游戏，核心哲学是「道生一，一生二，二生三，三生万物」和「中气以为和」。游戏是独立新页面 `/tao`，现有梦境可视化 `/` 保留不变。

---

## 游戏设计

### 五阶段宇宙创世
| 阶段 | 名称 | 触发条件 | 描述 |
|------|------|---------|------|
| 0 | 混沌·道 | 初始 | 只有道，虚静无极 |
| 1 | 太极·一 | 消耗首批道德 | 一气初动，太极生 |
| 2 | 两仪·阴阳 | 中气≥30 | 阴阳分判，两仪立 |
| 3 | 三才·中气 | 中气≥60 + 事件×3 | 中气居间，三才生 |
| 4 | 万物·化生 | 中气≥100 + 事件×6 | 道生万物，化育不息 |

### 资源系统（3种）
- **阳 Yang** — 亮色，每秒被动生成（量取决于阶段）
- **阴 Yin** — 暗色，每秒被动生成
- **中气 Zhong Qi** — 当阴阳各≥20 时，每次「守中」操作将阴阳各消耗20转化为+15中气

### 核心操作
1. **无为而化** — 启动/加速被动生成（冷却3秒），产出道德+阴阳
2. **守中和合** — 消耗阴20+阳20，生成中气15（需阴阳各≥20）
3. **化生演化** — 消耗中气30，触发「创世事件」：调用AI生成描述+图像，推进阶段（需满足阶段阈值）

### 创世事件（AI驱动）
每次「化生演化」同时触发：
1. `ai-cosmic-event` 边缘函数 — Claude Opus 4.7 流式输出诗意描述（当前阶段+操作类型）
2. `ai-cosmic-image` 边缘函数 — Seedream 4.5 生成该事件的宇宙图像

事件累积在右侧「天道录」日志，带AI文字+图像，滚动展示历史。

---

## 技术架构

### 新增文件
```
src/pages/TaoGame.tsx                        # 主游戏页面（布局协调）
src/components/game/CosmosView.tsx           # 中央宇宙动画（CSS/SVG太极演化）
src/components/game/ResourcePanel.tsx        # 阴/阳/中气资源显示
src/components/game/ActionPanel.tsx          # 操作按钮（状态感知）
src/components/game/EventLog.tsx             # 天道录 — 流式文字+图像卡片
src/components/game/StageDisplay.tsx         # 当前阶段 + 进度指示
src/hooks/useGameState.ts                    # 游戏核心状态（useReducer + localStorage）
src/hooks/useCosmicEvent.ts                  # AI事件调用（复用已有SSE + image hooks模式）
supabase/functions/ai-cosmic-event/index.ts  # 创世事件描述（Claude Opus 4.7, 流式）
```

### 修改文件
- `src/router.tsx` — 添加 `/tao` 路由
- `src/pages/Index.tsx` — 右上角添加「进入太初」导航入口
- `src/i18n/locales/zh.json` + `en.json` — 新增 `tao` 命名空间

### 复用已有内容
- `NebulaBackground`, `StarfieldCanvas` — 直接复用为游戏背景
- `useDreamImage` hook 模式 — `useCosmicEvent` 以同样模式调用图像生成
- `useDreamAnalysis` hook 模式 — SSE流式文字以同样方式处理
- `supabase/functions/ai-dream-image` — 直接复用图像生成（传不同prompt）
- Glassmorphism `.glass` / `.glass-strong` 工具类 — 所有游戏卡片

### 游戏状态结构（localStorage持久化）
```typescript
interface GameState {
  stage: 0 | 1 | 2 | 3 | 4;
  yin: number;         // 0–100
  yang: number;        // 0–100
  zhongqi: number;     // 0–100
  totalEvents: number; // 已触发创世事件总数
  events: CosmicEvent[];
  lastActionTime: number;
}
interface CosmicEvent {
  id: string;
  stage: number;
  text: string;        // AI流式文字（最终完整）
  imageUrl?: string;
  timestamp: number;
}
```

---

## 道衍智能体集成

### 智能体信息
- **名称**：道衍（DaoYan）  
- **URL**：`https://167c2bc1450e4ea3a0dc4b07c5873069.prod.enter.pro/`  
- **能力**：81章帛书老子、10个修炼境界、网络搜索、文档库
- **角色定位**：游戏中的「道师」——玩家在游戏过程中可随时向道师问道

### 集成方式
**iframe 嵌入侧边面板**，右侧悬浮抽屉（Drawer）：
- 固定「问道」按钮悬浮在游戏右侧
- 点击后从右滑出全高抽屉，内嵌道衍 iframe
- 抽屉宽度：桌面端 420px，移动端全屏
- iframe 100% 高度，无边框，深色主题融合

---

## 道衍集成修复方案

### 根本原因
道衍是 React SPA（只有 `/` 路由），`?q=encoded_query` URL 参数不被任何路由处理器读取，iframe src 更新不会触发问题预填。

### 修复策略：双层保障

**Layer 1 — postMessage（最优，无感）**  
iframe 加载完成后，向其 `contentWindow` 发送结构化消息：
```javascript
iframeRef.current?.contentWindow?.postMessage(
  { type: 'ENTER_CHAT_INPUT', message: query },
  'https://167c2bc1450e4ea3a0dc4b07c5873069.prod.enter.pro'
)
```
如果道衍的聊天框架监听此事件，即可自动填充 — 零用户操作。

**Layer 2 — 可见复制条（100% 可靠兜底）**  
当 `contextQuery` 存在时，在 iframe 上方展示醒目的「问题横幅」：
- 完整问题文本（可滚动，白色衬线字体）
- 「一键复制」按钮（点击后变为 ✓ 已复制）
- 提示文字：「已复制，请粘贴至下方对话框 ↓」
- 横幅在用户点击复制后 3 秒自动淡出，不遮挡对话

### 修改文件
只修改 `src/components/game/DaoMasterPanel.tsx`：

1. **移除**：`setIframeSrc` 拼接 `?q=` 参数的逻辑
2. **添加**：`iframeRef` 上 `onLoad` 事件 → 发送 postMessage
3. **添加**：`QueryBanner` 内联组件 — 问题文本展示 + 复制按钮 + 淡出动画
4. **保持**：iframe 始终指向固定 URL（无参数），避免重新加载

### 交互流程（修复后）
```
用户点击事件卡片「问道」按钮
    → DaoMasterPanel 滑出
    → 面板顶部出现「问题横幅」（含问题文字 + 复制按钮）
    → 同时尝试 postMessage 注入（如道衍支持，自动填充）
    → 用户点击「复制」 → 粘贴进道衍输入框
    → 横幅 3 秒后淡出
```

### 验证
- 点击事件卡片「问道」→ 面板滑出 → 顶部横幅显示正确问题文本
- 点击「一键复制」→ 文字变 ✓ → 可粘贴至道衍对话框
- 直接点击「问道师」按钮（无 query）→ 无横幅，直接显示 iframe
- 横幅 3 秒自动淡出不影响 iframe 交互



---

## 视觉设计

- **主布局**：中左侧「太极台」（宇宙动画+资源+操作）/ 右侧「天道录」（事件日志）
- **道师入口**：固定在右下角的「☯ 问道」悬浮按钮
- **道衍侧边栏**：从右侧滑入的全高半透明抽屉，内嵌道衍 iframe
- **中央宇宙**：CSS动画太极符号，随阶段演化（混沌→点→阴阳鱼→三才→万物涌现）
- **资源条**：液态填充条，阴=深蓝紫，阳=暖金，中气=翠绿白
- **阶段文字**：Cormorant Garamond 衬线字体，如梦如幻的过渡动画
- **事件卡片**：glassmorphism + 图像portal效果，点击可向道师提问

---

## 验证

1. 新增路由 `/tao` 可访问，`/` 梦境可视化正常
2. 资源每秒被动递增
3. 「守中」按钮在阴阳不足时禁用
4. 「化生」触发后：右侧出现流式AI文字，图像淡入
5. 阶段正确推进，CosmosView 动画变化
6. 刷新页面后游戏状态从 localStorage 恢复
7. 「问道」按钮点击后滑出道衍抽屉，iframe 正常加载
8. 点击事件卡片后，道衍 iframe 自动填充相关问题
