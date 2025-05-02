
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [hasFinancialDetails, setHasFinancialDetails] = useState<boolean | null>(null);
  const [checkingDetails, setCheckingDetails] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkFinancialDetails = async () => {
      if (!user) {
        setCheckingDetails(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('financial_details')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        setHasFinancialDetails(!!data && !error);
      } catch (error) {
        setHasFinancialDetails(false);
      } finally {
        setCheckingDetails(false);
      }
    };

    if (user) {
      checkFinancialDetails();
    } else {
      setCheckingDetails(false);
    }
  }, [user]);

  // Show loading state while checking authentication and financial details
  if (loading || checkingDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace state={{ returnUrl: location.pathname }} />;
  }

  // Redirect new users to financial details page, but only if they're not already there
  // and not trying to log out (settings page)
  if (hasFinancialDetails === false && 
      location.pathname !== '/financial-details' && 
      location.pathname !== '/settings') {
    return <Navigate to="/financial-details" replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
