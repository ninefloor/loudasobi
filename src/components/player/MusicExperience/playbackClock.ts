export interface PlaybackSample {
  time: number;
  running: boolean;
  reset: boolean;
}

// A notification store of actual react-player readings, not an independent clock.
export function createPlaybackClock() {
  let sample: PlaybackSample = { time: 0, running: false, reset: true };
  let progress = 0;
  const frames = new Set<(sample: PlaybackSample) => void>();
  const progressListeners = new Set<() => void>();
  return {
    read: () => sample,
    getProgress: () => progress,
    getServerProgress: () => 0,
    subscribeFrame(listener: (sample: PlaybackSample) => void) {
      frames.add(listener);
      return () => {
        frames.delete(listener);
      };
    },
    subscribeProgress(listener: () => void) {
      progressListeners.add(listener);
      return () => {
        progressListeners.delete(listener);
      };
    },
    publish(time: number, running: boolean, reset = false) {
      if (!Number.isFinite(time)) return;
      sample = { time, running, reset };
      frames.forEach((listener) => listener(sample));
      if (reset || Math.abs(time - progress) >= 0.1) {
        progress = time;
        progressListeners.forEach((listener) => listener());
      }
    },
  };
}
export type PlaybackClock = ReturnType<typeof createPlaybackClock>;
