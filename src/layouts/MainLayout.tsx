
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        userName={profileData?.first_name ? 
          `${profileData.first_name} ${profileData.last_name || ''}`.trim() : 
          user?.email?.split('@')[0] || 'User'
        }
        avatarUrl={profileData?.avatar_url || undefined}
      />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6 transition-all">
        <div className="container mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
