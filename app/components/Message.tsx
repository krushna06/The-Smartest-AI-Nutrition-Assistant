import { Bot, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageProps = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

const MarkdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mt-4 mb-2" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold mt-3 mb-2" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-3 leading-relaxed" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
  li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }: any) => <em className="italic" {...props} />,
  blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400" {...props} />,
  code: ({ node, inline, ...props }: any) => 
    inline 
      ? <code className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono" {...props} /> 
      : <pre className="bg-gray-700 p-3 rounded-md overflow-x-auto my-3"><code className="text-sm font-mono" {...props} /></pre>,
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
            <div className="text-gray-200 prose prose-invert max-w-none">
              {role === 'assistant' ? (
                <ReactMarkdown
                  components={MarkdownComponents}
                  remarkPlugins={[remarkGfm]}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="whitespace-pre-wrap break-words">{content}</div>
              )}
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
