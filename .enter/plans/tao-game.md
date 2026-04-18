# Cosmos Interactive Click Plan

## Context
User wants the CosmosView visualization to be directly interactive — clicking/dragging the cosmic orbs should affect yin/yang resources, making the game feel tactile and alive.

## Goal
Make each stage's CosmosView visualization respond to clicks and drags with:
1. Visual feedback (ripple rings, glow bursts)
2. Actual resource gain based on which element was clicked
3. Rate limiting to prevent spam-clicking

---

## Stage-by-Stage Mechanics

| Stage | Element | Click Effect | Drag Effect |
|-------|---------|-------------|-------------|
| 0 | Void dot | Trigger Wu Wei (same as button) | — |
| 1 | Unified sphere | +4 yin +4 yang (2s cooldown) | — |
| 2 | Yang orb (gold) | +5 yang | Drag away from center → on release: burst up to +10 yang |
| 2 | Yin orb (dark) | +5 yin | Drag away from center → on release: burst up to +10 yin |
| 3 | Yang orb | +3 yang | — |
| 3 | Yin orb | +3 yin | — |
| 3 | Zhong Qi center | +2 zhongqi | — |
| 4 | Any orbiting particle | +1 yin or yang (random) | — |

Rate limit: 800ms cooldown per clickable element.

---

## Visual Feedback

### Ripple Ring
- On click: an expanding semi-transparent ring appears at click position, animates outward, fades in ~600ms
- Implemented as a temporary `<div>` injected into CosmosView with CSS keyframe `ripple-expand`
- Color matches the resource gained (yin = indigo, yang = gold, zhongqi = green)

### Resource Float Text
- "+5 阳" floats up from click position and fades out in 800ms
- Small text, colored to match resource
- Implemented as an absolutely-positioned span with CSS keyframe `float-up-fade`

### Orb Glow Pulse
- Clicked orb briefly scales to 1.2× then returns (CSS transition)
- Glow intensity peaks for 200ms then returns

### Stage 2 Drag
- Clicked orb follows cursor position (capped at 60px from center)
- Shows a "tension line" between orb and center
- On release: orb snaps back + ripple burst proportional to drag distance

---

## Implementation Plan

### 1. `src/hooks/useGameState.ts`
Add new action and dispatcher:
```typescript
| { type: "COSMOS_TOUCH"; resource: "yin" | "yang" | "zhongqi"; amount: number }
```
In reducer `COSMOS_TOUCH`: clamp resources.
Export `doCosmosTouch(resource, amount)`.

### 2. `src/components/game/CosmosView.tsx`
**Complete rewrite** — keep all existing visuals, add:
- `onTouch?: (resource: "yin" | "yang" | "zhongqi", amount: number) => void` prop
- `onTriggerWuwei?: () => void` prop (for stage 0 click)
- Per-element click handlers with 800ms cooldown tracking via `useRef<Record<string, number>>`
- Ripple state: `ripples: Array<{id, x, y, color}>` — each renders as expanding ring
- Float text state: `floats: Array<{id, x, y, label, color}>`
- Stage 2 drag state: `dragState: {active, orb, startX, startY, currentX, currentY} | null`
- CSS keyframes added inline via `<style>` tag inside component or added to `index.css`

### 3. `src/pages/TaoGame.tsx`
Pass new props to CosmosView:
```tsx
<CosmosView
  stage={state.stage}
  yin={state.yin}
  yang={state.yang}
  zhongqi={state.zhongqi}
  onTouch={doCosmosTouch}
  onTriggerWuwei={doWuwei}
/>
```

### 4. `src/index.css`
Add two new keyframes:
```css
@keyframes ripple-expand {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}
@keyframes float-up-fade {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
}
```

---

## Files to Modify
1. `src/hooks/useGameState.ts` — add `COSMOS_TOUCH` action + `doCosmosTouch`
2. `src/components/game/CosmosView.tsx` — complete rewrite with interactivity
3. `src/pages/TaoGame.tsx` — pass new props to CosmosView
4. `src/index.css` — add `ripple-expand` and `float-up-fade` keyframes

---

## Verification
- Click yin orb in stage 2 → yin bar increases by 5
- Click yang orb in stage 2 → yang bar increases by 5
- Ripple ring appears and fades within 600ms
- Float text "+5 阳" appears and fades within 800ms
- Rate limiting works: rapid clicking doesn't stack (800ms cooldown per element)
- Stage 0 click triggers Wu Wei (game starts)
- Stage 2 drag: dragging orb shows tension, release causes burst
