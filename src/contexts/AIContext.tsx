
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFinancialData } from './FinancialDataContext';
import { initializeAI, trainAnomalyDetector, generateBudgetInsights } from '@/utils/aiUtils';

interface AIContextType {
  isAILoading: boolean;
  isAIEnabled: boolean;
  insights: string[];
  toggleAI: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { transactions } = useFinancialData();
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  
  // Initialize AI models when the context is mounted
  useEffect(() => {
    const loadAI = async () => {
      if (!isAIEnabled) return;
      
      try {
        await initializeAI(setIsAILoading);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        setIsAIEnabled(false);
      }
    };
    
    loadAI();
  }, [isAIEnabled]);
  
  // Train models and generate insights when transactions change
  useEffect(() => {
    const processTransactions = async () => {
      if (!isAIEnabled || transactions.length === 0) return;
      
      try {
        // Train anomaly detection model
        await trainAnomalyDetector(transactions);
        
        // Get current month's transactions
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const currentMonthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        });
        
        // Get previous month's transactions
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const previousMonthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getMonth() === previousMonth && txDate.getFullYear() === previousMonthYear;
        });
        
        // Generate insights
        const newInsights = generateBudgetInsights(currentMonthTransactions, previousMonthTransactions);
        setInsights(newInsights);
        
      } catch (error) {
        console.error('Error processing transactions for AI:', error);
      }
    };
    
    processTransactions();
  }, [transactions, isAIEnabled]);
  
  const toggleAI = () => {
    setIsAIEnabled(prev => !prev);
  };
  
  return (
    <AIContext.Provider value={{
      isAILoading,
      isAIEnabled,
      insights,
      toggleAI
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
