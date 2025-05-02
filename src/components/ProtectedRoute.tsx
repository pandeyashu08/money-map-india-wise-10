
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasFinancialSetup, setHasFinancialSetup] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  useEffect(() => {
    const checkFinancialSetup = async () => {
      if (!user) {
        setChecking(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('monthly_income, monthly_expenses, savings_goal')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching financial setup:', error);
          setHasFinancialSetup(false);
          setChecking(false);
          return;
        }
          
        // Check if financial data is complete
        const isComplete = Boolean(
          data && 
          data.monthly_income !== null && 
          data.monthly_expenses !== null && 
          data.savings_goal !== null
        );
        
        setHasFinancialSetup(isComplete);
        setChecking(false);
      } catch (error) {
        console.error('Error checking financial setup:', error);
        setHasFinancialSetup(false);
        setChecking(false);
      }
    };
    
    checkFinancialSetup();
    setCurrentPath(window.location.pathname);
  }, [user]);
  
  // Show loading state while checking auth
  if (loading || checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Allow access to financial details page regardless of setup status
  if (currentPath === '/financial-details') {
    return <Outlet />;
  }
  
  // Redirect to financial setup if not completed (except for /financial-details)
  if (!hasFinancialSetup) {
    return <Navigate to="/financial-details" replace />;
  }
  
  // User is authenticated and has completed financial setup
  return <Outlet />;
};

export default ProtectedRoute;
