import { useState, useCallback } from "react";

export interface TaoRecord {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
}

const STORAGE_KEY = "tao-dao-records-v1";

function loadRecords(): TaoRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function useTaoRecords() {
  const [records, setRecords] = useState<TaoRecord[]>(loadRecords);

  const addRecord = useCallback((question: string, answer: string) => {
    const record: TaoRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      question,
      answer,
      timestamp: Date.now(),
    };
    setRecords((prev) => {
      const next = [record, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage full, ignore
      }
      return next;
    });
  }, []);

  return { records, addRecord };
}
