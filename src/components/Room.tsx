import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { io, Socket } from "socket.io-client";
import { Share2, Users, Crown, LogOut, Loader2, PlayCircle, PauseCircle, SkipForward } from "lucide-react";
import VideoPlayer, { VideoPlayerRef } from "./VideoPlayer";
import Chat from "./Chat";
import Queue from "./Queue";
import Reactions from "./Reactions";

interface RoomState {
  host: string;
  videoState: {
    videoId: string;
    currentTime: number;
    playing: boolean;
    lastUpdate: number;
  };
  queue: string[];
  users: { id: string; name: string; photo: string }[];
}

export default function Room({ user }: { user: User }) {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socketRef.current = io();
    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("join-room", {
        roomId,
        user: { name: user.displayName, photo: user.photoURL },
      });
    });

    socket.on("room-state", (state: RoomState) => {
      setRoomState(state);
      setIsHost(state.host === socket.id);
      setLoading(false);
    });

    socket.on("video-state-update", (videoState) => {
      setRoomState(prev => prev ? { ...prev, videoState } : null);
    });

    socket.on("video-changed", (videoState) => {
      setRoomState(prev => prev ? { ...prev, videoState } : null);
    });

    socket.on("chat-message", (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on("reaction", (reaction) => {
      setReactions(prev => [...prev, { ...reaction, id: Math.random().toString() }]);
      setTimeout(() => {
        setReactions(prev => prev.slice(1));
      }, 3000);
    });

    socket.on("queue-updated", (queue) => {
      setRoomState(prev => prev ? { ...prev, queue } : null);
    });

    socket.on("host-updated", (newHostId) => {
      setRoomState(prev => prev ? { ...prev, host: newHostId } : null);
      setIsHost(newHostId === socket.id);
    });

    socket.on("user-joined", (newUser) => {
      setRoomState(prev => prev ? { ...prev, users: [...prev.users, newUser] } : null);
    });

    socket.on("user-left", (userId) => {
      setRoomState(prev => prev ? { ...prev, users: prev.users.filter(u => u.id !== userId) } : null);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, user]);

  const handleVideoStateChange = (state: { playing: boolean; currentTime: number }) => {
    if (isHost && socketRef.current) {
      socketRef.current.emit("video-state-change", {
        roomId,
        state: { ...roomState?.videoState, ...state },
      });
    }
  };

  const handlePlayPause = () => {
    if (!roomState || !isHost) return;
    const currentTime = videoPlayerRef.current?.getCurrentTime() ?? roomState.videoState.currentTime;
    handleVideoStateChange({ 
      playing: !roomState.videoState.playing, 
      currentTime 
    });
  };

  const handleSendMessage = (text: string) => {
    if (socketRef.current) {
      socketRef.current.emit("chat-message", {
        roomId,
        message: { user: { name: user.displayName, photo: user.photoURL }, text },
      });
    }
  };

  const handleSendReaction = (emoji: string) => {
    if (socketRef.current) {
      socketRef.current.emit("reaction", {
        roomId,
        reaction: { emoji, x: Math.random() * 100 - 50 },
      });
    }
  };

  const handleAddToQueue = (videoId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("add-to-queue", { roomId, videoId });
    }
  };

  const handleRemoveFromQueue = (index: number) => {
    if (socketRef.current) {
      socketRef.current.emit("remove-from-queue", { roomId, index });
    }
  };

  const handleChangeVideo = (videoId: string) => {
    if (isHost && socketRef.current) {
      socketRef.current.emit("change-video", { roomId, videoId });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Room link copied to clipboard!");
  };

  if (loading || !roomState) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-600" />
          <p className="font-black tracking-widest uppercase italic text-zinc-500">CONNECTING TO ROOM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-white flex overflow-hidden">
      {/* Left Sidebar: Queue */}
      <div className="w-80 hidden lg:block">
        <Queue 
          queue={roomState.queue} 
          isHost={isHost}
          onAddToQueue={handleAddToQueue}
          onRemoveFromQueue={handleRemoveFromQueue}
          onChangeVideo={handleChangeVideo}
        />
      </div>

      {/* Main Content: Video Player */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Top Navbar */}
        <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-red-600 italic leading-none">WATCH TOGETHER</h1>
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">ROOM ID: {roomId}</span>
            </div>
            <button 
              onClick={copyLink}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold py-2 px-4 rounded-full transition-all active:scale-95"
            >
              <Share2 className="w-3 h-3" /> SHARE
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {roomState.users.slice(0, 3).map((u) => (
                <img 
                  key={u.id} 
                  src={u.photo || `https://picsum.photos/seed/${u.id}/200`} 
                  alt={u.name || "User"} 
                  title={u.name || "User"}
                  className="w-8 h-8 rounded-full border-2 border-zinc-900"
                  referrerPolicy="no-referrer"
                />
              ))}
              {roomState.users.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold">
                  +{roomState.users.length - 3}
                </div>
              )}
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <button 
              onClick={() => navigate("/")}
              className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#0a0a0a_100%)]">
          <div className="w-full max-w-5xl relative">
            <VideoPlayer
              ref={videoPlayerRef}
              videoId={roomState.videoState.videoId}
              playing={roomState.videoState.playing}
              currentTime={roomState.videoState.currentTime}
              lastUpdate={roomState.videoState.lastUpdate}
              isHost={isHost}
              onStateChange={handleVideoStateChange}
            />
            
            <Reactions reactions={reactions} />
            
            {/* Host Controls Overlay */}
            <div className="mt-8 flex items-center justify-between w-full bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 backdrop-blur-md">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${roomState.videoState.playing ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-xs font-black tracking-widest uppercase text-zinc-400">
                    {roomState.videoState.playing ? 'LIVE SYNC' : 'PAUSED'}
                  </span>
                </div>
                {isHost && (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handlePlayPause}
                      className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform active:scale-95"
                    >
                      {roomState.videoState.playing ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                    </button>
                    <button 
                      onClick={() => {
                        if (roomState.queue.length > 0) {
                          handleChangeVideo(roomState.queue[0]);
                          handleRemoveFromQueue(0);
                        }
                      }}
                      className="p-3 bg-zinc-800 text-white rounded-full hover:scale-110 transition-transform active:scale-95"
                    >
                      <SkipForward className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Crown className={`w-5 h-5 ${isHost ? 'text-yellow-500' : 'text-zinc-600'}`} />
                <div className="text-right">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ROOM HOST</p>
                  <p className="text-sm font-black italic uppercase tracking-tighter">
                    {roomState.users.find(u => u.id === roomState.host)?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Chat */}
      <div className="w-80 hidden md:block">
        <Chat 
          user={user} 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          onSendReaction={handleSendReaction}
        />
      </div>
    </div>
  );
}
