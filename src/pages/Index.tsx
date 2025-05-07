
import React from 'react';
import DashboardOverview from '@/components/DashboardOverview';
import ChatbotButton from '@/components/chatbot/ChatbotButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Financial AI Assistant Available
              </CardTitle>
              <CardDescription>
                Get personalized advice on your finances with our AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click on the chat button in the bottom right corner to ask questions about your expenses, 
                get budget insights, learn about tax planning, or receive investment advice tailored to your financial situation.
              </p>
            </CardContent>
          </Card>
        </div>
        <DashboardOverview />
      </div>
      <ChatbotButton />
    </div>
  );
}
