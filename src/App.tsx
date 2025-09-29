declare global {
  interface ImportMeta {
    env: {
      VITE_BACKEND_URL: any;
      VITE_GOOGLE_CLIENT_ID: string;
    };
  }
}
import { useState, useEffect } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css'
import { Badge } from './components/ui/badge';
import { BadgeCheckIcon } from 'lucide-react';

function App() {
  const [userCredential, setUserCredential] = useState<any | null>(null);

  useEffect(() => {
    const userCredential = localStorage.getItem('userCredential');
    if (userCredential) {
      setUserCredential(userCredential);
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
        localStorage.setItem('userCredential', data);
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
      <div className="card">
        {userCredential ? (
          <>
          <Badge variant="secondary"
          className="bg-blue-500 text-white dark:bg-blue-600" onClick={handleLogout}>{userCredential.name} <BadgeCheckIcon /></Badge>
            </>
        ) : (
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={() => {
            console.log('Login Failed');
          }}
        />
    </GoogleOAuthProvider>
        )}
      </div>
  );
}

export default App
