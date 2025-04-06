
// Financial utility functions for Money Map

// Format currency in Indian Rupee format
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Calculate monthly expense from a list of transactions
export const calculateMonthlyExpense = (transactions: any[]): number => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  return transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        transaction.type === 'expense'
      );
    })
    .reduce((total, transaction) => total + transaction.amount, 0);
};

// Calculate monthly income from a list of transactions
export const calculateMonthlyIncome = (transactions: any[]): number => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  return transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        transaction.type === 'income'
      );
    })
    .reduce((total, transaction) => total + transaction.amount, 0);
};

// Calculate savings rate
export const calculateSavingsRate = (income: number, expenses: number): number => {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
};

// Calculate tax under old regime (FY 2025-26)
export const calculateOldRegimeTax = (income: number): number => {
  let taxableIncome = Math.max(0, income - 50000); // Standard deduction
  let tax = 0;
  
  if (taxableIncome <= 250000) {
    tax = 0;
  } else if (taxableIncome <= 500000) {
    tax = (taxableIncome - 250000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = 12500 + (taxableIncome - 500000) * 0.2;
  } else {
    tax = 112500 + (taxableIncome - 1000000) * 0.3;
  }
  
  // Add 4% cess
  tax = tax * 1.04;
  
  return Math.round(tax);
};

// Calculate tax under new regime (FY 2025-26)
export const calculateNewRegimeTax = (income: number): number => {
  let taxableIncome = Math.max(0, income - 50000); // Standard deduction
  let tax = 0;
  
  if (taxableIncome <= 300000) {
    tax = 0;
  } else if (taxableIncome <= 600000) {
    tax = (taxableIncome - 300000) * 0.05;
  } else if (taxableIncome <= 900000) {
    tax = 15000 + (taxableIncome - 600000) * 0.1;
  } else if (taxableIncome <= 1200000) {
    tax = 45000 + (taxableIncome - 900000) * 0.15;
  } else if (taxableIncome <= 1500000) {
    tax = 90000 + (taxableIncome - 1200000) * 0.2;
  } else {
    tax = 150000 + (taxableIncome - 1500000) * 0.3;
  }
  
  // Add 4% cess
  tax = tax * 1.04;
  
  return Math.round(tax);
};

// Calculate SIP returns
export const calculateSIPReturns = (
  monthlyInvestment: number,
  years: number,
  rateOfReturn: number
): number => {
  const monthlyRate = rateOfReturn / 12 / 100;
  const months = years * 12;
  
  const futureValue =
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);
  
  return Math.round(futureValue);
};

// Categorize transaction based on description
export const categorizeTransaction = (description: string): string => {
  description = description.toLowerCase();
  
  if (description.includes('salary') || description.includes('income')) {
    return 'Income';
  } else if (
    description.includes('food') ||
    description.includes('restaurant') ||
    description.includes('swiggy') ||
    description.includes('zomato')
  ) {
    return 'Food';
  } else if (
    description.includes('uber') ||
    description.includes('ola') ||
    description.includes('metro') ||
    description.includes('travel') ||
    description.includes('petrol') ||
    description.includes('fuel')
  ) {
    return 'Transportation';
  } else if (
    description.includes('rent') ||
    description.includes('maintenance')
  ) {
    return 'Housing';
  } else if (
    description.includes('amazon') ||
    description.includes('flipkart') ||
    description.includes('shopping')
  ) {
    return 'Shopping';
  } else if (
    description.includes('movie') ||
    description.includes('entertainment')
  ) {
    return 'Entertainment';
  } else if (
    description.includes('bill') ||
    description.includes('utility') ||
    description.includes('electricity') ||
    description.includes('water') ||
    description.includes('gas') ||
    description.includes('phone') ||
    description.includes('internet')
  ) {
    return 'Utilities';
  } else if (
    description.includes('medicine') ||
    description.includes('doctor') ||
    description.includes('hospital') ||
    description.includes('health')
  ) {
    return 'Healthcare';
  } else if (
    description.includes('invest') ||
    description.includes('mutual fund') ||
    description.includes('stock') ||
    description.includes('fd') ||
    description.includes('fixed deposit')
  ) {
    return 'Investments';
  }
  
  return 'Others';
};

// Sample data for testing
export const sampleTransactions = [
  {
    id: 1,
    date: new Date().toISOString(),
    description: 'Salary',
    amount: 100000,
    type: 'income',
    category: 'Income'
  },
  {
    id: 2,
    date: new Date().toISOString(),
    description: 'Rent',
    amount: 25000,
    type: 'expense',
    category: 'Housing'
  },
  {
    id: 3,
    date: new Date().toISOString(),
    description: 'Groceries',
    amount: 6000,
    type: 'expense',
    category: 'Food'
  },
  {
    id: 4,
    date: new Date().toISOString(),
    description: 'Electricity Bill',
    amount: 3000,
    type: 'expense',
    category: 'Utilities'
  },
  {
    id: 5,
    date: new Date().toISOString(),
    description: 'Mobile Bill',
    amount: 1000,
    type: 'expense',
    category: 'Utilities'
  },
  {
    id: 6,
    date: new Date().toISOString(),
    description: 'Mutual Fund SIP',
    amount: 10000,
    type: 'expense',
    category: 'Investments'
  },
  {
    id: 7,
    date: new Date().toISOString(),
    description: 'Movie',
    amount: 1500,
    type: 'expense',
    category: 'Entertainment'
  }
];

// Sample categories with colors for charts
export const expenseCategories = [
  { name: 'Housing', color: '#0466C8' },
  { name: 'Food', color: '#38B000' },
  { name: 'Transportation', color: '#FF9500' },
  { name: 'Utilities', color: '#9D4EDD' },
  { name: 'Entertainment', color: '#F72585' },
  { name: 'Healthcare', color: '#4CC9F0' },
  { name: 'Shopping', color: '#F94144' },
  { name: 'Investments', color: '#277DA1' },
  { name: 'Others', color: '#6C757D' }
];
