'use client';

import { useESTClock } from '@/lib/use-est-clock';
import StudioShell from '@/components/layout/StudioShell';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { time, day } = useESTClock();

  return (
    <div
      className="relative h-screen w-full overflow-hidden flex"
      style={{ background: '#0A0A0E' }}
    >
      <StudioShell time={time} day={day} />
    </div>
  );
}