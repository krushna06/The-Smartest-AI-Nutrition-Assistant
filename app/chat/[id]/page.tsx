"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Paperclip, Mic, Send, Bot, User, ArrowLeft, MessageSquare, Utensils, Clock, Flame, Egg, Carrot } from "lucide-react";
import Link from "next/link";
import { getChat, addMessageToChat, saveChat } from "@/app/utils/chatStorage";

type UIMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = params.id;

  useEffect(() => {
    const loadChat = () => {
      const chat = getChat(chatId);
      if (chat) {
        const loadedMessages = chat.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
        
        if (chat.mealPlan) {
          setMealPlan(chat.mealPlan);
        }
      }
    };

    loadChat();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initialMessage = searchParams.get('message');
    if (initialMessage && messages.length === 0) {
      const chat = getChat(chatId);
      
      if (!chat || chat.messages.length === 0) {
        const tempId = `temp-${Date.now()}`;
        const userMessage: UIMessage = {
          id: tempId,
          content: decodeURIComponent(initialMessage),
          role: 'user',
          timestamp: new Date(),
        };
        
        setMessages([userMessage]);
        
        const updatedChat = addMessageToChat(chatId, {
          role: 'user',
          content: decodeURIComponent(initialMessage),
        });
        
        if (!chat) {
          saveChat({
            id: chatId,
            title: initialMessage.length > 30 
              ? `${initialMessage.substring(0, 30)}...` 
              : initialMessage,
          });
        }
        
        if (updatedChat) {
          const savedMessage = updatedChat.messages[updatedChat.messages.length - 1];
          
          setMessages(prev => {
            const newMessages = [...prev];
            const messageIndex = newMessages.findIndex(msg => msg.id === tempId);
            if (messageIndex !== -1) {
              newMessages[messageIndex] = {
                ...savedMessage,
                timestamp: new Date(savedMessage.timestamp)
              };
            }
            return newMessages;
          });
          
          handleSendMessage(userMessage.content, true);
        }
      }
    }
  }, [searchParams, chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageContent: string, skipAddToChat = false) => {
    setIsLoading(true);
    
    try {
      if (!skipAddToChat) {
        const userMessage = {
          role: 'user' as const,
          content: messageContent,
        };
        addMessageToChat(chatId, userMessage);
      }
      
      const currentChat = getChat(chatId);
      const mealPlanContext = currentChat?.mealPlan 
        ? `\n\nHere is the user's meal plan for context:\n${JSON.stringify(currentChat.mealPlan, null, 2)}`
        : '';
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5:0.5b',
          prompt: `${messageContent}${mealPlanContext}`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Ollama');
      }

      const data = await response.json();
      const responseContent = data.response || 'I apologize, but I am unable to provide a response at this time.';
      
      await addMessageToChat(chatId, {
        role: 'assistant',
        content: responseContent,
      });
      
      const updatedChat = getChat(chatId);
      if (updatedChat) {
        setMessages(updatedChat.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: UIMessage = {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    let content = input;
    if (selectedFile) {
      content = `[Image: ${selectedFile.name}] ${input}`.trim();
    }

    const userMessage: UIMessage = {
      id: `user-${Date.now()}`,
      content: content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    removeImage();

    const chat = addMessageToChat(chatId, {
      role: 'user',
      content: content,
    });

    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: UIMessage = {
        id: `ai-${Date.now()}`,
        content: selectedFile 
          ? 'I see you\'ve shared an image. In a real implementation, I would analyze its contents.' 
          : 'This is a simulated response from the AI.',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      addMessageToChat(chatId, {
        role: 'assistant',
        content: aiMessage.content,
      });
      setIsLoading(false);
    }, 1000);
  };

  const renderMealPlan = () => {
    if (!mealPlan) return null;
    
    return (
      <div className="mb-6 p-6 bg-[#2a2a2a] rounded-xl shadow-lg border border-[#3a3a3a]">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-green-400" />
          Your Meal Plan
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {mealPlan.meals.map((meal: any, index: number) => (
            <div key={index} className="bg-[#333] p-4 rounded-lg hover:bg-[#3a3a3a] transition-colors">
              <h4 className="font-medium text-teal-400 mb-2">
                {meal.name}
              </h4>
              <p className="text-sm text-gray-300 mb-3">{meal.description}</p>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                <div className="flex items-center">
                  <Flame className="w-3 h-3 mr-2 text-red-400" />
                  <span className="text-white">{meal.calories} cal</span>
                </div>
                <div className="flex items-center">
                  <Egg className="w-3 h-3 mr-2 text-blue-400" />
                  <span className="text-white">{meal.protein}g protein</span>
                </div>
                <div className="flex items-center">
                  <Carrot className="w-3 h-3 mr-2 text-yellow-400" />
                  <span className="text-white">{meal.carbs}g carbs</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-2 rounded-full bg-yellow-400"></div>
                  <span className="text-white">{meal.fat}g fat</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121]">
      <div className="bg-[#1e1e1e] p-4 border-t border-[#424242]">
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
              {renderMealPlan()}
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

      <div className="border-t border-[#424242] bg-[#1e1e1e] p-4">
        <div className="container mx-auto max-w-5xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              {selectedFile && (
                <div className="relative">
                  <div className="inline-flex items-center">
                    <div className="group mb-2 inline-flex items-center bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg px-3 py-1.5 text-sm max-w-full hover:border-[#4a4a4a] transition-colors relative">
                      <span className="text-gray-300 truncate"> {selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="ml-2 text-gray-400 hover:text-white flex-shrink-0"
                        aria-label="Remove file"
                      >
                        ×
                      </button>
                      {previewUrl && (
                        <div className="absolute bottom-full left-0 mb-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                          <div className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-1 shadow-xl transform transition-all duration-200 ease-out scale-95 group-hover:scale-100">
                            <div className="relative">
                              <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-40 h-40 object-cover rounded-md"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedFile ? "Add a message (optional)" : "Message AI Nutrition Assistant..."}
                  className="w-full bg-[#2d2d2d] text-white placeholder-gray-500 rounded-xl px-5 py-3.5 pr-14 text-base focus:outline-none focus:ring-2 focus:ring-[#424242] border border-[#3a3a3a]"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-300 p-2 transition-colors"
                      aria-label="Attach file"
                      disabled={isLoading}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Paperclip size={20} />
                    </button>
                  </div>
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
                    className={`text-gray-300 hover:text-white p-2 transition-colors ${(!input.trim() && !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading || (!input.trim() && !selectedFile)}
                    aria-label="Send message"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
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
