'use client';

import { useState, useEffect, useCallback } from 'react';
import { demoScenarios } from '@/lib/demoScenarios';

export function useBubbleCycle(intervalMs = 4000) {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const scenario = demoScenarios[index];

  const next = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % demoScenarios.length);
      setIsVisible(true);
    }, 350);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [next, intervalMs]);

  return { scenario, isVisible, index };
}
