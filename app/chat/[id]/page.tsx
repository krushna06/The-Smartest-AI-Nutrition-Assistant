"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Paperclip, Mic, Send, Bot, User, ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initialMessage = searchParams.get('message');
    if (initialMessage) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: decodeURIComponent(initialMessage),
        role: 'user',
        timestamp: new Date(),
      };
      setMessages([userMessage]);
      handleSendMessage(userMessage.content);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageContent: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5:0.5b',
          prompt: messageContent,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Ollama');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response || 'I apologize, but I am unable to provide a response at this time.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    handleSendMessage(input);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121]">
      <div className="bg-[#1e1e1e] p-4 border-b border-gray-800">
        <div className="container mx-auto flex items-center">
          <Link 
            href="/" 
            className="mr-4 p-2 rounded-full hover:bg-[#2d2d2d] transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft size={20} className="text-gray-300" />
          </Link>
          <div className="flex items-center">
            <MessageSquare size={24} className="text-gray-300 mr-2" />
            <h1 className="text-xl font-medium text-white">The Smartest AI Nutrition Assistant</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="container mx-auto max-w-5xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4">
              <div className="bg-[#2d2d2d] p-6 rounded-2xl max-w-2xl w-full">
                <div className="bg-[#3a3a3a] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot size={32} className="text-gray-300" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h2>
                <p className="text-gray-400">Ask me anything about nutrition, meal plans, or healthy living.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-3xl w-full ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    <div
                      className={`flex ${message.role === 'user' ? 'bg-[#2d2d2d]' : 'bg-[#2a2a2a]'} rounded-2xl p-4 w-full max-w-3xl`}
                    >
                      {message.role === 'assistant' && (
                        <div className="mr-3 flex-shrink-0">
                          <div className="bg-[#3a3a3a] w-8 h-8 rounded-full flex items-center justify-center">
                            <Bot size={16} className="text-gray-300" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-400 mb-1">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </div>
                        <div className="text-gray-200 whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="ml-3 flex-shrink-0">
                          <div className="bg-[#3a3a3a] w-8 h-8 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-300" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#2a2a2a] rounded-2xl p-4 max-w-3xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-800 bg-[#1e1e1e] p-4">
        <div className="container mx-auto max-w-5xl">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI Nutrition Assistant..."
              className="w-full bg-[#2d2d2d] text-white placeholder-gray-500 rounded-xl px-5 py-3.5 pr-14 text-base focus:outline-none focus:ring-2 focus:ring-[#424242] border border-[#3a3a3a]"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-300 p-2 transition-colors"
                aria-label="Attach file"
                disabled={isLoading}
              >
                <Paperclip size={20} />
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-300 p-2 transition-colors"
                aria-label="Voice input"
                disabled={isLoading}
              >
                <Mic size={20} />
              </button>
              <button
                type="submit"
                className="text-gray-300 hover:text-white p-2 transition-colors"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-500 text-center mt-2">
            Our AI may produce inaccurate information. Consider verifying important information.
          </p>
        </div>
      </div>
    </div>
  );
}
