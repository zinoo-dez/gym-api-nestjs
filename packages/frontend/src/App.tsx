import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import { useAuthStore } from "./store/auth.store";
import { useGymSettingsStore } from "./store/gym-settings.store";

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const fetchSettings = useGymSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    initAuth();
    fetchSettings();
  }, [initAuth, fetchSettings]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
