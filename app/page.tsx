"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Paperclip, Mic, MicOff } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { saveChat } from "./utils/chatStorage";
import type { Meal } from "./components/MealPlanCard";

const Sidebar = dynamic(() => import("./components/Sidebar"), { ssr: false });
const MealPlanCard = dynamic(() => import("./components/MealPlanCard"), {
  ssr: false,
});
const FitnessStats = dynamic(() => import("./components/FitnessStats"), {
  ssr: false,
});

export default function Home() {
  const [selectedMealPlan, setSelectedMealPlan] = useState<Meal[] | null>(null);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const mediaStream = useRef<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
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

  const handleMealPlanSelect = (mealPlanString?: string) => {
    if (mealPlanString) {
      const parsedMealPlan = JSON.parse(mealPlanString) as Meal[];
      setSelectedMealPlan(parsedMealPlan);
    } else {
      setSelectedMealPlan(null);
    }
  };

  const initRecorder = useCallback(async () => {
    if (isInitialized) return true;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        },
        video: false
      });
      
      mediaStream.current = stream;
      
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/wav',
        'audio/mp4',
      ].find(type => MediaRecorder.isTypeSupported(type));
      
      console.log('Using MIME type:', mimeType || 'default');
      
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log('Audio data available, size:', event.data.size);
          audioChunks.current.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        setIsRecording(false);
        
        if (audioChunks.current.length === 0) {
          console.warn('No audio data recorded');
          return;
        }

        try {
          const audioBlob = new Blob(audioChunks.current, { 
            type: audioChunks.current[0]?.type || 'audio/wav'
          });
          
          console.log('Sending audio blob, size:', audioBlob.size, 'type:', audioBlob.type);
          await sendAudioToBackend(audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
        } finally {
          audioChunks.current = [];
        }
      };
      
      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
        alert('An error occurred during recording. Please try again.');
      };
      
      mediaRecorder.current = recorder;
      setIsInitialized(true);
      return true;
      
    } catch (err) {
      console.error('Error initializing audio recorder:', err);
      alert('Error accessing microphone. Please check permissions and try again.');
      return false;
    }
  }, [isInitialized]);

  useEffect(() => {
    return () => {
      if (mediaRecorder.current?.state === 'recording') {
        mediaRecorder.current.stop();
      }
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
        mediaStream.current = null;
      }
      setIsInitialized(false);
    };
  }, []);

  const toggleRecording = useCallback(async () => {
    try {
      if (isRecording) {
        console.log('Stopping recording...');
        if (mediaRecorder.current?.state === 'recording') {
          mediaRecorder.current.stop();
        }
      } else {
        console.log('Starting recording...');
        audioChunks.current = [];
        
        if (!isInitialized) {
          const success = await initRecorder();
          if (!success) return;
        }
        
        if (mediaRecorder.current) {
          try {
            mediaRecorder.current.start(100);
            setIsRecording(true);
          } catch (error) {
            console.error('Error starting recording:', error);
            alert('Failed to start recording. Please try again.');
            setIsInitialized(false);
            mediaRecorder.current = null;
            if (mediaStream.current) {
              mediaStream.current.getTracks().forEach(track => track.stop());
              mediaStream.current = null;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in toggleRecording:', error);
      setIsRecording(false);
    }
  }, [isRecording, isInitialized, initRecorder]);

  const sendAudioToBackend = async (audioBlob: Blob) => {
    try {
      console.log('Sending audio to backend, size:', audioBlob.size, 'type:', audioBlob.type);
      
      const formData = new FormData();
      
      const mimeType = 'audio/webm;codecs=opus';
      const fileName = 'recording.webm';
      
      const cleanBlob = new Blob([audioBlob], { type: mimeType });
      formData.append('audio_file', cleanBlob, fileName);
      
      console.log('Sending request to backend...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      let response;
      let responseData;
      
      try {
        response = await fetch('http://localhost:8000/api/speech-to-text', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        try {
          responseData = await response.json();
          console.log('Received response from backend:', responseData);
        } catch (jsonError) {
          const errorText = await response.text();
          console.error('Failed to parse JSON response:', errorText);
          throw new Error('Received an invalid response from the server');
        }
        
        if (!response.ok) {
          const errorMessage = responseData?.error || response.statusText || 'Unknown server error';
          console.error('Backend error response:', errorMessage);
          throw new Error(`Server error: ${errorMessage}`);
        }
        
        if (responseData?.success && responseData.text) {
          const transcribedText = responseData.text.trim();
          if (transcribedText) {
            console.log('Transcription successful:', transcribedText);
            setInput(prev => (prev ? `${prev} ${transcribedText}` : transcribedText).trim());
            return;
          }
        }
        
        const errorMessage = responseData?.error || 'No speech was detected or recognized';
        console.error('Transcription failed:', errorMessage);
        throw new Error(errorMessage);
        
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw error;
      }
      
    } catch (error) {
      console.error('Error in sendAudioToBackend:', error);
      let errorMessage = 'An error occurred while processing your voice input.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.message.includes('time')) {
          errorMessage = 'The request took too long. Please try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message.split(':').pop()?.trim() || errorMessage;
        }
      }
      
      alert(`Error: ${errorMessage}`);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;
    
    const chatId = crypto.randomUUID();
    let chatTitle = '';
    
    if (selectedFile) {
      chatTitle = `Image: ${selectedFile.name}`;
    } else if (input) {
      chatTitle = input.length > 30 ? `${input.substring(0, 30)}...` : input;
    } else {
      chatTitle = 'New Chat';
    }
    
    const formattedMealPlan = selectedMealPlan ? {
      id: `mealplan-${Date.now()}`,
      meals: selectedMealPlan.map(meal => ({
        name: meal.name,
        description: meal.items.join(', '),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }))
    } : undefined;
    
    saveChat({
      id: chatId,
      title: chatTitle,
      mealPlan: formattedMealPlan,
    });
    
    const params = new URLSearchParams({
      message: input || `[Image: ${selectedFile?.name || ''}]`,
      ...(selectedMealPlan && { 
        mealPlan: JSON.stringify(selectedMealPlan) 
      })
    });
    
    router.push(`/chat/${chatId}?${params.toString()}`);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };
  
  const [isConnected, setIsConnected] = useState(false);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/fitness/check');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.isConnected);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleDisconnect = async () => {
    try {
      await fetch('/api/fitness/disconnect', { method: 'POST' });
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto relative">
        <MealPlanCard onSelect={handleMealPlanSelect} />
        {isConnected && (
          <FitnessStats 
            isCollapsed={false} 
            onDisconnect={handleDisconnect}
          />
        )}
        <div className="w-full max-w-2xl">
          <h1 className="text-white text-2xl font-medium text-center mb-8">
            What can I help you with?
          </h1>

          <div className="bg-[#303030] rounded-2xl p-6 shadow-lg">
            <AnimatePresence>
              {selectedMealPlan && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: "1rem" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="text-sm text-white/80 bg-white/5 rounded-lg px-4 py-2 inline-flex items-center">
                    <span>Selected Meal Plan</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={handleSubmit} className="relative">
              {selectedFile && (
                <div className="mb-3">
                  <div className="group inline-flex items-center">
                    <div className="inline-flex items-center bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg px-3 py-1.5 text-sm max-w-full hover:border-[#4a4a4a] transition-colors relative">
                      <span className="text-gray-300 truncate">📎 {selectedFile.name}</span>
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
                  placeholder={selectedFile ? "Add a message (optional)" : "Ask Anything"}
                  className="w-full bg-[#404040] text-white placeholder-gray-400 rounded-xl px-4 py-4 pr-20 text-lg focus:outline-none"
                />

                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button 
                      type="button" 
                      className="text-gray-400 hover:text-gray-300 p-1 transition-colors"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      aria-label="Attach file"
                    >
                      <Paperclip size={20} />
                    </button>
                  </div>

                  <button 
                    type="button" 
                    className={`p-1 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-300'}`}
                    onClick={toggleRecording}
                    aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
