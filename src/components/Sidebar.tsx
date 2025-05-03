
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, X, BarChart2, Wallet, TrendingUp, Calculator, User, 
  Settings, Sun, Moon, LogOut
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen: boolean;
  end?: boolean;
  isActive?: boolean;
}

const NavItem = ({ to, icon: Icon, children, isOpen, end = false, isActive }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive: routeActive }) => cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300",
        "hover:bg-blue-600/50",
        (isActive || routeActive)
          ? "bg-blue-600/70 font-medium text-white" 
          : "font-normal text-blue-100/80",
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
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden bg-blue-600/80 text-white hover:bg-blue-700"
        onClick={toggleSidebar}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
      
      {/* Overlay for mobile */}
      {isOpen && isMobile() && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col w-[260px] bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-transparent">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-800 shadow-lg text-white font-bold text-xl">
                M
              </div>
              <div>
                <div className="font-bold text-lg text-white">Money Map India</div>
                <div className="text-xs text-blue-200/80">Managing your finances</div>
              </div>
            </div>
            
            <div className="bg-blue-800/40 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-inner border border-blue-700/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-blue-500 ring-2 ring-blue-400/20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-blue-100/70">Welcome,</p>
                  <p className="text-base font-medium text-white truncate">{userName}</p>
                </div>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1 px-3 flex-1 mt-2">
            <NavItem to="/" icon={BarChart2} isOpen={isOpen} end>Dashboard</NavItem>
            <NavItem to="/expenses" icon={Wallet} isOpen={isOpen}>Transactions</NavItem>
            <NavItem to="/investments" icon={TrendingUp} isOpen={isOpen}>Investments</NavItem>
            <NavItem to="/tax-planner" icon={Calculator} isOpen={isOpen}>Tax Calculator</NavItem>
          </nav>
          
          <div className="pt-4 mt-auto px-3 pb-5 space-y-1 border-t border-blue-600/40">
            <NavItem to="/profile" icon={User} isOpen={isOpen}>Profile</NavItem>
            <NavItem to="/settings" icon={Settings} isOpen={isOpen}>Settings</NavItem>
            
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300 text-blue-100/80 hover:bg-blue-600/50"
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
            
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300 text-blue-100/80 hover:bg-red-600/30 hover:text-red-100"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {isOpen && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
