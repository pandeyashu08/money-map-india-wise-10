import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Upload, Key, Check, X } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    currency: 'INR',
    gender: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileErrors, setProfileErrors] = useState({
    firstName: '',
    lastName: ''
  });
  
  // Load user data
  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        // Get profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        // Get user metadata
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        // Extract data from user metadata
        const userMetadata = userData.user.user_metadata || {};
        
        setFormData({
          firstName: profileData?.first_name || '',
          lastName: profileData?.last_name || '',
          currency: userMetadata.currency || 'INR',
          gender: userMetadata.gender || ''
        });
        
        // Set avatar if exists
        if (userMetadata.avatar_url) {
          setAvatarUrl(userMetadata.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error loading profile',
          description: 'There was a problem loading your profile information',
          variant: 'destructive'
        });
      }
    };
    
    fetchProfile();
  }, [user]);
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (profileErrors[name as keyof typeof profileErrors]) {
      setProfileErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle dropdown changes
  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({ ...prev, currency: value }));
  };
  
  const handleGenderChange = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };
  
  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = {
      firstName: '',
      lastName: ''
    };
    let isValid = true;
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    
    setProfileErrors(newErrors);
    return isValid;
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    let isValid = true;
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/[A-Z]/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must include an uppercase letter';
      isValid = false;
    } else if (!/[0-9]/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must include a number';
      isValid = false;
    } else if (!/[!@#$%^&*]/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must include a special character (!@#$%^&*)';
      isValid = false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setPasswordErrors(newErrors);
    return isValid;
  };
  
  // Submit profile form
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update profile in the database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { 
          currency: formData.currency,
          gender: formData.gender
        }
      });
      
      if (userError) throw userError;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been saved'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: 'There was a problem saving your profile information',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Submit password form
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully'
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Password update failed',
        description: 'There was a problem updating your password',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Validate file size and type
  const validateFile = (file: File) => {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Profile picture must be less than 5MB',
        variant: 'destructive'
      });
      return false;
    }
    
    // Check file type (only JPEG, PNG allowed)
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPEG and PNG images are allowed',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };
  
  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    // Validate file
    if (!validateFile(file)) return;
    
    setUploadingAvatar(true);
    
    try {
      // Check if storage bucket exists and create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const profileBucket = buckets?.find(b => b.name === 'profile-pictures');
      
      if (!profileBucket) {
        await supabase.storage.createBucket('profile-pictures', {
          public: true
        });
      }
      
      // Upload the file
      const filePath = `${user.id}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error: uploadError, data } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrl } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);
      
      if (publicUrl) {
        // Update user metadata with avatar URL
        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl.publicUrl }
        });
        
        // Update the avatar URL in user's profile
        // Note: We removed the profile_picture_url field as it doesn't exist in the schema
        
        if (updateError) throw updateError;
        
        setAvatarUrl(publicUrl.publicUrl);
        
        toast({
          title: 'Profile picture updated',
          description: 'Your profile picture has been successfully updated.'
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error uploading image',
        description: 'There was a problem uploading your profile picture',
        variant: 'destructive'
      });
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
      </div>
      
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Picture Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile photo</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-4">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    JPG or PNG. Max 5MB.
                  </p>
                </div>
                
                <label>
                  <Button 
                    variant="outline" 
                    className="cursor-pointer"
                    disabled={uploadingAvatar}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    {uploadingAvatar ? "Uploading..." : "Change Picture"}
                    <Upload className="ml-2 h-4 w-4" />
                  </Button>
                  <input 
                    type="file" 
                    id="avatar-upload"
                    className="hidden" 
                    accept="image/jpeg, image/png"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </label>
              </CardContent>
            </Card>
            
            {/* Personal Information Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleProfileChange}
                      />
                      {profileErrors.firstName && (
                        <p className="text-sm text-red-500">{profileErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleProfileChange}
                      />
                      {profileErrors.lastName && (
                        <p className="text-sm text-red-500">{profileErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Preferred Currency</Label>
                      <Select 
                        value={formData.currency} 
                        onValueChange={handleCurrencyChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="GBP">British Pound (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={handleGenderChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Password requirements:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      {passwordData.newPassword.length >= 8 ? 
                        <Check className="h-4 w-4 text-green-500" /> : 
                        <X className="h-4 w-4 text-red-500" />}
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      {/[A-Z]/.test(passwordData.newPassword) ? 
                        <Check className="h-4 w-4 text-green-500" /> : 
                        <X className="h-4 w-4 text-red-500" />}
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      {/[0-9]/.test(passwordData.newPassword) ? 
                        <Check className="h-4 w-4 text-green-500" /> : 
                        <X className="h-4 w-4 text-red-500" />}
                      One number
                    </li>
                    <li className="flex items-center gap-2">
                      {/[!@#$%^&*]/.test(passwordData.newPassword) ? 
                        <Check className="h-4 w-4 text-green-500" /> : 
                        <X className="h-4 w-4 text-red-500" />}
                      One special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Change Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
