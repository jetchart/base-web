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
  const [races, setRaces] = useState<any[]>([]);

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

  // Fetch users and races when logged in
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

      fetch(`${import.meta.env.VITE_BACKEND_URL}/races`, {
        headers: {
          'Authorization': `Bearer ${userCredential.token}`
        }
      })
        .then(res => res.json())
        .then(data => setRaces(data))
        .catch(() => setRaces([]));
    } else {
      setUsers([]);
      setRaces([]);
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

      {/* Races cards */}
      {userCredential && (
        <div className="max-w-6xl mx-auto mt-10">
          <h2 className="text-xl font-bold mb-4 text-neutral-800 dark:text-neutral-200">Próximas Carreras</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {races.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No hay carreras disponibles.</div>
            )}
            {races.map((race: any) => {
              // Usar imageUrl directamente
              const imgSrc = race.imageUrl || '';
              // Format date
              const startDate = new Date(race.startDate);
              const dateStr = startDate.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
              // Distances
              const distances = (race.distances || []).map((d: any) => d.distance.shortDescription).join(' - ');
              return (
                <Card key={race.id} className="flex flex-col h-full shadow-md border rounded-lg overflow-hidden">
                  {imgSrc && (
                    <img src={imgSrc} alt={race.name} className="h-36 w-full object-cover" />
                  )}
                  <CardContent className="flex-1 flex flex-col justify-between p-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{dateStr}</div>
                      <div className="font-bold text-base mb-1 leading-tight">{race.name}</div>
                      <div className="text-sm text-gray-700 mb-2 font-medium">{distances}</div>
                      <div className="text-xs text-gray-500 mb-2">{race.city}, {race.country}</div>
                      <div className="text-xs text-gray-600 mb-2">{race.description}</div>
                    </div>
                    <div className="mt-auto flex justify-end">
                      {race.website && (
                        <a href={race.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline text-sm">Ver más</a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App
