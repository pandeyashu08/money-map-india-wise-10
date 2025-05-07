
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatbot, ChatMessage as ChatMessageType } from '@/contexts/ChatbotContext';
import { Bot } from 'lucide-react';

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const { 
    activeConversationId,
    messages,
    conversations,
    isLoading,
    isTyping,
    sendMessage,
    createNewConversation,
    deleteConversation,
    selectConversation
  } = useChatbot();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to the bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);
  
  // Get the current conversation title
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const conversationTitle = activeConversation?.title || 'New Conversation';
  
  const handleNewChat = async () => {
    await createNewConversation();
  };
  
  const handleDeleteChat = async () => {
    if (activeConversationId) {
      await deleteConversation(activeConversationId);
      
      // If there are no more conversations, create a new one
      if (conversations.length <= 1) {
        await createNewConversation();
      }
    }
  };
  
  const handleResetChat = async () => {
    if (activeConversationId) {
      // Create a new conversation and select it
      await createNewConversation();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        title={conversationTitle}
        onClose={onClose}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onResetChat={handleResetChat}
      />
      
      <ScrollArea className="flex-1 p-2">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                <div className={`flex flex-col ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
                  <Skeleton className="h-20 w-64 rounded-lg" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
                {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Finance AI Assistant</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Ask questions about your finances, get budget advice, or learn about taxes in India.
              Your conversation history is saved for future reference.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg">
              {[
                "How much did I spend on food this month?",
                "What's my current savings rate?",
                "Help me budget better",
                "Explain tax-saving investments in India"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  className="text-xs px-3 py-2 border rounded-lg hover:bg-accent transition-colors text-left"
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex gap-3 p-4">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <ChatInput 
        onSubmit={sendMessage}
        isTyping={isTyping}
        disabled={isLoading || !activeConversationId} 
      />
    </div>
  );
};

export default ChatWindow;
