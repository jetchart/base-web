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
  const [users, setUsers] = useState<any[]>([]);

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

  // Fetch users when logged in
  useEffect(() => {
    if (userCredential && userCredential.token) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${userCredential.token}`
        }
      })
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(() => setUsers([]));
    } else {
      setUsers([]);
    }
  }, [userCredential]);

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
      // Ensure token is present in userCredential for /users fetch
      if (data && (data.token || data.accessToken)) {
        const userData = {
          ...data,
          token: data.token || data.accessToken
        };
        setUserCredential(userData);
        localStorage.setItem('userCredential', JSON.stringify(userData));
      }
      console.log('Login backend response:', data);
    } catch (error) {
      console.error('Error enviando token al backend:', error);
    }
  };

  function handleLogout(): void {
    setUserCredential(null);
    localStorage.removeItem('userCredential');
    setUsers([]);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 p-2 sm:p-6">
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
      {/* Users table */}
      {userCredential && users.length > 0 && (
        <div className="max-w-2xl mx-auto mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                      {Object.keys(users[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left font-medium text-neutral-700 dark:text-neutral-200">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={idx} className="border-b border-neutral-100 dark:border-neutral-800">
                        {Object.values(user).map((value, i) => (
                          <td key={i} className="px-3 py-2 text-neutral-700 dark:text-neutral-300">{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default App
