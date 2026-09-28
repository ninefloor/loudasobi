"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPlaybackClock } from "./playbackClock";

export function usePlayback() {
  const playerRef = useRef<HTMLVideoElement>(null);
  const attachPlayer = useCallback((player: HTMLVideoElement | null) => {
    playerRef.current = player;
  }, []);
  const frameRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const seekingRef = useRef(false);
  const seekTargetRef = useRef(0);
  const [clock] = useState(createPlaybackClock);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<"playError" | "loadError" | null>(null);

  const sync = useCallback(
    (reset = false) => {
      const player = playerRef.current;
      if (!player) return;
      clock.publish(
        player.currentTime,
        runningRef.current && !seekingRef.current && !document.hidden,
        reset || seekingRef.current,
      );
    },
    [clock],
  );

  const syncDuration = useCallback(() => {
    const value = playerRef.current?.duration;
    if (value !== undefined && Number.isFinite(value)) setDuration(value);
  }, []);

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    if (document.hidden) return;
    const tick = () => {
      sync();
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [stop, sync]);

  useEffect(() => {
    const handleVisibility = () => {
      stop();
      sync(true);
      if (!document.hidden && runningRef.current && !seekingRef.current)
        start();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stop();
    };
  }, [start, stop, sync]);

  const play = useCallback(async () => {
    try {
      setError(null);
      await playerRef.current?.play();
    } catch {
      setError("playError");
    }
  }, []);

  const seek = useCallback(
    (time: number, resume = false) => {
      const player = playerRef.current;
      if (!player || !ready || !Number.isFinite(time)) return;
      const limit =
        Number.isFinite(player.duration) && player.duration > 0
          ? player.duration
          : Infinity;
      const target = Math.max(0, Math.min(time, limit));
      // A no-op seek might not emit seeked; do not stop the sampler in that case.
      if (Math.abs(target - player.currentTime) > 0.001) {
        seekingRef.current = true;
        seekTargetRef.current = target;
        stop();
        sync(true);
        player.currentTime = target;
      } else {
        sync(true);
      }
      if (resume) void play();
    },
    [ready, stop, sync, play],
  );

  const seekBy = useCallback(
    (delta: number) => {
      const player = playerRef.current;
      if (!player || !ready) return;
      const current = seekingRef.current
        ? seekTargetRef.current
        : player.currentTime;
      player.pause();
      seek(Math.round((current + delta) * 10000) / 10000);
    },
    [ready, seek],
  );

  return {
    attachPlayer,
    clock,
    duration,
    playing,
    ready,
    buffering,
    playerKey,
    volume,
    error,
    setVolume,
    seek,
    seekBy,
    retry: () => {
      if (error === "playError") {
        void play();
        return;
      }
      stop();
      runningRef.current = false;
      seekingRef.current = false;
      seekTargetRef.current = 0;
      setPlaying(false);
      setReady(false);
      setBuffering(false);
      setDuration(0);
      setError(null);
      clock.publish(0, false, true);
      setPlayerKey((key) => key + 1);
    },
    toggle: () => {
      if (playing) void playerRef.current?.pause();
      else void play();
    },
    events: {
      onLoadedMetadata: () => {
        setReady(true);
        setError(null);
        syncDuration();
        sync(true);
      },
      onDurationChange: syncDuration,
      onTimeUpdate: () => sync(),
      onSeeking: () => {
        seekingRef.current = true;
        stop();
        sync(true);
      },
      onSeeked: () => {
        seekingRef.current = false;
        sync(true);
        if (runningRef.current) start();
      },
      onPlaying: () => {
        setBuffering(false);
        setError(null);
        runningRef.current = true;
        seekingRef.current = false;
        setPlaying(true);
        sync(true);
        start();
      },
      onPlay: () => {
        setPlaying(true);
        sync(true);
      },
      onWaiting: () => {
        setBuffering(true);
        runningRef.current = false;
        stop();
        sync(true);
      },
      onPause: () => {
        setBuffering(false);
        runningRef.current = false;
        setPlaying(false);
        stop();
        sync(true);
      },
      onEnded: () => {
        setBuffering(false);
        runningRef.current = false;
        setPlaying(false);
        stop();
        sync(true);
      },
      onError: () => {
        setReady(false);
        setBuffering(false);
        setError("loadError");
        runningRef.current = false;
        setPlaying(false);
        stop();
        sync(true);
      },
    },
  };
}
export type Playback = Omit<ReturnType<typeof usePlayback>, "attachPlayer">;
