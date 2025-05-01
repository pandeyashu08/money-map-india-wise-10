
import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wallet, User, Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { user, signOut } = useAuth();

  return (
    <header className={cn("border-b border-border", className)}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Wallet className="h-6 w-6 text-finance-blue mr-2" />
            <h1 className="text-xl font-bold text-finance-blue">Money Map</h1>
          </Link>
        </div>
        
        {user ? (
          <>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-sm font-medium hover:text-finance-blue transition-colors">Dashboard</Link>
              <Link to="/expenses" className="text-sm font-medium hover:text-finance-blue transition-colors">Expenses</Link>
              <Link to="/tax" className="text-sm font-medium hover:text-finance-blue transition-colors">Tax Planner</Link>
              <Link to="/investments" className="text-sm font-medium hover:text-finance-blue transition-colors">Investments</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div>
            <Button asChild>
              <Link to="/auth">
                Sign In
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
