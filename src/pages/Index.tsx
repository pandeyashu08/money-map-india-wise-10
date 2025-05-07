
import React from 'react';
import DashboardOverview from '@/components/DashboardOverview';
import ChatbotButton from '@/components/chatbot/ChatbotButton';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <DashboardOverview />
      </div>
      <ChatbotButton />
    </div>
  );
}
