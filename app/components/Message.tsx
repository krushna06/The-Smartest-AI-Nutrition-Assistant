import { Bot, User } from "lucide-react";

type MessageProps = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export function Message({ id, content, role, timestamp }: MessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-3xl w-full ${role === 'user' ? 'justify-end' : ''}`}>
        <div
          className={`flex ${role === 'user' ? 'bg-[#2d2d2d]' : 'bg-[#2a2a2a]'} rounded-2xl p-4 w-full max-w-3xl`}
        >
          {role === 'assistant' && (
            <div className="mr-3 flex-shrink-0">
              <div className="bg-[#3a3a3a] w-8 h-8 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-gray-300" />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-400 mb-1">
              {role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <div className="text-gray-200 whitespace-pre-wrap break-words">
              {content}
            </div>
          </div>
          {role === 'user' && (
            <div className="ml-3 flex-shrink-0">
              <div className="bg-[#3a3a3a] w-8 h-8 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-300" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
