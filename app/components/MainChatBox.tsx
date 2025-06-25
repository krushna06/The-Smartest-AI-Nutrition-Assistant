import { useEffect, useRef } from "react";
import { UIMessage } from "../chat/[id]/page";
import { Message } from "./Message";
import { Bot } from "lucide-react";

type MainChatBoxProps = {
  messages: UIMessage[];
  isLoading: boolean;
};

export function MainChatBox({ messages, isLoading }: MainChatBoxProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4">
        <div className="bg-[#2d2d2d] p-6 rounded-2xl max-w-2xl w-full">
          <div className="bg-[#3a3a3a] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot size={32} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h2>
          <p className="text-gray-400">Ask me anything about nutrition, meal plans, or healthy living.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          id={message.id}
          content={message.content}
          role={message.role}
          timestamp={message.timestamp}
        />
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#2a2a2a] rounded-2xl p-4 max-w-3xl">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
