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

  // Stability fix: Always render the Provider and the children to keep the hook count stable.
  // Use a conditional overlay for the loading state instead of an early return.
  return (
    <AuthContext.Provider value={{ user, loading }}>
        {children}
        {loading && (
            <div suppressHydrationWarning={true} className="fixed inset-0 z-[9999] w-screen h-screen bg-[#f5f5f7] dark:bg-[#0f0f12] flex items-center justify-center">
                <div suppressHydrationWarning={true} className="flex flex-col items-center justify-center animate-pulse gap-3 text-gray-900 dark:text-white">
                    <div suppressHydrationWarning={true} className="flex items-center gap-3">
                        <div suppressHydrationWarning={true} className="w-8 h-8 rounded-full border-[4px] border-gray-900 dark:border-white"></div>
                        <span suppressHydrationWarning={true} className="font-bold text-2xl tracking-tight">SEOMancer</span>
                    </div>
                </div>
            </div>
        )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
