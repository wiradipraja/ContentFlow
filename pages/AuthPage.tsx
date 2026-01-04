import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeUser } from '../services/dbService';
import { Zap, Loader2, ArrowRight, Lock, Mail, Github } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Initialize Firestore doc for new user
        await initializeUser(userCredential.user.uid, userCredential.user.email || '');
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed.";
      if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
      if (err.code === 'auth/email-already-in-use') msg = "Email already registered.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-dark-950 bg-mesh-dark bg-cover flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20 mb-4">
            <Zap size={32} className="text-black" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Content<span className="text-brand-400">Flow</span></h1>
          <p className="text-gray-400 mt-2">The AI Automation Operating System</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500"></div>
          
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Welcome Back, Creator' : 'Initialize New Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-dark-900/50 border border-dark-600 rounded-xl py-3 pl-11 pr-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900/50 border border-dark-600 rounded-xl py-3 pl-11 pr-4 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isLogin ? 'Enter System' : 'Create Account'} <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 w-full">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-xs text-gray-500">OR</span>
                <div className="h-px bg-white/10 flex-1"></div>
             </div>
             
             {/* Mock Social Login - Would require more Firebase setup */}
             <button disabled className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all cursor-not-allowed opacity-50">
               <Github size={18} /> Continue with GitHub (Coming Soon)
             </button>

             <p className="text-sm text-gray-400">
               {isLogin ? "Don't have an account? " : "Already have an account? "}
               <button 
                 onClick={() => { setIsLogin(!isLogin); setError(''); }}
                 className="text-brand-400 hover:text-brand-300 font-bold underline decoration-brand-500/30 underline-offset-4"
               >
                 {isLogin ? 'Register' : 'Login'}
               </button>
             </p>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center text-[10px] text-gray-600">
          <p>By connecting, you agree to ContentFlow's Terms of Service.</p>
          <p className="mt-1">Secured by Firebase & Google Cloud Identity.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;