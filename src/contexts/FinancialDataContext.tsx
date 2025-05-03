
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  user_id: string;
}

export interface FinancialProfile {
  id: string;
  monthly_income: number;
  monthly_expenses: number;
  savings_goal: number;
  first_name?: string;
  last_name?: string;
}

interface FinancialSummary {
  totalBalance: number;
  savingsRate: number;
  expenseByCategory: Record<string, number>;
  monthlyData: Array<{
    name: string;
    income: number;
    expenses: number;
  }>;
}

interface FinancialContextType {
  transactions: Transaction[];
  profile: FinancialProfile | null;
  summary: FinancialSummary;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id' | 'user_id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatCompactCurrency: (amount: number) => string;
}

const FinancialDataContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalBalance: 0,
    savingsRate: 0,
    expenseByCategory: {},
    monthlyData: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number): string => {
    if (amount >= 10000000) { // 1 crore
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) { // 1 lakh
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) { // 1 thousand
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  // Calculate financial summary from raw data
  const calculateSummary = (txns: Transaction[], prof: FinancialProfile | null): FinancialSummary => {
    // Default values
    const summary: FinancialSummary = {
      totalBalance: 0,
      savingsRate: 0,
      expenseByCategory: {},
      monthlyData: []
    };
    
    if (!txns.length && !prof) return summary;

    // Calculate expense by category
    const expenseByCategory: Record<string, number> = {};
    txns.forEach(transaction => {
      if (transaction.type === 'expense') {
        const category = transaction.category || 'Other';
        expenseByCategory[category] = (expenseByCategory[category] || 0) + transaction.amount;
      }
    });

    // Calculate monthly data (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = monthNames[monthIndex];
      
      const income = txns
        .filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === monthIndex && t.type === 'income';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = txns
        .filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === monthIndex && t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: monthName,
        income,
        expenses
      };
    }).reverse();

    // Calculate total income and expenses
    const totalIncome = txns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = txns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total balance and savings rate
    const totalBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      totalBalance,
      savingsRate,
      expenseByCategory,
      monthlyData
    };
  };

  const fetchTransactions = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      return data as Transaction[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  };

  const fetchProfile = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      return data as FinancialProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  const refresh = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [transactionsData, profileData] = await Promise.all([
        fetchTransactions(),
        fetchProfile()
      ]);
      
      setTransactions(transactionsData);
      setProfile(profileData);
      setSummary(calculateSummary(transactionsData, profileData));
    } catch (error) {
      setError(error as Error);
      toast({
        title: "Error refreshing data",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add transactions",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Optimistic update
      const optimisticTxn: Transaction = {
        ...transaction,
        id: `temp-${Date.now()}`,
        user_id: user.id
      };
      
      setTransactions(prev => [optimisticTxn, ...prev]);
      setSummary(calculateSummary([...transactions, optimisticTxn], profile));
      
      // Actual API call
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update with actual data
      setTransactions(prev => 
        prev.map(t => t.id === optimisticTxn.id ? (data as Transaction) : t)
      );
      
      toast({
        title: "Transaction added",
        description: "Your transaction has been recorded successfully"
      });
    } catch (error) {
      // Revert optimistic update
      setTransactions(prev => prev.filter(t => !t.id.startsWith('temp-')));
      setSummary(calculateSummary(transactions, profile));
      
      console.error('Error adding transaction:', error);
      toast({
        title: "Failed to add transaction",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Omit<Transaction, 'id' | 'user_id'>>) => {
    if (!user) return;
    
    try {
      // Find existing transaction
      const existingTxn = transactions.find(t => t.id === id);
      if (!existingTxn) throw new Error("Transaction not found");
      
      // Optimistic update
      const updatedTxn = { ...existingTxn, ...transaction };
      setTransactions(prev => prev.map(t => t.id === id ? updatedTxn : t));
      setSummary(calculateSummary(
        transactions.map(t => t.id === id ? updatedTxn : t),
        profile
      ));
      
      // Actual API call
      const { error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated successfully"
      });
    } catch (error) {
      // Revert optimistic update
      await refresh();
      
      console.error('Error updating transaction:', error);
      toast({
        title: "Failed to update transaction",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    
    try {
      // Optimistic delete
      const deletedTxn = transactions.find(t => t.id === id);
      if (!deletedTxn) throw new Error("Transaction not found");
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      setSummary(calculateSummary(
        transactions.filter(t => t.id !== id),
        profile
      ));
      
      // Actual API call
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Transaction deleted",
        description: "Your transaction has been deleted successfully"
      });
    } catch (error) {
      // Revert optimistic delete
      await refresh();
      
      console.error('Error deleting transaction:', error);
      toast({
        title: "Failed to delete transaction",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('financial-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        () => {
          refresh();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        () => {
          refresh();
        }
      )
      .subscribe();
      
    // Initial data fetch
    refresh();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Recalculate summary when transactions or profile changes
  useEffect(() => {
    setSummary(calculateSummary(transactions, profile));
  }, [transactions, profile]);

  return (
    <FinancialDataContext.Provider
      value={{
        transactions,
        profile,
        summary,
        isLoading,
        error,
        refresh,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        formatCurrency,
        formatCompactCurrency
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
};

export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
};
