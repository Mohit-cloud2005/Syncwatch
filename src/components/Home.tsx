import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { Plus, LogOut, Users, PlayCircle, ArrowRight } from "lucide-react";
import { auth } from "../firebase";

export default function Home({ user }: { user: User }) {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${newRoomId}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter text-red-600 italic uppercase leading-none">
              WATCH<br />TOGETHER
            </h1>
            <p className="text-xl text-zinc-400 font-medium">
              Real-time YouTube synchronization for friends, family, and communities.
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <img 
              src={user.photoURL || "https://picsum.photos/seed/user/200"} 
              alt={user.displayName || "User"} 
              className="w-12 h-12 rounded-full border-2 border-red-600"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <p className="font-bold text-lg">{user.displayName}</p>
              <button 
                onClick={() => auth.signOut()}
                className="text-sm text-zinc-500 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3 h-3" /> Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm">
          <div className="space-y-4">
            <button
              onClick={createRoom}
              className="w-full group flex items-center justify-between bg-red-600 hover:bg-red-700 text-white font-black py-6 px-8 rounded-2xl transition-all active:scale-95 text-xl"
            >
              <div className="flex items-center gap-4">
                <Plus className="w-8 h-8" />
                <span>CREATE ROOM</span>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-4 text-zinc-600 font-bold text-sm tracking-widest uppercase">OR JOIN EXISTING</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <form onSubmit={joinRoom} className="space-y-4">
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-5 pl-12 pr-4 focus:border-red-600 focus:outline-none transition-all font-bold text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={!roomId.trim()}
                className="w-full bg-white text-black font-black py-5 px-8 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-6 h-6" />
                JOIN SESSION
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl w-full text-center">
        <div className="space-y-2">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <Users className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-bold text-lg">Synced Playback</h3>
          <p className="text-sm text-zinc-500">Everyone watches the same frame at the same time.</p>
        </div>
        <div className="space-y-2">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <PlayCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-bold text-lg">Live Chat</h3>
          <p className="text-sm text-zinc-500">Talk to your friends while watching your favorite videos.</p>
        </div>
        <div className="space-y-2">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <Plus className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-bold text-lg">Shared Queue</h3>
          <p className="text-sm text-zinc-500">Anyone can add videos to the playlist for the group.</p>
        </div>
      </div>
    </div>
  );
}
