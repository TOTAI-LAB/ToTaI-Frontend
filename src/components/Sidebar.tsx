import React from 'react';
import { PlusCircle, MessageSquare, LogOut, Twitter, Send, TrendingUp } from 'lucide-react';
import { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ chats, activeChat, onNewChat, onSelectChat, onLogout }: SidebarProps) {
  return (
    <div className="w-72 bg-slate-900 h-screen flex flex-col border-r border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={24} className="text-blue-500" />
          <span className="text-xl font-bold text-white">Terminal of Trade</span>
        </div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg p-3 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
        >
          <PlusCircle size={20} />
          New Analysis
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full text-left p-3 flex items-center gap-2 hover:bg-slate-800 transition-colors ${
              activeChat === chat.id ? 'bg-slate-800 border-l-2 border-blue-500' : ''
            }`}
          >
            <MessageSquare size={20} className="text-slate-400" />
            <span className="text-slate-200 truncate">{chat.title}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex gap-4 mb-4 justify-center">
          <a
            href="https://twitter.com/TerminalOfTrade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-500 transition-colors"
          >
            <Twitter size={24} />
          </a>
          <a
            href="https://t.me/TerminalOfTrade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-500 transition-colors"
          >
            <Send size={24} />
          </a>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 justify-center text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <LogOut size={20} />
          Disconnect
        </button>
      </div>
    </div>
  );
}