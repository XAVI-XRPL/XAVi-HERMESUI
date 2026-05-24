'use client';
import { useState, useEffect, useMemo } from 'react';

export function useESTClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  const time = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now),
    [now]
  );

  const day = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(now),
    [now]
  );

  return { time, day };
}