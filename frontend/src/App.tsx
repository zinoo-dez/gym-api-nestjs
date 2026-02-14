import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MotionConfig } from "framer-motion";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import AppRoutes from "@/routes/AppRoutes";

import "@/styles/App.css";

const queryClient = new QueryClient();

const App = () => {
    const initAuth = useAuthStore((state) => state.initAuth);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <MotionConfig reducedMotion="user">
                        <BrowserRouter>
                            <AppRoutes />
                        </BrowserRouter>
                    </MotionConfig>
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
