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
import { UserCredential } from './auth/user-credential';
import { apiFetch, getJwtExp } from './auth/auth-utils';


function App() {
  const [userCredential, setUserCredential] = useState<UserCredential | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chequea expiración del token al montar
  useEffect(() => {
    const stored = localStorage.getItem('userCredential');
    if (stored) {
      try {
        const parsed: UserCredential = JSON.parse(stored);
        if (parsed.token) {
          const exp = getJwtExp(parsed.token);
          if (exp && exp * 1000 < Date.now()) {
            // Token expirado
            setUserCredential(null);
            localStorage.removeItem('userCredential');
            return;
          }
          setUserCredential({ ...parsed, exp });
        } else {
          setUserCredential(null);
        }
      } catch {
        setUserCredential(null);
      }
    }
  }, []);

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    const token = credentialResponse.credential;
    try {
      const data = await apiFetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/google/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }
      );
      if (data && data.jwt && data.name) {
        const exp = getJwtExp(data.jwt);
        const userData: UserCredential = {
          name: data.name,
          token: data.jwt,
          exp,
        };
        setUserCredential(userData);
        localStorage.setItem('userCredential', JSON.stringify(userData));
      } else {
        throw new Error('Respuesta inesperada del backend');
      }
    } catch (error: any) {
      setError(error.message || 'Error enviando token al backend');
      setUserCredential(null);
    } finally {
      setLoading(false);
    }
  };

  function handleLogout(): void {
    setUserCredential(null);
    localStorage.removeItem('userCredential');
  }

  return (
    <div className="min-h-screen dark:bg-neutral-950 p-2 sm:p-6">
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
                  aria-label="Log out"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                {error && (
                  <div className="mb-2 text-red-500 text-sm text-center w-full">{error}</div>
                )}
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                      setError('Login Failed');
                    }}
                    theme="outline"
                    shape="rectangular"
                    text="signin_with"
                  />
                </GoogleOAuthProvider>
                {loading && (
                  <div className="mt-2 text-neutral-500 text-xs">Cargando...</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
