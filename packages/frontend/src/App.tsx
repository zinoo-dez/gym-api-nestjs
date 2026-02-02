import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppRoutes from './routes/AppRoutes';
import { useAuthStore } from './store/auth.store';

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
