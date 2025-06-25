export interface MealPlan {
  id: string;
  meals: Array<{
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  mealPlan?: MealPlan;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  updatedAt: number;
  mealPlan?: MealPlan;
}

export const CHAT_STORAGE_KEY = 'ai-nutrition-chats';

export const getChats = (): Chat[] => {
  if (typeof window === 'undefined') return [];
  const chats = localStorage.getItem(CHAT_STORAGE_KEY);
  return chats ? JSON.parse(chats) : [];
};

export const getChat = (chatId: string): Chat | undefined => {
  const chats = getChats();
  return chats.find(chat => chat.id === chatId);
};

export const addMessageToChat = (chatId: string, message: Omit<Message, 'id' | 'timestamp'>): Chat | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  const chats = getChats();
  const chatIndex = chats.findIndex(chat => chat.id === chatId);
  
  if (chatIndex === -1) return undefined;
  
  const newMessage: Message = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  
  chats[chatIndex] = {
    ...chats[chatIndex],
    messages: [...chats[chatIndex].messages, newMessage],
    updatedAt: Date.now(),
  };
  
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
  return chats[chatIndex];
};

export const saveChat = (chat: Omit<Chat, 'timestamp' | 'updatedAt' | 'messages'>) => {
  if (typeof window === 'undefined') return [];
  
  const chats = getChats();
  const existingChatIndex = chats.findIndex(c => c.id === chat.id);
  
  const now = Date.now();
  const newChat = {
    ...chat,
    messages: existingChatIndex >= 0 ? chats[existingChatIndex].messages : [],
    timestamp: existingChatIndex >= 0 ? chats[existingChatIndex].timestamp : now,
    updatedAt: now,
  };

  if (existingChatIndex >= 0) {
    chats[existingChatIndex] = newChat;
  } else {
    chats.unshift(newChat);
  }

  // will store only the 10 most recent chats
  const recentChats = chats.slice(0, 10);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(recentChats));
  return recentChats;
};

export const deleteChat = (chatId: string) => {
  if (typeof window === 'undefined') return [];
  
  const chats = getChats().filter(chat => chat.id !== chatId);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
  return chats;
};

export const saveMealPlanToChat = (chatId: string, mealPlan: Omit<MealPlan, 'id'>): Chat | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  const chats = getChats();
  const chatIndex = chats.findIndex(chat => chat.id === chatId);
  
  if (chatIndex === -1) return undefined;
  
  const mealPlanWithId: MealPlan = {
    ...mealPlan,
    id: crypto.randomUUID(),
  };
  
  chats[chatIndex] = {
    ...chats[chatIndex],
    mealPlan: mealPlanWithId,
    updatedAt: Date.now(),
  };
  
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
  return chats[chatIndex];
};

export const getMealPlanFromChat = (chatId: string): MealPlan | undefined => {
  const chat = getChat(chatId);
  return chat?.mealPlan;
};
