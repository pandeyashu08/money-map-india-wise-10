
import React from 'react';
import DashboardOverview from '@/components/DashboardOverview';
import ChatbotButton from '@/components/chatbot/ChatbotButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Development Environment Error</AlertTitle>
            <AlertDescription>
              <p className="text-sm mb-2">
                The error <code>sh: 1: vite: not found</code> indicates Vite is not installed in your environment.
              </p>
              <p className="text-sm">
                This is a command-line issue, not a code problem. Follow the instructions below to resolve it.
              </p>
            </AlertDescription>
          </Alert>
          
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-amber-500" />
                Required Environment Setup
              </CardTitle>
              <CardDescription className="font-semibold">
                Complete these steps before proceeding:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Option 1: Using pnpm (recommended for this project)</p>
                <div className="rounded-md bg-muted p-4 font-mono text-sm">
                  <div>pnpm install</div>
                  <div>pnpm run dev</div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Option 2: Using npm</p>
                <div className="rounded-md bg-muted p-4 font-mono text-sm">
                  <div>npm install</div>
                  <div>npm run dev</div>
                </div>
              </div>
              
              <div className="pt-2 space-y-3">
                <p className="text-sm font-medium">Additional Troubleshooting Tips:</p>
                <Alert className="bg-green-500/10 border-green-500/20 text-green-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Most Common Solution</AlertTitle>
                  <AlertDescription>
                    <p className="text-sm">Running the install command will automatically set up Vite correctly.</p>
                  </AlertDescription>
                </Alert>
                
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>You might need to run these commands with administrator privileges (use sudo on Linux/Mac)</li>
                  <li>Make sure you run these commands from the project root directory (where package.json is located)</li>
                  <li>If you're using VS Code, try running the terminal as administrator</li>
                  <li>After installation, you may need to close and reopen your terminal</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
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
        
        <div className="mt-8">
          <DashboardOverview />
        </div>
      </div>
      <ChatbotButton />
    </div>
  );
}
