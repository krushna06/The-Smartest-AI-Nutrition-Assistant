"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getChat, addMessageToChat, saveChat } from "@/app/utils/chatStorage";
import { ChatHeader } from "@/app/components/ChatHeader";
import { MainChatBox } from "@/app/components/MainChatBox";
import { MessageInput } from "@/app/components/MessageInput";
import { MealPlan } from "@/app/components/MealPlan";

export type UIMessage = {
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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



  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121]">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="container mx-auto max-w-5xl space-y-4">
          {mealPlan && <MealPlan meals={mealPlan.meals} />}
          <MainChatBox messages={messages} isLoading={isLoading} />
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        onFileChange={handleFileChange}
        onRemoveFile={removeImage}
        selectedFile={selectedFile}
        previewUrl={previewUrl}
        isLoading={isLoading}
      />
    </div>
  );
}
