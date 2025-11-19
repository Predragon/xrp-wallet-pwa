import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('installPromptDismissed');
    const dismissedDate = localStorage.getItem('installPromptDismissedDate');
    
    if (dismissed && dismissedDate) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show if dismissed within last 7 days
      }
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    localStorage.setItem('installPromptDismissedDate', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-slide-up">
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl shadow-2xl p-6 border-2 border-amber-300/50 backdrop-blur-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-3xl">🐻</span>
          </div>
          
          <div className="flex-1 text-white">
            <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              Install Prudent Bear
            </h3>
            <p className="text-white/90 text-sm mb-4">
              Install our app for quick access to your XRP wallets:
            </p>
            
            <ul className="text-xs text-white/80 space-y-1 mb-4">
              <li>• 🚀 Instant access from home screen</li>
              <li>• 📱 Works offline</li>
              <li>• 🔒 Secure & private</li>
              <li>• ⚡ Lightning fast</li>
            </ul>

            <button
              onClick={handleInstall}
              className="w-full bg-white text-amber-600 hover:bg-amber-50 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
