import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
}

const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { theme } = useAppStore();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait a few seconds before showing so it isn't too aggressive on load
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Optionally save to localStorage to not annoy the user again for a week
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: '90%',
      maxWidth: 400,
      background: theme === 'dark' ? 'rgba(30,27,75,0.95)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      border: `1.5px solid ${theme === 'dark' ? 'rgba(139,92,246,0.5)' : 'rgba(124,58,237,0.3)'}`,
      borderRadius: 'var(--r-xl)',
      padding: '16px 20px',
      boxShadow: theme === 'dark' ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(124,58,237,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      animation: 'slideUp 0.4s var(--ease-spring) both'
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', flexShrink: 0
      }}>
        ⚔️
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontWeight: 900, fontSize: '0.95rem', fontFamily: 'Nunito, sans-serif' }}>
          Install Class Quest
        </h4>
        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Add to your home screen for the full, fullscreen adventure!
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className="btn btn-sm" style={{ background: '#7C3AED', color: '#fff', border: 'none', fontWeight: 800 }} onClick={handleInstallClick}>
          Install
        </button>
        <button className="btn btn-ghost btn-icon btn-sm" style={{ alignSelf: 'center', padding: 4 }} onClick={handleClose}>
          <X size={14}/>
        </button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
