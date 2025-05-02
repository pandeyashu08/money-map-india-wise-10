
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BadgeDollarSign, Calculator, Wallet } from 'lucide-react';

const FinancialDetails = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    savingsGoal: ''
  });
  
  // Fetch existing financial details if available
  useEffect(() => {
    const fetchFinancialDetails = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('monthly_income, monthly_expenses, savings_goal')
          .eq('id', user.id)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            throw error;
          }
          return; // No data found, use default empty values
        }
        
        // Only set values if they exist
        setFormData({
          monthlyIncome: data.monthly_income !== null ? String(data.monthly_income) : '',
          monthlyExpenses: data.monthly_expenses !== null ? String(data.monthly_expenses) : '',
          savingsGoal: data.savings_goal !== null ? String(data.savings_goal) : ''
        });
      } catch (error) {
        console.error('Error fetching financial details:', error);
        toast({
          title: 'Something went wrong',
          description: 'Unable to fetch your financial details',
          variant: 'destructive',
        });
      }
    };
    
    fetchFinancialDetails();
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow numeric input with decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication error',
        description: 'You must be logged in to save financial details',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate inputs
    if (!formData.monthlyIncome.trim() || !formData.monthlyExpenses.trim() || !formData.savingsGoal.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update the profile with financial details
      const { error } = await supabase
        .from('profiles')
        .update({
          monthly_income: parseFloat(formData.monthlyIncome),
          monthly_expenses: parseFloat(formData.monthlyExpenses),
          savings_goal: parseFloat(formData.savingsGoal),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Financial details saved',
        description: 'Your financial information has been updated successfully',
      });
      
      // Redirect to dashboard
      navigate('/');
    } catch (error) {
      console.error('Error saving financial details:', error);
      toast({
        title: 'Error saving details',
        description: 'There was a problem updating your financial information',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-t-4 border-t-blue-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Financial Setup</CardTitle>
            <CardDescription>
              Tell us about your financial situation to get personalized insights
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome" className="flex items-center gap-2">
                  <BadgeDollarSign className="w-4 h-4 text-blue-500" />
                  Average Monthly Income (₹)
                </Label>
                <Input
                  id="monthlyIncome"
                  name="monthlyIncome"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 50000"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthlyExpenses" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-red-500" />
                  Average Monthly Expenses (₹)
                </Label>
                <Input
                  id="monthlyExpenses"
                  name="monthlyExpenses"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 30000"
                  value={formData.monthlyExpenses}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="savingsGoal" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-green-500" />
                  Monthly Savings Goal (₹)
                </Label>
                <Input
                  id="savingsGoal"
                  name="savingsGoal"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 10000"
                  value={formData.savingsGoal}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Financial Details'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDetails;
