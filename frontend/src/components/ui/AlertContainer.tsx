import React from "react";
import { AnimatePresence } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import { Alert } from "./Alert";

export const AlertContainer: React.FC = () => {
  const { alerts, hideAlert } = useAlert();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm sm:w-auto">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <Alert
              message={alert.message}
              type={alert.type}
              duration={alert.duration}
              onClose={() => hideAlert(alert.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
