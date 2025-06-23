'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Command, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => string[];
}

export default function SpotlightSearch({ isOpen, onClose, onSearch }: SpotlightSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = onSearch(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown' && searchResults.length > 0 && isOpen) {
        e.preventDefault();
        const firstResult = document.querySelector('[data-result="0"]') as HTMLElement;
        firstResult?.focus();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const input = searchInputRef.current.querySelector('input');
      input?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed inset-0 bg-black/60 flex items-start justify-center pt-20 z-50"
        onClick={onClose}
      >
        <motion.div 
          ref={searchInputRef}
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ 
            type: 'spring',
            damping: 30,
            stiffness: 400,
            mass: 0.8
          }}
          className="w-full max-w-2xl bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-[#333333] max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <motion.div 
              className="flex items-center px-4 py-4 border-b border-[#333333] bg-[#1a1a1a]"
              layout
            >
              <Search className="text-[#8f8f8f] mr-3 flex-shrink-0" size={20} />
              <motion.input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats, messages, or type a command..."
                className="w-full bg-transparent text-[#e0e0e0] placeholder-[#8f8f8f] outline-none text-base"
                autoComplete="off"
                spellCheck="false"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              />
              <motion.button 
                onClick={() => setSearchQuery('')}
                className={`ml-2 text-[#8f8f8f] hover:text-[#e0e0e0] transition-colors ${!searchQuery ? 'invisible' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} />
              </motion.button>
            </motion.div>
            
            {searchQuery && (
              <motion.div 
                className="overflow-y-auto flex-1"
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: 'auto',
                  opacity: 1,
                  transition: { 
                    height: { duration: 0.3, ease: 'easeInOut' },
                    opacity: { duration: 0.2, delay: 0.1 }
                  }
                }}
                exit={{ 
                  height: 0, 
                  opacity: 0,
                  transition: { 
                    opacity: { duration: 0.1 },
                    height: { duration: 0.2 }
                  }
                }}
              >
                <LayoutGroup>
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-[#2a2a2a]">
                      {searchResults.map((result, index) => (
                        <motion.div 
                          key={index}
                          data-result={index}
                          className="px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer flex items-center"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            transition: { 
                              delay: index * 0.03,
                              type: 'spring',
                              stiffness: 300,
                              damping: 24
                            }
                          }}
                          whileHover={{ 
                            x: 4,
                            transition: { type: 'spring', stiffness: 400, damping: 20 }
                          }}
                          whileTap={{ scale: 0.98 }}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              console.log('Selected:', result);
                            } else if (e.key === 'ArrowDown' && index < searchResults.length - 1) {
                              e.preventDefault();
                              const nextResult = document.querySelector(`[data-result="${index + 1}"]`) as HTMLElement;
                              nextResult?.focus();
                            } else if (e.key === 'ArrowUp' && index > 0) {
                              e.preventDefault();
                              const prevResult = document.querySelector(`[data-result="${index - 1}"]`) as HTMLElement;
                              prevResult?.focus();
                            } else if (e.key === 'ArrowUp' && index === 0) {
                              e.preventDefault();
                              const input = searchInputRef.current?.querySelector('input') as HTMLElement;
                              input?.focus();
                            }
                          }}
                        >
                          <MessageSquare size={16} className="text-[#8f8f8f] mr-3 flex-shrink-0" />
                          <span className="truncate text-[#e0e0e0]">{result}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="p-6 text-center text-[#8f8f8f]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      No results found for "{searchQuery}"
                    </motion.div>
                  )}
                </LayoutGroup>
              </motion.div>
            )}
            
            <motion.div 
              className="px-4 py-2 text-xs text-[#8f8f8f] border-t border-[#333333] bg-[#1a1a1a]"
              layout
            >
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <motion.span 
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center"
                  >
                    Press <kbd className="mx-1 px-1.5 py-0.5 bg-[#2a2a2a] rounded text-[#e0e0e0]">↑↓</kbd> to navigate
                  </motion.span>
                  <motion.span 
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center"
                  >
                    Press <kbd className="mx-1 px-1.5 py-0.5 bg-[#2a2a2a] rounded text-[#e0e0e0]">⏎</kbd> to select
                  </motion.span>
                </div>
                <motion.span 
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center"
                >
                  Press <kbd className="ml-1 px-1.5 py-0.5 bg-[#2a2a2a] rounded text-[#e0e0e0]">Esc</kbd> to close
                </motion.span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
