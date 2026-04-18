# 复盘 · 测试 · 推送

## Context
全部功能开发完毕，需要做最终质检：运行 Lint、功能复盘、确认 GitHub 同步。

---

## 复盘 —— 本次完整构建内容

### 1. AI Dream Visualizer（梦境可视化）
- Edge Function `ai-dream-analyze`：Claude Opus 4.7 流式诗意解析
- Edge Function `ai-dream-image`：Seedream 4.5 生成梦境图像
- 深空午夜设计系统（index.css + tailwind.config.ts）
- 交互式星空粒子画布（鼠标跟随）、悬浮水晶、星云背景

### 2. 道德经宇宙养成游戏（`/tao`）
- **5 阶段状态机**：混沌·道 → 太极·一 → 两仪·阴阳 → 三才·中气 → 万物·化生
- **资源系统**：阴/阳自动积累 + 中气（化生触发）
- **3 种行动**：无为而化 / 守中和合 / 化生演化
- **AI 宇宙叙事**：Claude Opus 4.7 生成中/英文叙事 + Seedream 4.5 图像
- **宇宙观交互**（CosmosView）：按阶段可点击/拖拽，直接影响阴阳资源 + 涟漪粒子反馈
- **晋升仪式**（StageTransition）：全屏天地裂开动画，阶段专属配色 + 帛书引文
- **道衍 AI 集成**（DaoMasterPanel）：直接调用 REST API，流式回答，多轮对话，自动发送「问道」上下文
- **中/英双语**：73 个 i18n key，AI 叙事随语言切换
- **localStorage 持久化**（含格式版本校验）

### 3. 历次修复
- 暗主题亮度优化
- 中文模式混入英文修复（StageDisplay 副标题、ActionPanel sub-label、ResourcePanel）
- 空白页修复（min-h-full → min-h-screen、变量遮蔽、null 守卫）
- AI 叙事默认英文问题修复

---

## 执行步骤

### Step 1 — 运行 Lint
```
run_lint()
```
修复全部错误（warning 可忽略）。

### Step 2 — 功能自检清单
逐项目视觉核查：
- [ ] `/` 梦境页：输入框、AI 解析流式输出、图像生成
- [ ] `/tao` 游戏页加载正常（非空白）
- [ ] 中文切换：所有文本均为中文，无英文混杂
- [ ] 宇宙观：各阶段可点击，数字气泡飘出
- [ ] 晋升仪式：ActionPanel 晋升按钮触发全屏动画
- [ ] 道衍聊天：点击「问道」自动发送，流式回复

### Step 3 — 确认 GitHub 推送
```bash
git push github main
```
（当前 github/main 已和 main 同步，push 为空操作，但执行以明确确认）

---

## 验证
- Lint：0 errors
- git push：`Everything up-to-date` 或新提交成功推送
