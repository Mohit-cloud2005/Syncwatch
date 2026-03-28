import React, { useState } from "react";
import { Plus, Trash2, ListMusic, Play } from "lucide-react";

interface QueueProps {
  queue: string[];
  isHost: boolean;
  onAddToQueue: (videoId: string) => void;
  onRemoveFromQueue: (index: number) => void;
  onChangeVideo: (videoId: string) => void;
}

export default function Queue({ queue, isHost, onAddToQueue, onRemoveFromQueue, onChangeVideo }: QueueProps) {
  const [url, setUrl] = useState("");

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(url);
    if (videoId) {
      onAddToQueue(videoId);
      setUrl("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border-r border-zinc-800 backdrop-blur-md">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <ListMusic className="w-5 h-5 text-red-600" />
        <h2 className="font-black text-lg tracking-tighter uppercase italic">PLAYLIST</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
            <ListMusic className="w-12 h-12" />
            <p className="text-sm font-bold uppercase tracking-widest">Queue is empty</p>
          </div>
        ) : (
          queue.map((videoId, index) => (
            <div key={`${videoId}-${index}`} className="group relative flex items-center gap-3 p-3 bg-zinc-800/30 rounded-2xl border border-zinc-800 hover:border-red-600/50 transition-all">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                alt="Thumbnail" 
                className="w-20 aspect-video object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest truncate">VIDEO {index + 1}</p>
                <p className="text-sm font-medium text-zinc-300 truncate">{videoId}</p>
              </div>
              <div className="flex flex-col gap-2">
                {isHost && (
                  <button 
                    onClick={() => onChangeVideo(videoId)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => onRemoveFromQueue(index)}
                  className="p-2 bg-zinc-800 hover:bg-red-600 text-white rounded-lg transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Paste YouTube URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 focus:border-red-600 focus:outline-none transition-all font-medium text-sm"
          />
          <button
            type="submit"
            disabled={!url.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
