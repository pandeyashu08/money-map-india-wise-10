
// AI utilities using client-side models
import { pipeline, env } from '@huggingface/transformers';
// Since @tensorflow/tfjs is not available, we'll modify our code to work without it
// import * as tf from '@tensorflow/tfjs';
import { expenseCategories } from './financialUtils';

// Configure the transformers.js library
// Set to use CDN instead of downloading models to improve initial load time
env.allowLocalModels = false;
// Note: useCDN may not be supported in the current type definitions, but it works in runtime
// @ts-ignore - env.useCDN exists in the runtime but might not be in the type definitions
env.useCDN = true;

// Cache for loaded models to prevent reloading
let expenseCategorizer: any = null;
let anomalyDetector: any = null; // Changed from tf.Sequential to any

// Simple mapping between model outputs and our expense categories
const categoryMapping: Record<string, string> = {
  'food': 'Food & Dining',
  'grocery': 'Food & Dining',
  'restaurant': 'Food & Dining',
  'dining': 'Food & Dining',
  'housing': 'Housing',
  'rent': 'Housing',
  'mortgage': 'Housing',
  'utilities': 'Utilities',
  'electricity': 'Utilities',
  'water': 'Utilities',
  'internet': 'Utilities',
  'phone': 'Utilities',
  'transport': 'Transportation',
  'transportation': 'Transportation',
  'uber': 'Transportation',
  'taxi': 'Transportation',
  'car': 'Transportation',
  'flight': 'Transportation',
  'health': 'Healthcare',
  'medical': 'Healthcare',
  'doctor': 'Healthcare',
  'medicine': 'Healthcare',
  'entertainment': 'Entertainment',
  'movie': 'Entertainment',
  'subscription': 'Entertainment',
  'education': 'Education',
  'course': 'Education',
  'book': 'Education',
  'tuition': 'Education',
  'shopping': 'Shopping',
  'clothes': 'Shopping',
  'electronics': 'Shopping',
  'personal': 'Personal Care',
  'fitness': 'Personal Care',
  'investment': 'Investments',
  'stock': 'Investments',
  'mutual': 'Investments',
  'debt': 'Debt Payments',
  'loan': 'Debt Payments',
  'credit': 'Debt Payments',
  'travel': 'Travel',
  'hotel': 'Travel',
  'vacation': 'Travel',
  'income': 'Income',
  'salary': 'Income',
  'bonus': 'Income',
};

// Ensure the mapped category exists in our app's category list
const mapToValidCategory = (predictedCategory: string): string => {
  // Convert to lowercase for matching
  const lowerPrediction = predictedCategory.toLowerCase();
  
  // Direct match to our category list
  const directMatch = expenseCategories.find(
    cat => cat.name.toLowerCase() === lowerPrediction
  );
  if (directMatch) return directMatch.name;
  
  // Try to map using our dictionary
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (lowerPrediction.includes(key)) {
      return value;
    }
  }
  
  // Default to "Miscellaneous" if no match
  return 'Miscellaneous';
};

/**
 * Initialize AI models
 */
export const initializeAI = async (
  showLoadingIndicator: (isLoading: boolean) => void
): Promise<void> => {
  try {
    showLoadingIndicator(true);
    
    // Load models in parallel - since we don't have TensorFlow, just load the categorizer
    await initExpenseCategorizer();
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error initializing AI models:', error);
    return Promise.reject(error);
  } finally {
    showLoadingIndicator(false);
  }
};

/**
 * Initialize the expense categorization model
 */
const initExpenseCategorizer = async (): Promise<void> => {
  if (!expenseCategorizer) {
    try {
      // We're using a small zero-shot classification model that can work with custom categories
      // This is more flexible than a pre-trained classifier with fixed categories
      expenseCategorizer = await pipeline(
        'zero-shot-classification',
        'Xenova/distilbert-base-uncased-mnli',
        // @ts-ignore - quantized option exists in runtime but might not be in type definitions
        { quantized: true } // Use quantized model for smaller size
      );
      console.log('Expense categorization model loaded successfully');
    } catch (error) {
      console.error('Error loading expense categorization model:', error);
      // Fallback to rule-based categorization if model fails to load
      expenseCategorizer = null;
    }
  }
};

/**
 * Predict expense category from description
 */
export const predictExpenseCategory = async (
  description: string
): Promise<string> => {
  // If model is not loaded or description is empty, return default
  if (!expenseCategorizer || !description.trim()) {
    return 'Miscellaneous';
  }
  
  try {
    // Extract candidate categories from our expense categories
    const candidateLabels = expenseCategories.map(cat => cat.name);
    
    // Use the model to classify the description
    const result = await expenseCategorizer(description, candidateLabels);
    
    // Return the highest scoring category
    return result.labels[0] || 'Miscellaneous';
  } catch (error) {
    console.error('Error predicting expense category:', error);
    // Fallback to rule-based categorization
    return fallbackCategorization(description);
  }
};

/**
 * Rule-based fallback categorization when model fails
 */
const fallbackCategorization = (description: string): string => {
  const text = description.toLowerCase();
  
  return mapToValidCategory(text);
};

/**
 * Initialize the anomaly detection model
 * Note: We're removing the TensorFlow-dependent logic since the library isn't available
 */
const initAnomalyDetector = async (): Promise<void> => {
  // Simply log that the anomaly detector is initialized (stub implementation)
  console.log('Anomaly detection model initialized');
};

/**
 * Train the anomaly detection model with user's transaction history
 * Note: This is now a stub implementation without TensorFlow
 */
export const trainAnomalyDetector = async (transactions: any[]): Promise<void> => {
  // Stub implementation
  if (transactions.length < 10) {
    return;
  }
  
  console.log('Would train anomaly detection model with', transactions.length, 'transactions');
};

/**
 * Detect anomalies in transactions
 * Note: This is now a stub implementation without TensorFlow
 */
export const detectAnomaly = (transaction: any): boolean => {
  // Simple heuristic implementation without TensorFlow
  // Return true if transaction amount is unusually large (over 10000)
  const amount = Number(transaction.amount);
  return !isNaN(amount) && amount > 10000;
};

/**
 * Generate budget insights based on transaction history
 */
export const generateBudgetInsights = (
  transactions: any[],
  previousMonthTransactions: any[]
): string[] => {
  if (!transactions.length) return [];
  
  const insights: string[] = [];
  
  try {
    // Calculate total expenses by category for current month
    const currentExpensesByCategory = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc: Record<string, number>, tx: any) => {
        acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
        return acc;
      }, {});
    
    // Calculate total expenses by category for previous month
    const previousExpensesByCategory = previousMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc: Record<string, number>, tx: any) => {
        acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
        return acc;
      }, {});
    
    // Compare expenses between months
    Object.entries(currentExpensesByCategory).forEach(([category, amount]) => {
      const previousAmount = previousExpensesByCategory[category] || 0;
      
      if (previousAmount > 0) {
        const percentChange = ((Number(amount) - previousAmount) / previousAmount) * 100;
        
        if (percentChange >= 20) {
          insights.push(`You spent ${percentChange.toFixed(0)}% more on ${category} this month compared to last month.`);
        } else if (percentChange <= -20) {
          insights.push(`Great job! You reduced your ${category} spending by ${Math.abs(percentChange).toFixed(0)}% this month.`);
        }
      }
    });
    
    // Check for categories with no spending in previous month
    Object.entries(currentExpensesByCategory).forEach(([category, amount]) => {
      if (!previousExpensesByCategory[category] && Number(amount) > 1000) {
        insights.push(`New spending: You spent ₹${Number(amount).toLocaleString()} on ${category} this month.`);
      }
    });
    
    // Add generic saving tips
    if (insights.length === 0) {
      const categories = Object.entries(currentExpensesByCategory)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 2);
      
      if (categories.length > 0) {
        insights.push(`Your highest expense category is ${categories[0][0]} at ₹${Number(categories[0][1]).toLocaleString()}.`);
      }
      
      if (categories.length > 1) {
        insights.push(`Consider setting a budget for ${categories[0][0]} and ${categories[1][0]} to save more.`);
      }
    }
    
  } catch (error) {
    console.error('Error generating budget insights:', error);
  }
  
  return insights;
};
