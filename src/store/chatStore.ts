import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatStoreState {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatStoreActions {
  // Chat management
  createChat: (title: string) => void;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  selectChat: (chatId: string) => void;
  
  // Message management
  addMessage: (chatId: string, message: Message) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  
  // State management
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearChats: () => void;
  
  // Getters
  getCurrentChat: () => Chat | undefined;
  getChatById: (chatId: string) => Chat | undefined;
}

export type ChatStore = ChatStoreState & ChatStoreActions;

const initialState: ChatStoreState = {
  chats: [],
  currentChatId: null,
  isLoading: false,
  error: null,
};

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Chat management
        createChat: (title: string) => {
          const chatId = `chat_${Date.now()}`;
          const newChat: Chat = {
            id: chatId,
            title,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          set((state) => ({
            chats: [newChat, ...state.chats],
            currentChatId: chatId,
          }));
        },

        deleteChat: (chatId: string) => {
          set((state) => ({
            chats: state.chats.filter((chat) => chat.id !== chatId),
            currentChatId:
              state.currentChatId === chatId ? null : state.currentChatId,
          }));
        },

        updateChatTitle: (chatId: string, title: string) => {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? { ...chat, title, updatedAt: Date.now() }
                : chat
            ),
          }));
        },

        selectChat: (chatId: string) => {
          set({ currentChatId: chatId });
        },

        // Message management
        addMessage: (chatId: string, message: Message) => {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: [...chat.messages, message],
                    updatedAt: Date.now(),
                  }
                : chat
            ),
          }));
        },

        deleteMessage: (chatId: string, messageId: string) => {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: chat.messages.filter((msg) => msg.id !== messageId),
                    updatedAt: Date.now(),
                  }
                : chat
            ),
          }));
        },

        updateMessage: (chatId: string, messageId: string, content: string) => {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: chat.messages.map((msg) =>
                      msg.id === messageId ? { ...msg, content } : msg
                    ),
                    updatedAt: Date.now(),
                  }
                : chat
            ),
          }));
        },

        // State management
        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        clearChats: () => {
          set(initialState);
        },

        // Getters
        getCurrentChat: () => {
          const { chats, currentChatId } = get();
          return chats.find((chat) => chat.id === currentChatId);
        },

        getChatById: (chatId: string) => {
          const { chats } = get();
          return chats.find((chat) => chat.id === chatId);
        },
      }),
      {
        name: 'chat-store',
      }
    )
  )
);
