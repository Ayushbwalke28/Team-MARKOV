import { useState } from 'react';

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 selection:bg-black selection:text-white font-sans text-neutral-900">
      <div className="w-full max-w-md bg-white rounded-[1.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 transition-all duration-500 transform relative overflow-hidden">
        
        {/* Subtle decorative background blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-neutral-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-neutral-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              {isSignIn ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              {isSignIn 
                ? 'Enter your details to sign in to your account' 
                : 'Sign up with your email to get started'}
            </p>
          </div>

          {/* Buttons / Auth Providers */}
          <div className="space-y-4 mb-8">
            <button className="w-full flex items-center justify-center gap-3 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-[0.98]">
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs uppercase tracking-widest font-medium">or</span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {!isSignIn && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 focus-within:text-neutral-900 text-neutral-600 transition-colors">
                    <label className="text-sm font-medium" htmlFor="firstName">First name</label>
                    <input 
                      type="text" 
                      id="firstName"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-1.5 focus-within:text-neutral-900 text-neutral-600 transition-colors">
                    <label className="text-sm font-medium" htmlFor="lastName">Last name</label>
                    <input 
                      type="text" 
                      id="lastName"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5 focus-within:text-neutral-900 text-neutral-600 transition-colors">
              <label className="text-sm font-medium" htmlFor="email">Email address</label>
              <input 
                type="email" 
                id="email"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1.5 focus-within:text-neutral-900 text-neutral-600 transition-colors">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all"
                placeholder="••••••••"
              />
            </div>

            {isSignIn && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:ring-offset-0 accent-neutral-900"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-600 cursor-pointer select-none">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-neutral-900 hover:text-neutral-600 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full mt-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-md shadow-neutral-900/10"
            >
              {isSignIn ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-neutral-500">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsSignIn(!isSignIn)}
              className="font-medium text-neutral-900 hover:text-neutral-600 focus:outline-none transition-colors"
            >
              {isSignIn ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
