declare module 'node-os-utils' {
  export const cpu: { usage: () => Promise<number> };
  export const mem: {
    info: () => Promise<{
      totalMemMb: number;
      usedMemMb: number;
      freeMemMb: number;
      usedMemPct: number;
    }>;
  };
}