
import React from 'react';
import DashboardOverview from '@/components/DashboardOverview';
import ChatbotButton from '@/components/chatbot/ChatbotButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Terminal } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
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
          
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-amber-500" />
                Development Environment Setup
              </CardTitle>
              <CardDescription>
                Important information for setting up your local development environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The "vite not found" error indicates that dependencies need to be properly installed. Run the following commands in your terminal:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">
                <div>npm install</div>
                <div>npm install -g vite</div>
                <div>npm run dev</div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                If you're using pnpm (as indicated by pnpm-lock.yaml), use these commands instead:
              </p>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">
                <div>pnpm install</div>
                <div>pnpm add -g vite</div>
                <div>pnpm dev</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <DashboardOverview />
        </div>
      </div>
      <ChatbotButton />
    </div>
  );
}
