'use client';

import { Paperclip, Mic } from "lucide-react";
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('./components/Sidebar'), { ssr: false });

export default function Home() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="w-full max-w-2xl">
          <h1 className="text-white text-2xl font-medium text-center mb-8">What can I help you with?</h1>

          <div className="bg-[#303030] rounded-2xl p-6 shadow-lg">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask Anything"
                className="w-full bg-[#404040] text-white placeholder-gray-400 rounded-xl px-4 py-4 pr-20 text-lg focus:outline-none"
              />

              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                <button 
                  className="text-gray-400 p-1"
                  aria-label="Attach file"
                >
                  <Paperclip size={20} />
                </button>

                <button 
                  className="text-gray-400 p-1"
                  aria-label="Voice input"
                >
                  <Mic size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
