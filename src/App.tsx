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
  <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-neutral-950">
      <Card className="w-full max-w-sm mx-auto mt-8 border-none shadow-none bg-transparent p-0">
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
  );
}

export default App
