
import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (email: string, pass: string) => { success: boolean, message?: string };
  onRegister: (name: string, email: string, pass: string) => { success: boolean, message?: string };
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onRegister, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [showAdminHint, setShowAdminHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = isRegister 
      ? onRegister(name, email, pass)
      : onLogin(email, pass);

    if (!result.success) {
      setError(result.message || (isRegister ? 'Registration failed' : 'Login failed'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] w-full max-w-md rounded-2xl p-8 border border-white/5 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <i className="fa-brands fa-youtube text-red-600 text-5xl"></i>
          <h2 className="text-2xl font-bold">{isRegister ? 'Create your account' : 'Sign in to Nexus'}</h2>
          <p className="text-white/40 text-sm">
            {isRegister ? 'Join the creator community today' : 'Use your email and password to continue'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6 flex items-center gap-3">
            <i className="fa-solid fa-circle-info"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-1 ml-1">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase mb-1 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="e.g. shams@gmail.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase mb-1 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4 hover:bg-white/90 transition-colors shadow-lg shadow-white/5"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
          
          {!isRegister && (
            <div className="mt-6">
                <button 
                    onClick={() => setShowAdminHint(!showAdminHint)}
                    className="text-[10px] text-white/10 hover:text-white/20 uppercase tracking-widest font-bold"
                >
                    {showAdminHint ? 'Hide System Hint' : 'Show System Hint'}
                </button>
                {showAdminHint && (
                    <p className="text-white/20 text-[10px] mt-2 uppercase tracking-widest font-bold animate-in fade-in slide-in-from-top-1">
                        Admin: shams@gmail.com / 1234567
                    </p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
