
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Home, DollarSign, TrendingUp, Calculator, User, Settings, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen: boolean;
  end?: boolean;
}

const NavItem = ({ to, icon: Icon, children, isOpen, end = false }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(
        "flex items-center gap-3 w-full p-2 rounded-md transition-colors duration-200",
        "hover:bg-blue-700/50",
        isActive ? "bg-blue-700/60 font-medium" : "font-medium",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {isOpen && <span className="truncate">{children}</span>}
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const location = useLocation();
  
  const isMobile = () => window.innerWidth < 768;
  
  useEffect(() => {
    setIsOpen(!isMobile());
    
    const handleResize = () => {
      setIsOpen(!isMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (isMobile()) {
      setIsOpen(false);
    }
  }, [location]);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (data && (data.first_name || data.last_name)) {
          setUserName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
        } else {
          // Extract name from email if profile data not available
          setUserName(user.email?.split('@')[0] || 'User');
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  const toggleSidebar = () => setIsOpen(!isOpen);
  
  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
      
      {/* Overlay for mobile */}
      {isOpen && isMobile() && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-gradient-to-b from-blue-600 to-indigo-600 text-white shadow-lg transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Money Map</h1>
            {user && (
              <div className="bg-blue-700/40 rounded-md p-3 mb-4">
                <p className="text-sm text-blue-100">Hello,</p>
                <p className="text-lg font-semibold truncate">{userName}</p>
              </div>
            )}
          </div>
          
          <nav className="space-y-2 flex-1">
            <NavItem to="/" icon={Home} isOpen={isOpen} end>Dashboard</NavItem>
            <NavItem to="/expense-tracker" icon={Wallet} isOpen={isOpen}>Expense Tracker</NavItem>
            <NavItem to="/investment" icon={TrendingUp} isOpen={isOpen}>Investment Planning</NavItem>
            <NavItem to="/tax" icon={Calculator} isOpen={isOpen}>Tax Planner</NavItem>
          </nav>
          
          <div className="pt-4 mt-auto border-t border-blue-500/50">
            <NavItem to="/profile" icon={User} isOpen={isOpen}>Profile</NavItem>
            <NavItem to="/settings" icon={Settings} isOpen={isOpen}>Settings</NavItem>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
