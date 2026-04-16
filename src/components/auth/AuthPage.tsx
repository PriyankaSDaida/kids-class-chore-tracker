import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { KeyRound, Mail, ArrowRight, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '../ui/Toast';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorDesc, setErrorDesc] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      showToast('Offline Mode: Authentication is not available', 'error');
      return;
    }
    
    setLoading(true);
    setErrorDesc('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast('Successfully signed in!', 'success');
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && data.user.identities && data.user.identities.length === 0) {
           throw new Error('An account with this email already exists.');
        }
        showToast('Account created successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      setErrorDesc(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ background: 'var(--surface-color)', padding: '16px', borderRadius: '50%', display: 'inline-flex', marginBottom: '16px' }}>
          {isLogin ? <LogIn size={32} color="var(--primary)" /> : <UserPlus size={32} color="var(--primary)" />}
        </div>
        
        <h1 style={{ fontSize: '1.8rem', fontFamily: 'Nunito, sans-serif', color: 'var(--text-primary)', marginBottom: '8px' }}>
          {isLogin ? 'Welcome Back!' : 'Create an Account'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          {isLogin 
            ? "Sign in to sync your family's progress across all your devices." 
            : "Sign up to safely back up and sync your data everywhere!"}
        </p>

        {errorDesc && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid var(--red)',
            padding: '12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            color: 'var(--red)',
            textAlign: 'left',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={20} />
            {errorDesc}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
              <Mail size={16} /> Email Address
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="you@family.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
              <KeyRound size={16} /> Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button 
            type="button" 
            className="btn btn-ghost" 
            style={{ marginTop: '8px' }}
            onClick={() => { setIsLogin(!isLogin); setErrorDesc(''); }}
          >
            {isLogin ? 'Create one now' : 'Sign in instead'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
