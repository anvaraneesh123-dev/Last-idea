import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { offlineDb } from '../services/indexedDb';
import { DEMO_PROFILES } from '../services/dataService';

interface AuthContextType {
  currentUser: UserProfile;
  userRole: UserRole;
  isAdmin: boolean;
  isVolunteer: boolean;
  isMember: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (fullName: string, email: string, role: UserRole, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nexus_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEMO_PROFILES[0]; // Default to Sarah Jenkins (Administrator) for full capability access
  });

  const [isLoading, setIsLoading] = useState(true);
  const isDemoMode = !isSupabaseConfigured;

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nexus_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Initial Supabase auth listener if configured
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              email: profile.email || session.user.email || '',
              fullName: profile.full_name || 'Community Member',
              role: profile.role || 'community_member',
              avatarUrl: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
              phone: profile.phone || '',
              address: profile.address || '',
              neighborhoodZone: profile.neighborhood_zone || 'Zone 4',
            });
          }
        }
      } catch (err) {
        console.warn('Supabase auth session check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: profile.id,
            email: profile.email || session.user.email || '',
            fullName: profile.full_name || 'Community Member',
            role: profile.role || 'community_member',
            avatarUrl: profile.avatar_url,
            phone: profile.phone,
            address: profile.address,
            neighborhoodZone: profile.neighborhood_zone,
          });
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              role: profile.role,
              avatarUrl: profile.avatar_url,
              phone: profile.phone,
              address: profile.address,
              neighborhoodZone: profile.neighborhood_zone,
            });
            return;
          }
        }
      }

      // Demo Mode login fallback: match existing demo user or generate session
      const matched = DEMO_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
      } else {
        const newUser: UserProfile = {
          id: 'usr-' + Date.now(),
          email,
          fullName: email.split('@')[0].replace('.', ' '),
          role: 'community_member',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          phone: '+1 (555) 000-0000',
          neighborhoodZone: 'Zone 4 Resident',
        };
        setCurrentUser(newUser);
        await offlineDb.put('profiles', newUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, role: UserRole, phone?: string) => {
    setIsLoading(true);
    try {
      const newUser: UserProfile = {
        id: 'usr-' + Date.now(),
        email,
        fullName,
        role,
        avatarUrl: role === 'administrator' 
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
          : role === 'volunteer'
          ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        phone: phone || '+1 (555) 234-5678',
        neighborhoodZone: 'Zone 4 Cascadia',
        createdAt: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password: 'NexusPassword123!',
          });
          if (!error && data.user) {
            newUser.id = data.user.id;
            await supabase.from('profiles').insert({
              id: data.user.id,
              email,
              full_name: fullName,
              role,
              phone: newUser.phone,
              neighborhood_zone: newUser.neighborhoodZone,
            });
          }
        } catch (e) {
          console.warn('Supabase register error:', e);
        }
      }

      await offlineDb.put('profiles', newUser);
      setCurrentUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    // In demo mode, reset to standard community member
    setCurrentUser(DEMO_PROFILES[2]);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({
          full_name: updated.fullName,
          phone: updated.phone,
          address: updated.address,
          neighborhood_zone: updated.neighborhoodZone,
          updated_at: new Date().toISOString(),
        }).eq('id', updated.id);
      } catch (e) {
        console.warn('Supabase profile update failed:', e);
      }
    }

    await offlineDb.put('profiles', updated);
  };

  const switchDemoRole = (role: UserRole) => {
    const target = DEMO_PROFILES.find(p => p.role === role) || DEMO_PROFILES[0];
    setCurrentUser(target);
  };

  const isAdmin = currentUser.role === 'administrator';
  const isVolunteer = currentUser.role === 'volunteer' || isAdmin;
  const isMember = true;
  const isAuthenticated = Boolean(currentUser && currentUser.id);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole: currentUser.role,
        isAdmin,
        isVolunteer,
        isMember,
        isAuthenticated,
        isLoading,
        isDemoMode,
        login,
        register,
        logout,
        updateProfile,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
