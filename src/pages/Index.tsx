
import React from 'react';
import DashboardOverview from '@/components/DashboardOverview';
import ChatbotButton from '@/components/chatbot/ChatbotButton';

export default function Index() {
  return (
    <div className="min-h-screen">
      <DashboardOverview />
      <ChatbotButton />
    </div>
  );
}
