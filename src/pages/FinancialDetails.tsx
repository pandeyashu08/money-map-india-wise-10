
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const FinancialDetails: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    savingsGoal: ''
  });
  
  const [errors, setErrors] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    savingsGoal: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      monthlyIncome: '',
      monthlyExpenses: '',
      savingsGoal: ''
    };
    let isValid = true;

    if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) <= 0) {
      newErrors.monthlyIncome = 'Monthly income must be a positive number';
      isValid = false;
    }

    if (!formData.monthlyExpenses || parseFloat(formData.monthlyExpenses) <= 0) {
      newErrors.monthlyExpenses = 'Monthly expenses must be a positive number';
      isValid = false;
    }

    if (!formData.savingsGoal || parseFloat(formData.savingsGoal) < 0) {
      newErrors.savingsGoal = 'Savings goal must be a positive number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save financial details",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
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
        title: "Financial details saved!",
        description: "Your financial information has been updated successfully."
      });
      
      navigate('/');
      
    } catch (error) {
      console.error('Error saving financial details:', error);
      toast({
        title: "Error saving details",
        description: "There was a problem saving your financial details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Financial Setup</CardTitle>
          <CardDescription>
            Help us personalize your financial dashboard by providing some basic information.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="monthlyIncome" className="text-sm font-medium">
                Average Monthly Income (₹)
              </label>
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                placeholder="50,000"
                value={formData.monthlyIncome}
                onChange={handleChange}
              />
              {errors.monthlyIncome && (
                <p className="text-sm text-red-500">{errors.monthlyIncome}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="monthlyExpenses" className="text-sm font-medium">
                Average Monthly Expenses (₹)
              </label>
              <Input
                id="monthlyExpenses"
                name="monthlyExpenses"
                type="number"
                placeholder="30,000"
                value={formData.monthlyExpenses}
                onChange={handleChange}
              />
              {errors.monthlyExpenses && (
                <p className="text-sm text-red-500">{errors.monthlyExpenses}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="savingsGoal" className="text-sm font-medium">
                Monthly Savings Goal (₹)
              </label>
              <Input
                id="savingsGoal"
                name="savingsGoal"
                type="number"
                placeholder="10,000"
                value={formData.savingsGoal}
                onChange={handleChange}
              />
              {errors.savingsGoal && (
                <p className="text-sm text-red-500">{errors.savingsGoal}</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for Now
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save & Continue"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default FinancialDetails;
