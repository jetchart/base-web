import { useState, useEffect } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css'
import { Badge } from './components/ui/badge';
import { BadgeCheckIcon } from 'lucide-react';

function App() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  // Función para enviar el token al backend
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    try {
      const response = await fetch('http://localhost:3000/auth/google/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data) {
        setUserName(data.user.name);
        localStorage.setItem('userName', data.user.name);
      }
      console.log('Login backend response:', data);
    } catch (error) {
      console.error('Error enviando token al backend:', error);
    }
  };

  function handleLogout(): void {
    setUserName(null);
    localStorage.removeItem('userName');
  }

  return (
      <div className="card">
        {userName ? (
          <>
          <Badge variant="secondary"
          className="bg-blue-500 text-white dark:bg-blue-600" onClick={handleLogout}>{userName} <BadgeCheckIcon /></Badge>
            </>
        ) : (
          <GoogleOAuthProvider clientId="65738319816-84n4osqr38kdjhqdrr7q0a0id2d56gre.apps.googleusercontent.com">
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
