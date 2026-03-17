"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      // First try to fetch the session actively
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // Clean the URL if Supabase authentication tokens are present in the hash fragment
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      
      if (!session && !isAuthPage) {
        // Missing session & navigating around app features = Boot back to login
        router.push('/login');
      } else if (session && isAuthPage) {
        // Already authenticated but trying to load login = Boot to dashboard
        router.push('/dashboard');
      }
      
      setLoading(false);
    };

    checkUser();

    // Listen for realtime session changes (like logging out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      
      if (!session && !isAuthPage) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // To prevent UI flashes of the protected content, show a generic loading screen initially
  if (loading) {
    return (
      <div className="w-full w-screen flex-1 h-screen min-h-screen bg-[#f5f5f7] dark:bg-[#0f0f12] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center animate-pulse gap-3 text-gray-900 dark:text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-[4px] border-gray-900 dark:border-white"></div>
            <span className="font-bold text-2xl tracking-tight">SEOMancer</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
