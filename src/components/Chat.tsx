import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";
import { User } from "firebase/auth";

interface Message {
  id: string;
  user: { name: string; photo: string };
  text: string;
  timestamp: number;
}

interface ChatProps {
  user: User;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
}

const EMOJIS = ["❤️", "😂", "🔥", "😮", "😢", "👏"];

export default function Chat({ user, messages, onSendMessage, onSendReaction }: ChatProps) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border-l border-zinc-800 backdrop-blur-md">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-red-600" />
        <h2 className="font-black text-lg tracking-tighter uppercase italic">LIVE CHAT</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3 group">
            <img 
              src={msg.user.photo || `https://picsum.photos/seed/${msg.user.name}/200`} 
              alt={msg.user.name || "User"} 
              className="w-8 h-8 rounded-full border border-zinc-700"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-300">{msg.user.name}</span>
                <span className="text-[10px] text-zinc-600 font-medium">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed bg-zinc-800/50 p-2 rounded-lg rounded-tl-none">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 space-y-4">
        <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(emoji)}
              className="flex-1 py-2 text-xl hover:bg-zinc-800 rounded-xl transition-all active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 focus:border-red-600 focus:outline-none transition-all font-medium text-sm"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
