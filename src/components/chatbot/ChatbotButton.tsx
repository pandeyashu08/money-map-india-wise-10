
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { MessageCircle } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useAuth } from '@/contexts/AuthContext';

const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { activeConversationId, conversations, isLoading, selectConversation, createNewConversation } = useChatbot();
  const { user } = useAuth();
  
  // Close chat if user logs out
  useEffect(() => {
    if (!user) {
      setIsOpen(false);
    }
  }, [user]);
  
  const handleNewConversation = async () => {
    await createNewConversation();
  };
  
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  // Don't show the chatbot if user is not logged in
  if (!user) {
    return null;
  }
  
  return (
    <>
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      <Drawer open={isOpen} onOpenChange={setIsOpen} shouldScaleBackground>
        <DrawerContent className="h-[85vh] max-h-[85vh]">
          <div className="flex h-full">
            <ChatSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={selectConversation}
              onNewConversation={handleNewConversation}
              isLoading={isLoading}
            />
            <div className="flex-1">
              <ChatWindow onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ChatbotButton;
