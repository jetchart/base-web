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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';

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
    <div className="min-h-screen bg-white dark:bg-neutral-950 p-2 sm:p-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-2xl mx-auto mb-4 sm:mb-6 gap-2 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">Upcoming races</h2>
        <button className="flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition">
          View calendar <span className="text-lg">&gt;</span>
        </button>
      </div>

      {/* Card section */}
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="h-32 sm:h-40 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800" />
          <div className="flex flex-col sm:flex-row items-end sm:items-end justify-between p-4 sm:p-6 pt-3 sm:pt-4 gap-3 sm:gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Maratón de Mendoza</h3>
              <div className="flex items-center gap-2 sm:gap-3 text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">
                <span className="flex items-center gap-1"><svg xmlns='http://www.w3.org/2000/svg' className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>12 Oct</span>
                <span className="flex items-center gap-1"><svg xmlns='http://www.w3.org/2000/svg' className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657A8 8 0 118 8v8h8a8 8 0 011.657 8z" /></svg>Mendoza</span>
              </div>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white font-medium px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm shadow transition w-full sm:w-auto">See rides</button>
          </div>
        </Card>
      </div>

      {/* Login card (optional, below) */}
      <div className="flex flex-col items-center justify-center mt-12">
        <Card className="w-full max-w-sm mx-auto border-none shadow-none bg-transparent p-0">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-center text-lg font-medium text-neutral-800 dark:text-neutral-200">Welcome</CardTitle>
            {!userCredential && (
              <CardDescription className="text-center text-neutral-500 dark:text-neutral-400">Sign in to continue</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0 flex flex-col items-center">
            {userCredential ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-base text-neutral-700 dark:text-neutral-300">{userCredential.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-sm"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                      console.log("Login Failed");
                    }}
                    theme="outline"
                    shape="rectangular"
                    text="signin_with"
                  />
                </GoogleOAuthProvider>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App
