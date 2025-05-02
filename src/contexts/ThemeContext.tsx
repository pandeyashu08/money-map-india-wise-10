
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const { user } = useAuth();

  // Load theme from localStorage or system preference on initial load
  useEffect(() => {
    const loadTheme = async () => {
      // First check user preferences if logged in
      if (user) {
        const { data, error } = await supabase.auth.getUser();
        
        if (!error && data?.user?.user_metadata?.theme) {
          const userTheme = data.user.user_metadata.theme as Theme;
          setThemeState(userTheme);
          document.documentElement.classList.toggle('dark', userTheme === 'dark');
          return;
        }
      }
      
      // Fallback to localStorage
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      
      // Fallback to system preference
      if (savedTheme) {
        setThemeState(savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
      }
      
      // Apply theme to document
      document.documentElement.classList.toggle('dark', 
        savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    };
    
    loadTheme();
  }, [user]);

  // Function to set theme and save to localStorage and user metadata if logged in
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Save to user metadata if logged in
    if (user) {
      try {
        await supabase.auth.updateUser({
          data: { theme: newTheme }
        });
      } catch (error) {
        console.error('Failed to update user theme preference:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
