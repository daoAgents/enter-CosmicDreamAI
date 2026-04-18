import { useReducer, useEffect, useCallback, useRef } from "react";

export type GameStage = 0 | 1 | 2 | 3 | 4;

export type ActionType = "wuwei" | "shouzh" | "huasheng";

export interface CosmicEvent {
  id: string;
  stage: GameStage;
  actionType: ActionType;
  text: string;
  imageUrl?: string;
  timestamp: number;
}

export interface GameState {
  stage: GameStage;
  yin: number;
  yang: number;
  zhongqi: number;
  totalEvents: number;
  events: CosmicEvent[];
  lastWuweiTime: number;
  started: boolean;
}

const INITIAL_STATE: GameState = {
  stage: 0,
  yin: 0,
  yang: 0,
  zhongqi: 0,
  totalEvents: 0,
  events: [],
  lastWuweiTime: 0,
  started: false,
};

// Tick rates per stage (resources gained per second)
export const TICK_RATES: Record<GameStage, { yin: number; yang: number }> = {
  0: { yin: 0, yang: 0 },
  1: { yin: 1.5, yang: 1.5 },
  2: { yin: 2.5, yang: 2.5 },
  3: { yin: 3.5, yang: 3.5 },
  4: { yin: 5, yang: 5 },
};

// Stage advance thresholds
export const STAGE_THRESHOLDS: Record<number, { zhongqi: number; events: number }> = {
  0: { zhongqi: 20, events: 0 },  // stage 0→1
  1: { zhongqi: 35, events: 1 },  // stage 1→2
  2: { zhongqi: 55, events: 3 },  // stage 2→3
  3: { zhongqi: 80, events: 6 },  // stage 3→4
};

export const STAGE_NAMES: Record<GameStage, { zh: string; en: string; desc: string; descEn: string }> = {
  0: { zh: "混沌·道", en: "Primordial Chaos · Tao", desc: "虚静无极，道在其中", descEn: "Void and stillness, the Tao within" },
  1: { zh: "太极·一", en: "Great Ultimate · The One", desc: "一气初动，太极生", descEn: "First qi stirs, the Great Ultimate born" },
  2: { zh: "两仪·阴阳", en: "Two Powers · Yin-Yang", desc: "阴阳分判，两仪立", descEn: "Yin and Yang divide, Two Powers arise" },
  3: { zh: "三才·中气", en: "Three Powers · Zhong Qi", desc: "中气居间，三才生", descEn: "Zhong Qi harmonizes, Three Powers emerge" },
  4: { zh: "万物·化生", en: "Ten Thousand Things", desc: "道生万物，化育不息", descEn: "Tao births all things, creation unceasing" },
};

const STORAGE_KEY = "tao-game-state-v1";

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

type Action =
  | { type: "TICK"; delta: number }
  | { type: "WUWEI" }
  | { type: "SHOUZH" }
  | { type: "START_EVENT"; id: string; actionType: ActionType }
  | { type: "UPDATE_EVENT_TEXT"; id: string; text: string }
  | { type: "COMPLETE_EVENT"; id: string; imageUrl?: string }
  | { type: "ADVANCE_STAGE" }
  | { type: "RESET" };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "TICK": {
      if (!state.started) return state;
      const rates = TICK_RATES[state.stage];
      return {
        ...state,
        yin: clamp(state.yin + rates.yin * action.delta),
        yang: clamp(state.yang + rates.yang * action.delta),
      };
    }
    case "WUWEI": {
      const now = Date.now();
      if (now - state.lastWuweiTime < 3000) return state;
      // Burst: add 8 yin + 8 yang, also starts the game
      return {
        ...state,
        started: true,
        yin: clamp(state.yin + 8),
        yang: clamp(state.yang + 8),
        lastWuweiTime: now,
        // After first wuwei in stage 0, advance to stage 1
        stage: state.stage === 0 ? 1 : state.stage,
      };
    }
    case "SHOUZH": {
      if (state.yin < 20 || state.yang < 20) return state;
      return {
        ...state,
        yin: clamp(state.yin - 20),
        yang: clamp(state.yang - 20),
        zhongqi: clamp(state.zhongqi + 15),
      };
    }
    case "START_EVENT": {
      if (state.zhongqi < 30) return state;
      const newEvent: CosmicEvent = {
        id: action.id,
        stage: state.stage,
        actionType: action.actionType,
        text: "",
        timestamp: Date.now(),
      };
      return {
        ...state,
        zhongqi: clamp(state.zhongqi - 30),
        totalEvents: state.totalEvents + 1,
        events: [newEvent, ...state.events],
      };
    }
    case "UPDATE_EVENT_TEXT": {
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.id ? { ...e, text: action.text } : e
        ),
      };
    }
    case "COMPLETE_EVENT": {
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.id ? { ...e, imageUrl: action.imageUrl } : e
        ),
      };
    }
    case "ADVANCE_STAGE": {
      if (state.stage >= 4) return state;
      const threshold = STAGE_THRESHOLDS[state.stage];
      if (!threshold) return state;
      const stageEventsCount = state.events.filter((e) => e.stage === state.stage).length;
      if (state.zhongqi >= threshold.zhongqi && stageEventsCount >= threshold.events) {
        return { ...state, stage: (state.stage + 1) as GameStage };
      }
      return state;
    }
    case "RESET":
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

function loadFromStorage(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      // Validate stage is in range 0-4
      const stage = parsed.stage;
      if (stage !== undefined && (typeof stage !== "number" || stage < 0 || stage > 4)) {
        localStorage.removeItem(STORAGE_KEY);
        return INITIAL_STATE;
      }
      // Validate events have valid stage values
      if (parsed.events) {
        const valid = parsed.events.every(
          (e) => e && typeof e.stage === "number" && e.stage >= 0 && e.stage <= 4
        );
        if (!valid) {
          localStorage.removeItem(STORAGE_KEY);
          return INITIAL_STATE;
        }
      }
      return { ...INITIAL_STATE, ...parsed };
    }
  } catch { /* ignore */ }
  return INITIAL_STATE;
}

function saveToStorage(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadFromStorage);
  const lastTickRef = useRef<number>(Date.now());
  const lastSaveRef = useRef<number>(0);

  // Persist to localStorage — throttled to every 5 seconds to avoid excessive writes
  useEffect(() => {
    const now = Date.now();
    if (now - lastSaveRef.current > 5000) {
      saveToStorage(state);
      lastSaveRef.current = now;
    }
  }, [state]);

  // Always save on unmount to preserve latest state
  useEffect(() => {
    return () => saveToStorage(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      dispatch({ type: "TICK", delta });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const doWuwei = useCallback(() => dispatch({ type: "WUWEI" }), []);
  const doShouzh = useCallback(() => dispatch({ type: "SHOUZH" }), []);

  const startEvent = useCallback((id: string, actionType: ActionType) => {
    dispatch({ type: "START_EVENT", id, actionType });
  }, []);

  const updateEventText = useCallback((id: string, text: string) => {
    dispatch({ type: "UPDATE_EVENT_TEXT", id, text });
  }, []);

  const completeEvent = useCallback((id: string, imageUrl?: string) => {
    dispatch({ type: "COMPLETE_EVENT", id, imageUrl });
  }, []);

  const tryAdvanceStage = useCallback(() => {
    dispatch({ type: "ADVANCE_STAGE" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check if can advance stage (stage 0→1 is handled by WUWEI directly)
  const canAdvanceStage = (() => {
    if (state.stage === 0 || state.stage >= 4) return false;
    const threshold = STAGE_THRESHOLDS[state.stage];
    if (!threshold) return false;
    const stageEventsCount = state.events.filter((e) => e.stage === state.stage).length;
    return state.zhongqi >= threshold.zhongqi && stageEventsCount >= threshold.events;
  })();

  const wuweiCooldown = Math.max(0, 3000 - (Date.now() - state.lastWuweiTime));

  return {
    state,
    doWuwei,
    doShouzh,
    startEvent,
    updateEventText,
    completeEvent,
    tryAdvanceStage,
    reset,
    canAdvanceStage,
    wuweiCooldown,
  };
}
