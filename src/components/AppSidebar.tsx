
import React, { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';

import {
  BarChart2, Wallet, TrendingUp, Calculator, User,
  Settings, Sun, Moon, LogOut
} from 'lucide-react';

interface AppSidebarProps {
  userName: string;
  avatarUrl?: string;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ userName, avatarUrl }) => {
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state: sidebarState } = useSidebar();

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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const menuItems = [
    { icon: BarChart2, label: 'Dashboard', path: '/', end: true },
    { icon: Wallet, label: 'Transactions', path: '/expenses' },
    { icon: TrendingUp, label: 'Investments', path: '/investments' },
    { icon: Calculator, label: 'Tax Calculator', path: '/tax-planner' },
  ];

  const footerItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      <Sidebar className='bg-gray-200/30'>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 pt-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-800 shadow-lg text-white font-bold text-xl">
              M
            </div>
            <div className={cn("transition-opacity", sidebarState === "collapsed" && "opacity-0")}>
              <div className="font-bold text-base">Money Map India</div>
              <div className="text-xs text-muted-foreground">Managing finances</div>
            </div>
          </div>
          
          <div className="bg-muted/30 backdrop-blur-sm rounded-lg p-3 m-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className={cn("transition-opacity", sidebarState === "collapsed" && "opacity-0")}>
                <p className="text-xs text-muted-foreground">Welcome,</p>
                <p className="text-sm font-medium truncate max-w-[120px]">{userName}</p>
              </div>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)}
                      tooltip={item.label}
                    >
                      <NavLink to={item.path} end={item.end}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {footerItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.path}
                      tooltip={item.label}
                    >
                      <NavLink to={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={toggleTheme}
                    tooltip={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  >
                    {theme === 'light' ? <Moon /> : <Sun />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleSignOut}
                    tooltip="Sign Out"
                    className="hover:bg-red-600/30 hover:text-red-100"
                  >
                    <LogOut />
                    <span>Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarRail />
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
