import React, { createContext, useContext, useState, useCallback } from "react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertData {
  id: string;
  message: string;
  type: AlertType;
  duration?: number;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, duration?: number) => void;
  hideAlert: (id: string) => void;
  alerts: AlertData[];
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const hideAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback(
    (message: string, type: AlertType = "info", duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newAlert: AlertData = { id, message, type, duration };
      
      setAlerts((prev) => [...prev, newAlert]);

      if (duration !== Infinity) {
        setTimeout(() => {
          hideAlert(id);
        }, duration);
      }
    },
    [hideAlert]
  );

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, alerts }}>
      {children}
    </AlertContext.Provider>
  );
};
