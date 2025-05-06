
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<{ 
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        // Get user metadata from auth
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        // Get profile data from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfileData({
          first_name: data.first_name,
          last_name: data.last_name,
          avatar_url: userData.user.user_metadata.avatar_url || null,
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar 
          userName={profileData?.first_name ? 
            `${profileData.first_name} ${profileData.last_name || ''}`.trim() : 
            user?.email?.split('@')[0] || 'User'
          }
          avatarUrl={profileData?.avatar_url || undefined}
        />
        <SidebarInset className="p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center mb-6">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-bold">Money Map India</h1>
            </div>
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
