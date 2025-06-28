"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageSquare, Search, Menu, Command, Trash2, Clock } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import SpotlightSearch from "./SpotlightSearch";
import { getChats, deleteChat, Chat } from "../utils/chatStorage";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import dynamic from "next/dynamic";
import type { UserProfileProps, SettingsProps } from ".";

const UserProfileLoader = dynamic<UserProfileProps>(
  () => import('.').then((mod) => mod.UserProfile),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        </div>
      </div>
    )
  }
);

const SettingsLoader = dynamic<SettingsProps>(
  () => import('.').then((mod) => mod.Settings),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        </div>
      </div>
    )
  }
);

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    setChats(getChats());
    
    const handleStorageChange = () => {
      setChats(getChats());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };
  
  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    const updatedChats = deleteChat(chatId);
    setChats(updatedChats);
  };

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  const handleSearch = (query: string): string[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return chats
      .filter(chat => 
        chat.title.toLowerCase().includes(searchTerm) ||
        chat.messages.some(msg => 
          msg.content.toLowerCase().includes(searchTerm)
        )
      )
      .map(chat => JSON.stringify({ id: chat.id, title: chat.title }))
      .slice(0, 5);
  };

  const handleSearchSelect = (result: string) => {
    try {
      const chat = JSON.parse(result);
      if (chat && chat.id) {
        router.push(`/chat/${chat.id}`);
        setIsSearchOpen(false);
      }
    } catch (e) {
      console.error("Error parsing search result:", e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSearch]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`h-screen bg-[#181818] text-gray-200 flex flex-col ${isCollapsed ? "w-16" : "w-64"} transition-[width] duration-200 ease-out`}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-xl font-semibold">Chats</h2>}
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-gray-400"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="p-2">
        <button className="w-full flex items-center text-gray-300 py-2 px-3 overflow-hidden">
          <MessageSquare size={20} className="text-gray-300 flex-shrink-0" />
          <span className={`ml-3 text-sm transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            New Chat
          </span>
        </button>
      </div>

      <div className="px-2 pb-2">
        <button
          onClick={toggleSearch}
          className="w-full flex items-center text-[#a1a1aa] rounded-lg py-2 px-3 overflow-hidden"
        >
          <Search size={20} className="text-[#a1a1aa] flex-shrink-0" />
          <span className={`ml-3 text-sm transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Search Chats
          </span>
          <div
            className={`ml-auto flex items-center space-x-1 text-xs bg-[#2d2d2d] text-[#a1a1aa] px-2 py-0.5 rounded border border-[#3d3d3d] transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0 h-0 overflow-hidden" : "opacity-100"}`}
          >
            <Command size={12} />
            <span>K</span>
          </div>
        </button>
      </div>


      <SpotlightSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
        onSelect={handleSearchSelect}
      />

      <div className="mx-4"></div>

      <div className="flex-1 overflow-y-auto p-4">
        {!isCollapsed && chats.length > 0 && (
          <div className="mb-4">
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className="group flex items-center justify-between p-2 rounded-lg cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {chat.title}
                    </p>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDistanceToNow(chat.timestamp, { addSuffix: true })}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 p-1"
                    aria-label="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <UserProfileLoader isCollapsed={isCollapsed} />
      <SettingsLoader isCollapsed={isCollapsed} />
    </div>
  );
}
