
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { FinancialChart } from './FinancialChart';
import { expenseCategories } from '@/utils/financialUtils';
import { useFinancialData } from '@/contexts/FinancialDataContext';
import { 
  Calendar, Plus, ArrowUpRight, Trash2, Edit, Filter, Download, MoreHorizontal
} from "lucide-react";
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';

interface TransactionFormData {
  description: string;
  amount: string;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

interface FilterOptions {
  dateRange: 'all' | 'thisMonth' | 'lastMonth' | 'thisYear';
  category: string | null;
  type: 'all' | 'income' | 'expense';
  search: string;
}

const ExpenseTracker: React.FC = () => {
  const { 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    formatCurrency,
    summary,
    isLoading
  } = useFinancialData();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: 'all',
    category: null,
    type: 'all',
    search: ''
  });
  
  const [formData, setFormData] = useState<TransactionFormData>({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });
  
  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category: ''
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddTransaction = async () => {
    const amount = parseFloat(formData.amount);
    if (!formData.description || !amount || amount <= 0 || !formData.category) {
      // Show validation errors
      return;
    }
    
    await addTransaction({
      description: formData.description,
      amount: amount,
      type: formData.type,
      date: new Date(formData.date).toISOString(),
      category: formData.category
    });
    
    resetForm();
    setIsAddDialogOpen(false);
  };
  
  const handleEditTransaction = async () => {
    if (!selectedTransaction) return;
    
    const amount = parseFloat(formData.amount);
    if (!formData.description || !amount || amount <= 0 || !formData.category) {
      // Show validation errors
      return;
    }
    
    await updateTransaction(selectedTransaction, {
      description: formData.description,
      amount: amount,
      type: formData.type,
      date: new Date(formData.date).toISOString(),
      category: formData.category
    });
    
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    
    await deleteTransaction(selectedTransaction);
    setIsDeleteDialogOpen(false);
  };
  
  const handleBulkDelete = async () => {
    for (const id of selectedTransactions) {
      await deleteTransaction(id);
    }
    setSelectedTransactions([]);
  };

  const openEditDialog = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    setSelectedTransaction(id);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      date: transaction.date.split('T')[0],
      category: transaction.category
    });
    
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (id: string) => {
    setSelectedTransaction(id);
    setIsDeleteDialogOpen(true);
  };
  
  const toggleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  // Apply filters
  const filteredTransactions = transactions.filter(transaction => {
    // Date range filter
    if (filterOptions.dateRange !== 'all') {
      const txnDate = new Date(transaction.date);
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      if (filterOptions.dateRange === 'thisMonth') {
        if (txnDate.getMonth() !== thisMonth || txnDate.getFullYear() !== thisYear) {
          return false;
        }
      } else if (filterOptions.dateRange === 'lastMonth') {
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        if (txnDate.getMonth() !== lastMonth || txnDate.getFullYear() !== lastMonthYear) {
          return false;
        }
      } else if (filterOptions.dateRange === 'thisYear') {
        if (txnDate.getFullYear() !== thisYear) {
          return false;
        }
      }
    }
    
    // Category filter
    if (filterOptions.category && transaction.category !== filterOptions.category) {
      return false;
    }
    
    // Type filter
    if (filterOptions.type !== 'all' && transaction.type !== filterOptions.type) {
      return false;
    }
    
    // Search filter
    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(searchLower) || 
        transaction.category.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Prepare chart data
  const expenseByCategoryData = Object.entries(summary.expenseByCategory).map(([name, value]) => {
    const categoryColor = expenseCategories.find(c => c.name === name)?.color || '#6C757D';
    return { name, value, color: categoryColor };
  });

  // Prepare CSV data
  const csvData = [
    ['Type', 'Description', 'Category', 'Amount', 'Date'], // Header row
    ...filteredTransactions.map(t => [
      t.type,
      t.description,
      t.category,
      t.amount,
      format(new Date(t.date), 'dd/MM/yyyy')
    ])
  ];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transaction Manager</h2>
          <p className="text-muted-foreground">Track and manage your income and expenses</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          
          <CSVLink 
            data={csvData} 
            filename={"transactions.csv"}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <Download className="h-4 w-4 mr-1" /> Export
          </CSVLink>
          
          <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> New Transaction
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Transaction History</CardTitle>
              <div className="space-x-2">
                <Tabs defaultValue="all" onValueChange={(v) => 
                  setFilterOptions(prev => ({ ...prev, dateRange: v as any }))
                }>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="thisMonth">This Month</TabsTrigger>
                    <TabsTrigger value="lastMonth">Last Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Loading your transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No transactions found</p>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                  Add your first transaction
                </Button>
              </div>
            ) : (
              <>
                {selectedTransactions.length > 0 && (
                  <div className="bg-muted p-2 rounded-md mb-4 flex justify-between items-center">
                    <span>{selectedTransactions.length} item(s) selected</span>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                )}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={
                              filteredTransactions.length > 0 && 
                              selectedTransactions.length === filteredTransactions.length
                            } 
                            onCheckedChange={toggleSelectAll} 
                          />
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox 
                              checked={selectedTransactions.includes(transaction.id)} 
                              onCheckedChange={() => toggleSelectTransaction(transaction.id)} 
                            />
                          </TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(transaction.date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={transaction.type === 'income' ? 'text-green-500' : ''}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => openEditDialog(transaction.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500"
                                onClick={() => openDeleteDialog(transaction.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              </div>
            ) : expenseByCategoryData.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No expense data yet</p>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                  Add First Expense
                </Button>
              </div>
            ) : (
              <FinancialChart
                type="pie"
                data={expenseByCategoryData}
                index="name"
                valueFormatter={(value) => `₹${value.toLocaleString()}`}
                className="h-[300px]"
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Transaction Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Enter the details of your transaction below
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What was this for?"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="any"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="₹ Amount"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="date" className="text-sm font-medium">Date</label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => handleSelectChange('category', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type === 'income' ? (
                      <SelectItem value="Income">Income</SelectItem>
                    ) : (
                      expenseCategories.map(cat => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTransaction}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-amount" className="text-sm font-medium">Amount</label>
                <Input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="any"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="edit-date" className="text-sm font-medium">Date</label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-type" className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => handleSelectChange('category', v)}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type === 'income' ? (
                      <SelectItem value="Income">Income</SelectItem>
                    ) : (
                      expenseCategories.map(cat => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditTransaction}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Transaction Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTransaction}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseTracker;
