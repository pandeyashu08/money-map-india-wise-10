
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatConversation } from '@/contexts/ChatbotContext';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isLoading: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  isLoading
}) => {
  return (
    <div className="h-full flex flex-col border-r w-64">
      <div className="p-4 border-b">
        <Button 
          className="w-full justify-start gap-2" 
          onClick={onNewConversation}
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1">Recent Conversations</div>
          
          {isLoading ? (
            <div className="space-y-2 mt-2 px-2">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-1 mt-1">
              {conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant={activeConversationId === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left truncate h-9"
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate">{conversation.title}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>Conversations are saved</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
