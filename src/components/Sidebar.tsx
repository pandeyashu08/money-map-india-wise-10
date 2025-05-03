
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Menu, X, Home, Wallet, TrendingUp, Calculator, User, 
  Settings, Sun, Moon, BarChart2
} from 'lucide-react';

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
        "flex items-center gap-3 w-full p-3 rounded-md transition-colors duration-200",
        "hover:bg-blue-700/30",
        isActive 
          ? "bg-blue-700/40 font-medium border-l-4 border-blue-500" 
          : "font-normal opacity-85 border-l-4 border-transparent",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {isOpen && <span className="truncate">{children}</span>}
    </NavLink>
  );
};

interface SidebarProps {
  userName: string;
  avatarUrl?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userName, avatarUrl }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  
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
  
  const toggleSidebar = () => setIsOpen(!isOpen);
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Get first letter of name for avatar fallback
  const getInitials = () => {
    if (userName.includes('@')) {
      return userName.charAt(0).toUpperCase();
    }
    return userName.charAt(0).toUpperCase();
  };
  
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
          "fixed inset-y-0 left-0 z-30 flex flex-col w-[200px] bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-lg transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-blue-600 font-bold text-xl">
                M
              </div>
              <div className="font-bold text-lg">Money Map India</div>
            </div>
            
            <div className="bg-blue-700/40 rounded-md p-3 mb-4 flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white/20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-blue-100 opacity-90">Welcome,</p>
                <p className="text-base font-medium truncate">{userName}</p>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1 flex-1">
            <NavItem to="/" icon={BarChart2} isOpen={isOpen} end>Dashboard</NavItem>
            <NavItem to="/expenses" icon={Wallet} isOpen={isOpen}>Transactions</NavItem>
            <NavItem to="/investments" icon={TrendingUp} isOpen={isOpen}>Investments</NavItem>
            <NavItem to="/tax-planner" icon={Calculator} isOpen={isOpen}>Tax Calculator</NavItem>
          </nav>
          
          <div className="pt-4 mt-auto border-t border-blue-500/50 space-y-1">
            <NavItem to="/profile" icon={User} isOpen={isOpen}>Profile</NavItem>
            <NavItem to="/settings" icon={Settings} isOpen={isOpen}>Settings</NavItem>
            
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full p-3 rounded-md transition-colors duration-200 hover:bg-blue-700/50"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-5 w-5 shrink-0" />
                  {isOpen && <span>Dark Mode</span>}
                </>
              ) : (
                <>
                  <Sun className="h-5 w-5 shrink-0" />
                  {isOpen && <span>Light Mode</span>}
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
