import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

type ChatHeaderProps = {
  onBack?: () => void;
};

export function ChatHeader({ onBack }: ChatHeaderProps) {
  return (
    <div className="bg-[#1e1e1e] p-4 border-t border-[#424242]">
      <div className="container mx-auto flex items-center">
        <Link 
          href="/" 
          className="mr-4 p-2 rounded-full hover:bg-[#2d2d2d] transition-colors"
          aria-label="Back to home"
          onClick={onBack}
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </Link>
        <div className="flex items-center">
          <MessageSquare size={24} className="text-gray-300 mr-2" />
          <h1 className="text-xl font-medium text-white">The Smartest AI Nutrition Assistant</h1>
        </div>
      </div>
    </div>
  );
}
