"use client";

import Link from "next/link";
import { EyeOff, Eye, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/');
    };
    checkSession();
  }, [router]);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setError(error.message);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      router.push('/');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex p-4 font-sans">
      {/* Left Pane - Gradient & Features */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center rounded-[2.5rem] p-12 relative overflow-hidden bg-gradient-to-b from-white via-neutral-400 to-black">
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
          
          {/* Logo Placeholder */}
          <div className="flex items-center gap-3 mb-20 text-black">
            <div className="w-6 h-6 rounded-full border-[4px] border-black"></div>
            <span className="font-semibold text-lg">SEOMancer</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center tracking-tight text-black">
            Welcome Back
          </h1>
          <p className="text-neutral-800 font-medium text-center mb-16 max-w-[280px] leading-relaxed">
            Log in to continue optimizing and analyzing your websites.
          </p>

        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Log In</h2>
            <p className="text-gray-400 text-sm">
              Enter your credentials to access your account.
            </p>
          </div>

          <div className="mb-8">
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 border border-[#2a2b30] hover:bg-[#1f2025] transition-colors py-3 rounded-xl text-sm font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-[#2a2b30]"></div>
            <span className="flex-shrink-0 px-4 text-xs text-gray-500 font-medium tracking-wide">Or</span>
            <div className="flex-grow border-t border-[#2a2b30]"></div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</div>}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
              <input 
                id="email"
                name="email"
                type="email" 
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eg. johnfrans@gmail.com" 
                className="w-full bg-[#16171a] border border-[#2a2b30] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                <Link href="#" className="text-xs text-white hover:underline font-medium">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input 
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  className="w-full bg-[#16171a] border border-[#2a2b30] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors placeholder:text-gray-600 pr-12"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button disabled={isLoading} type="submit" className="w-full bg-white text-black font-semibold text-sm py-3.5 rounded-xl hover:bg-gray-200 transition-colors mt-8 shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] disabled:opacity-70">
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don&apos;t have an account? <Link href="/signup" className="text-white font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
