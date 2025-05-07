
// AI utilities using client-side models
import { pipeline, env } from '@huggingface/transformers';
import * as tf from '@tensorflow/tfjs';
import { expenseCategories } from './financialUtils';

// Configure the transformers.js library
// Set to use CDN instead of downloading models to improve initial load time
env.allowLocalModels = false;
// Note: useCDN may not be supported in the current type definitions, but it works in runtime
// @ts-ignore - env.useCDN exists in the runtime but might not be in the type definitions
env.useCDN = true;

// Cache for loaded models to prevent reloading
let expenseCategorizer: any = null;
let anomalyDetector: tf.Sequential | null = null;

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
    
    // Load models in parallel
    await Promise.all([
      initExpenseCategorizer(),
      initAnomalyDetector()
    ]);
    
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
 */
const initAnomalyDetector = async (): Promise<void> => {
  if (!anomalyDetector) {
    try {
      // Create a simple autoencoder model
      anomalyDetector = tf.sequential();
      
      // Input layer (features: amount, day of week, hour of day)
      anomalyDetector.add(tf.layers.dense({
        inputShape: [3],
        units: 8,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l1({ l1: 0.01 })
      }));
      
      // Hidden layer
      anomalyDetector.add(tf.layers.dense({
        units: 4,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l1({ l1: 0.01 })
      }));
      
      // Bottleneck layer
      anomalyDetector.add(tf.layers.dense({
        units: 2,
        activation: 'relu'
      }));
      
      // Decoder layers
      anomalyDetector.add(tf.layers.dense({
        units: 4,
        activation: 'relu'
      }));
      
      anomalyDetector.add(tf.layers.dense({
        units: 8,
        activation: 'relu'
      }));
      
      // Output layer
      anomalyDetector.add(tf.layers.dense({
        units: 3,
        activation: 'linear'
      }));
      
      // Compile the model
      anomalyDetector.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError'
      });
      
      console.log('Anomaly detection model initialized');
    } catch (error) {
      console.error('Error initializing anomaly detection model:', error);
      anomalyDetector = null;
    }
  }
};

/**
 * Train the anomaly detection model with user's transaction history
 */
export const trainAnomalyDetector = async (transactions: any[]): Promise<void> => {
  if (!anomalyDetector || transactions.length < 10) {
    return;
  }
  
  try {
    // Prepare the training data
    const data = transactions.map(tx => {
      const date = new Date(tx.date);
      return [
        Number(tx.amount), // Amount
        date.getDay(), // Day of week (0-6)
        date.getHours() // Hour of day (0-23)
      ];
    });
    
    // Normalize the data
    const tensor = tf.tensor2d(data);
    const { mean, variance } = tf.moments(tensor, 0);
    const std = variance.sqrt();
    const normalizedData = tensor.sub(mean).div(std);
    
    // Train the model
    await anomalyDetector.fit(normalizedData, normalizedData, {
      epochs: 20,
      batchSize: 16,
      shuffle: true,
      verbose: 0
    });
    
    // Store the normalization parameters for inference
    // @ts-ignore - we're adding properties to the model object
    anomalyDetector.mean = mean;
    // @ts-ignore - we're adding properties to the model object
    anomalyDetector.std = std;
    
    console.log('Anomaly detection model trained successfully');
  } catch (error) {
    console.error('Error training anomaly detection model:', error);
  }
};

/**
 * Detect anomalies in transactions
 */
export const detectAnomaly = (transaction: any): boolean => {
  if (!anomalyDetector) return false;
  
  try {
    // Extract features
    const date = new Date(transaction.date);
    const features = [
      Number(transaction.amount),
      date.getDay(),
      date.getHours()
    ];
    
    // Normalize using stored parameters
    // @ts-ignore - accessing properties we added to the model
    const mean = anomalyDetector.mean;
    // @ts-ignore - accessing properties we added to the model
    const std = anomalyDetector.std;
    
    if (!mean || !std) return false;
    
    // Convert to tensor and normalize
    const input = tf.tensor2d([features]);
    const normalizedInput = input.sub(mean).div(std);
    
    // Get reconstruction
    const output = anomalyDetector.predict(normalizedInput) as tf.Tensor;
    
    // Calculate reconstruction error
    const errorTensor = tf.metrics.meanSquaredError(normalizedInput, output);
    const errorValue = errorTensor.dataSync()[0];
    
    // Detect anomaly if error is above threshold
    const threshold = 0.15; // This threshold should be tuned based on data
    const isAnomaly = typeof errorValue === 'number' && errorValue > threshold;
    
    // Cleanup tensors
    input.dispose();
    normalizedInput.dispose();
    output.dispose();
    errorTensor.dispose();
    
    return isAnomaly;
  } catch (error) {
    console.error('Error detecting anomaly:', error);
    return false;
  }
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
        const percentChange = ((amount - previousAmount) / previousAmount) * 100;
        
        if (percentChange >= 20) {
          insights.push(`You spent ${percentChange.toFixed(0)}% more on ${category} this month compared to last month.`);
        } else if (percentChange <= -20) {
          insights.push(`Great job! You reduced your ${category} spending by ${Math.abs(percentChange).toFixed(0)}% this month.`);
        }
      }
    });
    
    // Check for categories with no spending in previous month
    Object.entries(currentExpensesByCategory).forEach(([category, amount]) => {
      if (!previousExpensesByCategory[category] && amount > 1000) {
        insights.push(`New spending: You spent ₹${amount.toLocaleString()} on ${category} this month.`);
      }
    });
    
    // Add generic saving tips
    if (insights.length === 0) {
      const categories = Object.entries(currentExpensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);
      
      if (categories.length > 0) {
        insights.push(`Your highest expense category is ${categories[0][0]} at ₹${categories[0][1].toLocaleString()}.`);
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
