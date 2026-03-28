import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

interface VideoPlayerProps {
  videoId: string;
  playing: boolean;
  currentTime: number;
  lastUpdate: number;
  isHost: boolean;
  onStateChange: (state: { playing: boolean; currentTime: number }) => void;
}

export interface VideoPlayerRef {
  getCurrentTime: () => number;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoId, playing, currentTime, lastUpdate, isHost, onStateChange }, ref) => {
    const [player, setPlayer] = useState<any>(null);
    const lastUpdateRef = useRef<number>(0);

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => {
        if (player && typeof player.getCurrentTime === 'function') {
          return player.getCurrentTime();
        }
        return currentTime;
      }
    }));

    useEffect(() => {
      if (!player || typeof player.getPlayerState !== 'function') return;

      try {
        const playerState = player.getPlayerState();
        
        // Sync playing state
        if (playing && playerState !== 1) {
          player.playVideo();
        } else if (!playing && playerState !== 2) {
          player.pauseVideo();
        }

        // Sync time if drift is > 2 seconds (only for non-hosts)
        if (!isHost && typeof player.getCurrentTime === 'function') {
          const playerTime = player.getCurrentTime();
          const expectedTime = playing 
            ? currentTime + (Date.now() - lastUpdate) / 1000 
            : currentTime;
            
          if (Math.abs(playerTime - expectedTime) > 2) {
            player.seekTo(expectedTime, true);
          }
        }
      } catch (e) {
        console.warn("Player sync warning:", e);
      }
    }, [player, playing, currentTime, lastUpdate, videoId, isHost]);

    const onReady: YouTubeProps["onReady"] = (event) => {
      if (event.target) {
        setPlayer(event.target);
      }
    };

    const handleStateChange: YouTubeProps["onStateChange"] = (event) => {
      if (!isHost || !event.target) return;

      const playerInstance = event.target;
      const newState = event.data;
      const now = Date.now();

      if (now - lastUpdateRef.current < 500) return;
      lastUpdateRef.current = now;

      try {
        if (typeof playerInstance.getCurrentTime === 'function') {
          if (newState === 1) { // Playing
            onStateChange({ playing: true, currentTime: playerInstance.getCurrentTime() });
          } else if (newState === 2) { // Paused
            onStateChange({ playing: false, currentTime: playerInstance.getCurrentTime() });
          }
        }
      } catch (e) {
        console.warn("State change handling warning:", e);
      }
    };

    const opts: YouTubeProps["opts"] = {
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 1,
        controls: isHost ? 1 : 0,
        disablekb: isHost ? 0 : 1,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
      },
    };

    if (!videoId) {
      return (
        <div className="relative w-full aspect-video bg-black rounded-3xl flex items-center justify-center border border-zinc-800">
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No video selected</p>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
        <div className="absolute inset-0 w-full h-full">
          <YouTube
            key={videoId}
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onStateChange={handleStateChange}
            className="w-full h-full"
          />
        </div>
        {!isHost && (
          <div className="absolute inset-0 z-10 cursor-not-allowed bg-transparent" />
        )}
      </div>
    );
  }
);

export default VideoPlayer;
