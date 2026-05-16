import React, { useState } from 'react';
import { Mail, Lock, ChevronRight, AlertCircle, ArrowLeft, Stethoscope, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, setAuthToken, AuthUser } from './Shared';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function LoginScreen({ onLogin }: { onLogin: (userData: AuthUser | Screen) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginRole, setLoginRole] = useState<'doctor' | 'patient'>('doctor');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const token = await result.user.getIdToken();
      setAuthToken(token);
      
      const userData: AuthUser = { 
        email: result.user.email!, 
        role: loginRole, 
        name: result.user.displayName || (loginRole === 'doctor' ? 'Dr. ' : '') + result.user.email!.split('@')[0], 
        token: token 
      };

      if (loginRole === 'patient') {
        userData.patientId = result.user.uid.slice(0, 8).toUpperCase();
      }
      
      onLogin(userData);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let userCredential;
      try {
        // Try to sign in first
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError: any) {
        // If user not found, auto-register them for a seamless experience
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
          } catch (registerError: any) {
             throw registerError;
          }
        } else {
          throw signInError;
        }
      }

      if (userCredential) {
        const token = await userCredential.user.getIdToken();
        setAuthToken(token);
        
        const userData: AuthUser = { 
          email: userCredential.user.email!, 
          role: loginRole, 
          name: userCredential.user.displayName || (loginRole === 'doctor' ? 'Dr. ' : '') + userCredential.user.email!.split('@')[0], 
          token: token 
        };

        if (loginRole === 'patient') {
          // If a patient logs in, give them a consistent ID based on their email hash or UID
          userData.patientId = userCredential.user.uid.slice(0, 8).toUpperCase();
        }
        
        onLogin(userData);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center p-6 text-white font-sans overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 shadow-2xl overflow-hidden"
      >
        <button 
          onClick={() => (onLogin as any)('LANDING')}
          className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif font-bold tracking-tight mb-2 italic">Access</h1>
          <p className="text-zinc-400 text-[10px] tracking-[0.3em] font-bold uppercase">Secure Clinical Portal</p>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 mb-8">
          <button 
            onClick={() => setLoginRole('doctor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${loginRole === 'doctor' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}
          >
            <Stethoscope size={14} /> Doctor
          </button>
          <button 
            onClick={() => setLoginRole('patient')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${loginRole === 'patient' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}
          >
            <UserCircle size={14} /> Patient
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
            <AlertCircle size={16} />
            <p>{error}</p>
          </div>
        )}

        {/* Primary Google Auth */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all text-xs uppercase tracking-widest shadow-lg mb-6 disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          {loading ? 'Authenticating...' : 'Sign in with Google'}
        </button>

        <div className="relative flex items-center py-4 mb-6">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Or use email</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Fallback Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">Portal Identifier</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-600 transition-all text-sm" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-600 transition-all text-sm" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Suite'}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

