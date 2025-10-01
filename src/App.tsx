declare global {
  interface ImportMeta {
    env: {
      VITE_BACKEND_URL: any;
      VITE_GOOGLE_CLIENT_ID: string;
    };
  }
}

import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css';
import { Badge } from './components/ui/badge';
import { BadgeCheckIcon } from 'lucide-react';

function App() {
  const [userCredential, setUserCredential] = useState<any | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userCredential');
    if (stored) {
      try {
        setUserCredential(JSON.parse(stored));
      } catch {
        setUserCredential(null);
      }
    }
  }, []);

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data) {
        setUserCredential(data);
        localStorage.setItem('userCredential', JSON.stringify(data));
      }
      console.log('Login backend response:', data);
    } catch (error) {
      console.error('Error enviando token al backend:', error);
    }
  };

  function handleLogout(): void {
    setUserCredential(null);
    localStorage.removeItem('userCredential');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 p-8 shadow-xl backdrop-blur-md transition-all">
          <h1 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-2 tracking-tight">Welcome</h1>
          <p className="text-center text-neutral-500 dark:text-neutral-400 mb-6 text-sm">Sign in to continue</p>
          {userCredential ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 rounded-full px-4 py-2">
                <span className="text-base text-neutral-800 dark:text-neutral-200 font-medium">{userCredential.name}</span>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition text-xs font-semibold shadow-sm border border-neutral-300 dark:border-neutral-700"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => {
                    console.log("Login Failed");
                  }}
                  theme="filled_black"
                  shape="pill"
                  text="continue_with"
                />
              </GoogleOAuthProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App
