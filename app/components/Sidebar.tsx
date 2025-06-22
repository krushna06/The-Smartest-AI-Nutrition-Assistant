'use client';

import { useState } from 'react';
import { MessageSquare, Search, Menu } from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`h-screen bg-[#181818] text-gray-200 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-xl font-semibold">Chats</h2>}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-gray-400"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="p-2">
        <button className="w-full flex items-center space-x-3 text-gray-300 py-2 px-3">
          <MessageSquare size={20} className="text-gray-300" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      <div className="px-2 pb-2">
        <button className="w-full flex items-center space-x-3 text-gray-400 py-2 px-3">
          <Search size={20} />
          {!isCollapsed && <span>Search Chats</span>}
        </button>
      </div>

      <div className="mx-4"></div>

      <div className="flex-1 overflow-y-auto p-4">
        {!isCollapsed && (
          <div className="text-gray-400 text-xs font-medium mb-2 px-3">RECENT</div>
        )}
        <div className="space-y-1">
        </div>
      </div>
    </div>
  );
}
