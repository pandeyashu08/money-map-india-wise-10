
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, categorizeTransaction, expenseCategories } from '@/utils/financialUtils';
import { useToast } from "@/hooks/use-toast";
import { Calendar, Wallet, Plus, ArrowUpRight, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

const TransactionManager: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().slice(0, 10),
    category: ''
  });
  
  useEffect(() => {
    if (!user) return;
    
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setTransactions(data as Transaction[]);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: 'Failed to load transactions',
          description: 'Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [user, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTypeChange = (value: string) => {
    setNewTransaction(prev => ({
      ...prev,
      type: value as 'income' | 'expense',
      category: value === 'income' ? 'Income' : prev.category
    }));
  };
  
  const handleCategoryChange = (value: string) => {
    setNewTransaction(prev => ({ ...prev, category: value }));
  };
  
  const handleAddTransaction = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add transactions",
        variant: "destructive"
      });
      return;
    }
    
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Get category if not provided
      const category = newTransaction.category || 
        (newTransaction.type === 'income' ? 'Income' : categorizeTransaction(newTransaction.description));
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          description: newTransaction.description,
          amount: amount,
          type: newTransaction.type,
          category: category,
          date: new Date(newTransaction.date).toISOString()
        })
        .select();
      
      if (error) throw error;
      
      // Add new transaction to the list
      if (data && data.length > 0) {
        setTransactions(prev => [data[0] as Transaction, ...prev]);
      }
      
      // Reset form
      setNewTransaction({
        description: '',
        amount: '',
        type: 'expense',
        date: new Date().toISOString().slice(0, 10),
        category: ''
      });
      
      toast({
        title: "Transaction added",
        description: "Your transaction has been recorded successfully"
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Failed to add transaction",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Transaction Manager</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                name="description"
                value={newTransaction.description}
                onChange={handleInputChange}
                placeholder="What was this for?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Input
                name="amount"
                type="number"
                value={newTransaction.amount}
                onChange={handleInputChange}
                placeholder="₹ Amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select value={newTransaction.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                name="date"
                type="date"
                value={newTransaction.date}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          {newTransaction.type === 'expense' && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={newTransaction.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button 
            className="mt-4 w-full md:w-auto" 
            onClick={handleAddTransaction}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" /> Add Transaction
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Loading your transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No transactions found. Add your first transaction above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 border border-border rounded-md hover:bg-muted/20">
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      transaction.type === 'income' ? 'bg-finance-green/10 text-finance-green' : 'bg-finance-blue/10 text-finance-blue'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <Wallet className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(transaction.date).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                        <span className="mx-1">•</span>
                        {transaction.category}
                      </div>
                    </div>
                  </div>
                  <p className={`font-medium ${
                    transaction.type === 'income' ? 'text-finance-green' : 'text-foreground'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionManager;
