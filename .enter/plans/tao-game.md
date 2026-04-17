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

## 视觉设计

- **布局**：左侧「太极台」（宇宙动画+资源+操作按钮）/ 右侧「天道录」（事件日志）
- **中央宇宙**：CSS动画太极符号，随阶段演化（混沌→点→阴阳鱼→三才→万物涌现）
- **资源条**：液态填充条，阴=深蓝紫，阳=暖金，中气=翠绿白
- **阶段文字**：Cormorant Garamond 衬线字体，如梦如幻的过渡动画
- **事件卡片**：glassmorphism + 图像portal效果（复用DreamPortal样式）

---

## 验证

1. 新增路由 `/tao` 可访问，`/` 梦境可视化正常
2. 资源每秒被动递增（控制台可见 tick）
3. 「守中」按钮在阴阳不足时禁用
4. 「化生」触发后：右侧出现流式AI文字，图像淡入
5. 阶段正确推进，CosmosView 动画变化
6. 刷新页面后游戏状态从 localStorage 恢复
