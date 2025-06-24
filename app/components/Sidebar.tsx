"use client";

import { useState, useCallback, useEffect } from "react";
import { MessageSquare, Search, Menu, Command } from "lucide-react";
import SpotlightSearch from "./SpotlightSearch";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  const handleSearch = (query: string): string[] => {
    if (query) {
      return [
        `Chat about ${query}`,
        `Notes on ${query}`,
        `Meeting: ${query} discussion`,
      ];
    }
    return [];
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

          <span
            className={`ml-3 transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}
          >
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

          <span
            className={`ml-3 transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}
          >
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
      />

      <div className="mx-4"></div>

      <div className="flex-1 overflow-y-auto p-4">
        {!isCollapsed && (
          <div className="text-gray-400 text-xs font-medium mb-2 px-3">
            RECENT
          </div>
        )}
        <div className="space-y-1"></div>
      </div>
    </div>
  );
}
