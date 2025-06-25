import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Paperclip, Mic, Send } from "lucide-react";

type MessageInputProps = {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  selectedFile: File | null;
  previewUrl: string | null;
  isLoading: boolean;
};

export function MessageInput({
  input,
  setInput,
  onSubmit,
  onFileChange,
  onRemoveFile,
  selectedFile,
  previewUrl,
  isLoading,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-t border-[#424242] bg-[#1e1e1e] p-4">
      <div className="container mx-auto max-w-5xl">
        <form onSubmit={onSubmit} className="relative">
          <div className="relative">
            {selectedFile && (
              <div className="relative">
                <div className="inline-flex items-center">
                  <div className="group mb-2 inline-flex items-center bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg px-3 py-1.5 text-sm max-w-full hover:border-[#4a4a4a] transition-colors relative">
                    <span className="text-gray-300 truncate"> {selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={onRemoveFile}
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
                    ref={fileInputRef}
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={onFileChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-300 p-2 transition-colors"
                    aria-label="Attach file"
                    disabled={isLoading}
                    onClick={handleFileButtonClick}
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
  );
}
