
import React from 'react';
import { Transaction } from '@/contexts/FinancialDataContext';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
  limit?: number;
  showViewAll?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
  formatCurrency,
  limit = 5,
  showViewAll = true
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(limit).fill(0).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No transactions found</p>
        <Button asChild>
          <Link to="/expenses">
            Add your first transaction
          </Link>
        </Button>
      </div>
    );
  }

  const limitedTransactions = transactions.slice(0, limit);

  return (
    <div className="space-y-4">
      {limitedTransactions.map((transaction) => (
        <div key={transaction.id} className="flex justify-between items-center py-2">
          <div className="flex items-start">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
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
                {format(new Date(transaction.date), 'dd/MM/yy')}
                <span className="mx-1">•</span>
                {transaction.category}
              </div>
            </div>
          </div>
          <p className={`font-medium ${
            transaction.type === 'income' ? 'text-green-500' : 'text-foreground'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </p>
        </div>
      ))}
      
      {showViewAll && transactions.length > limit && (
        <div className="text-center pt-2">
          <Button asChild variant="outline" className="w-full">
            <Link to="/expenses">View All Transactions</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
