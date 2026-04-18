import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import api from './lib/api';
import { useAuth } from './context/AuthContext';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { checkAuth } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await api.post('/auth/register', { email, password });
        // Optional: you could also update profile here with name
        await checkAuth();
        navigate('/home');
      } else {
        await api.post('/auth/login', { email: identifier, password: loginPassword });
        await checkAuth();
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Panel - Dark branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1628] text-white flex-col justify-center px-16 xl:px-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-80 h-80 bg-[#2563EB] rounded-full blur-[128px]" />
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-[#F59E0B] rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.jpeg" alt="Worksphere" className="brand-logo w-12 h-12" />
            <span className="text-2xl font-bold">Worksphere</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black leading-[1.1] mb-6">
            Your Trusted <br/> Professional <span className="text-[#2563EB]">Network</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-md">
            Connect with verified professionals, discover opportunities, and grow your career in a trusted ecosystem.
          </p>
          <div className="flex items-center gap-2 mt-10 text-white/30">
            <Shield size={14} />
            <span className="text-xs uppercase tracking-widest font-semibold">Only verified professionals and businesses</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#f7f9fb] px-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src="/logo.jpeg" alt="Worksphere" className="brand-logo w-10 h-10" />
            <span className="text-xl font-bold text-[#0A1628]">Worksphere</span>
          </div>

          <h2 className="text-3xl font-black text-[#0A1628] mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-[#75777d] text-sm mb-8">
            {isSignUp ? 'Join the verified professional ecosystem' : 'Sign in to your professional ledger'}
          </p>

          {/* Google Auth */}
          <button className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#f2f4f6] border border-[#e0e3e5] py-3 rounded-xl text-sm font-medium text-[#191c1e] mb-6 transition-colors shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-[#e0e3e5] flex-1" />
            <span className="text-xs text-[#75777d] uppercase tracking-widest font-semibold">Or</span>
            <div className="h-px bg-[#e0e3e5] flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}
            {isSignUp ? (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#45474c] mb-1.5 block">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required
                    className="w-full bg-white border border-[#e0e3e5] text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#45474c] mb-1.5 block">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required
                    className="w-full bg-white border border-[#e0e3e5] text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#45474c] mb-1.5 block">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" required
                      className="w-full bg-white border border-[#e0e3e5] text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/50 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#191c1e]">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#45474c] mb-1.5 block">Email or Username</label>
                  <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="name@company.com" required
                    className="w-full bg-white border border-[#e0e3e5] text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/50 transition-all" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#45474c]">Password</label>
                    <a href="#" className="text-xs text-[#2563EB] font-medium hover:underline">Forgot Password?</a>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required
                      className="w-full bg-white border border-[#e0e3e5] text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/50 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#191c1e]">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}
            <button type="submit" disabled={loading} className="w-full bg-[#0A1628] hover:bg-[#101c2e] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#0A1628]/20 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#75777d]">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-[#2563EB] font-bold hover:underline">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          <p className="mt-4 text-center text-[10px] text-[#c5c6cd] flex items-center justify-center gap-1.5">
            <Shield size={10} /> Only verified professionals and businesses are allowed on this platform
          </p>
        </div>
      </div>
    </div>
  );
}
