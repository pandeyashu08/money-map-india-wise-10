import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useFinancialData } from './FinancialDataContext';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  id?: string;
  content: string;
  role: 'system' | 'user' | 'assistant';
  created_at?: string;
  tokens?: number;
  conversation_id?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatbotContextType {
  activeConversationId: string | null;
  conversations: ChatConversation[];
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  createNewConversation: () => Promise<string>;
  selectConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider = ({ children }: ChatbotProviderProps) => {
  const { user, session } = useAuth();
  const { profile, transactions, summary } = useFinancialData();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

  // Fetch user's conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('chat_conversations')
          .select('*')
          .order('updated_at', { ascending: false });
          
        if (error) throw error;
        
        setConversations(data || []);
        
        // If we have conversations but no active one, select the most recent
        if (data && data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0].id);
        }
        
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast({
          title: "Error loading conversations",
          description: error instanceof Error ? error.message : "Failed to load conversations",
          variant: "destructive"
        });
      }
      
      setInitialLoadComplete(true);
    };
    
    fetchConversations();
  }, [user]);

  // Fetch messages when the active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', activeConversationId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Fix type casting here to ensure all messages conform to ChatMessage interface
        if (data) {
          const typedMessages: ChatMessage[] = data.map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role as 'system' | 'user' | 'assistant',
            created_at: msg.created_at,
            tokens: msg.tokens,
            conversation_id: msg.conversation_id
          }));
          
          setMessages(typedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error loading messages",
          description: error instanceof Error ? error.message : "Failed to load messages",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activeConversationId) {
      fetchMessages();
    }
  }, [activeConversationId]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;
    
    const messagesChannel = supabase
      .channel('chat-messages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'conversation_id' in payload.new 
              && payload.new.conversation_id === activeConversationId) {
            if (payload.eventType === 'INSERT') {
              setMessages(prev => [...prev, payload.new as ChatMessage]);
              
              // If this is an assistant message, stop the typing indicator
              if ('role' in payload.new && payload.new.role === 'assistant') {
                setIsTyping(false);
              }
            }
          }
        }
      )
      .subscribe();
      
    const conversationsChannel = supabase
      .channel('chat-conversations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_conversations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConversations(prev => [payload.new as ChatConversation, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setConversations(prev => prev.map(conv => 
              conv.id === payload.new.id ? {...conv, ...payload.new as ChatConversation} : conv
            ));
          } else if (payload.eventType === 'DELETE') {
            setConversations(prev => prev.filter(conv => conv.id !== payload.old.id));
            
            // If the active conversation was deleted, select a new one
            if (activeConversationId === payload.old.id) {
              const nextConversation = conversations.find(conv => conv.id !== payload.old.id);
              setActiveConversationId(nextConversation?.id || null);
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, activeConversationId, conversations]);

  // Create a new conversation
  const createNewConversation = async (): Promise<string> => {
    if (!user) throw new Error("Must be signed in to create conversations");
    
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert([{ 
          user_id: user.id,
          title: 'New Conversation'
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      setActiveConversationId(data.id);
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error creating conversation",
        description: error instanceof Error ? error.message : "Failed to create conversation",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Select a conversation
  const selectConversation = async (id: string): Promise<void> => {
    setActiveConversationId(id);
  };

  // Delete a conversation
  const deleteConversation = async (id: string): Promise<void> => {
    try {
      console.log("Attempting to delete conversation:", id);
      
      // First delete all messages associated with the conversation
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', id);
        
      if (messagesError) {
        console.error("Error deleting messages:", messagesError);
        throw new Error(`Error deleting messages: ${messagesError.message}`);
      }
      
      // Then delete the conversation
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting conversation:", error);
        throw new Error(`Error deleting conversation: ${error.message}`);
      }
      
      // If we deleted the active conversation, select a new one
      if (id === activeConversationId) {
        const nextConversation = conversations.find(conv => conv.id !== id);
        if (nextConversation) {
          setActiveConversationId(nextConversation.id);
        } else {
          setActiveConversationId(null);
        }
      }
      
      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== id));
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error deleting conversation",
        description: error instanceof Error ? error.message : "Failed to delete conversation",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Prepare financial context for sending to the AI
  const prepareFinancialContext = () => {
    if (!profile) return null;
    
    return {
      monthlyIncome: profile.monthly_income,
      monthlyExpenses: profile.monthly_expenses,
      savingsGoal: profile.savings_goal,
      totalBalance: summary.totalBalance,
      savingsRate: summary.savingsRate,
      recentTransactions: transactions.slice(0, 10).map(t => ({
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date
      })),
      expenseCategories: Object.entries(summary.expenseByCategory).map(([category, amount]) => ({ 
        category, 
        amount 
      }))
    };
  };

  // Send a message
  const sendMessage = async (content: string): Promise<void> => {
    if (!user) throw new Error("Must be signed in to send messages");
    if (!content.trim()) return;
    
    let conversationId = activeConversationId;
    
    // If no active conversation, create a new one
    if (!conversationId) {
      try {
        conversationId = await createNewConversation();
      } catch (error) {
        return;
      }
    }
    
    // Optimistically add user message to state
    const userMessage: ChatMessage = {
      content,
      role: 'user',
      created_at: new Date().toISOString()
    };
    
    // Add user message to database
    try {
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: conversationId,
          content,
          role: 'user'
        }]);
        
      if (messageError) throw messageError;
      
      // Update conversation timestamp
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
        
      if (updateError) throw updateError;
      
      // Start typing indicator
      setIsTyping(true);
      
      // Get the conversation history
      const { data: historyData, error: historyError } = await supabase
        .from('chat_messages')
        .select('content, role')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (historyError) throw historyError;
      
      // Extract the last few messages (limit context)
      const recentMessages = historyData.length > 10 ? historyData.slice(-10) : historyData;
      
      // Get financial context
      const financialContext = prepareFinancialContext();
      
      // Add a system message for context
      const systemMessage: ChatMessage = {
        content: "You are Money Map's AI Financial Assistant. You specialize in Indian personal finance. Be conversational, friendly, and provide relevant insights without being overly formal. Use the user's financial data to provide personalized advice when relevant.",
        role: 'system'
      };
      
      // Send messages to the AI
      const response = await fetch('https://egjwpfgsykcyuyqzooeh.functions.supabase.co/chat-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          messages: [systemMessage, ...recentMessages],
          conversationContext: financialContext
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }
      
      const { response: aiResponse, tokens } = await response.json();
      
      // Add AI response to database
      const { error: aiMessageError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: conversationId,
          content: aiResponse,
          role: 'assistant',
          tokens
        }]);
      
      if (aiMessageError) throw aiMessageError;
      
      // If this is a new conversation with generic title, update the title based on first message
      if (content && conversations.find(c => c.id === conversationId)?.title === 'New Conversation') {
        let newTitle = content.length > 30 ? `${content.substring(0, 30)}...` : content;
        
        // Update conversation title
        const { error: titleError } = await supabase
          .from('chat_conversations')
          .update({ title: newTitle })
          .eq('id', conversationId);
          
        if (titleError) throw titleError;
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const value = {
    activeConversationId,
    conversations,
    messages,
    isLoading,
    isTyping,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation
  };

  // Only render children when initial load is complete to avoid flickering
  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};
