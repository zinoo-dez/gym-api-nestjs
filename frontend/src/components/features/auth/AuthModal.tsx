import * as React from "react";
import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/animate-ui/components/radix/dialog";
import { X } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

// Responsive hook roughly checking for desktop (>768px)
function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        const listener = () => setMatches(media.matches);
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, [matches, query]);
    return matches;
}

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Min 8 chars"),
});

interface AuthModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialView?: "login" | "register";
}

export function AuthModal({ isOpen, onOpenChange, initialView = "login" }: AuthModalProps) {
    const [view, setView] = useState<"login" | "register">(initialView);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Sync internal view with prop when opened
    useEffect(() => {
        if (isOpen) setView(initialView);
    }, [isOpen, initialView]);

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [apiError, setApiError] = useState<string | null>(null);

    const loginForm = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
    const registerForm = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });

    const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
        try {
            setApiError(null);
            const res = await authService.login(data);
            setAuth(res.user, res.accessToken);
            onOpenChange(false);
            navigate("/");
        } catch (err: any) {
            setApiError(err.response?.data?.message || "Login failed.");
        }
    };

    const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
        try {
            setApiError(null);
            const res = await authService.register({ ...data, role: "MEMBER" });
            setAuth(res.user, res.accessToken);
            onOpenChange(false);
            navigate("/");
        } catch (err: any) {
            setApiError(err.response?.data?.message || "Registration failed.");
        }
    };

    const AuthContent = () => (
        <div className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">
                    {view === "login" ? "Welcome Back" : "Start Your Journey"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    {view === "login"
                        ? "Sign in to track your progress and manage your membership."
                        : "Create an account to unlock all features."}
                </p>
            </div>

            {apiError && (
                <div className="rounded-md bg-danger/10 p-3 text-sm font-medium text-destructive text-center animate-in fade-in">
                    {apiError}
                </div>
            )}

            {view === "login" ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input {...loginForm.register("email")} placeholder="you@example.com" hasError={!!loginForm.formState.errors.email} />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" {...loginForm.register("password")} hasError={!!loginForm.formState.errors.password} />
                    </div>
                    <button
                        type="button"
                        className="text-sm font-medium text-primary hover:underline"
                        onClick={() => {
                            onOpenChange(false);
                            navigate("/forgot-password");
                        }}
                    >
                        Forgot password?
                    </button>
                    <Button type="submit" className="w-full h-12 mt-2" disabled={loginForm.formState.isSubmitting}>
                        {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            ) : (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input {...registerForm.register("firstName")} hasError={!!registerForm.formState.errors.firstName} />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input {...registerForm.register("lastName")} hasError={!!registerForm.formState.errors.lastName} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input {...registerForm.register("email")} placeholder="you@example.com" hasError={!!registerForm.formState.errors.email} />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" {...registerForm.register("password")} hasError={!!registerForm.formState.errors.password} />
                    </div>
                    <Button type="submit" className="w-full h-12 mt-2" disabled={registerForm.formState.isSubmitting}>
                        {registerForm.formState.isSubmitting ? "Creating account..." : "Join Now"}
                    </Button>
                </form>
            )}

            <div className="mt-2 text-center text-sm">
                {view === "login" ? (
                    <>
                        Don&apos;t have an account?{" "}
                        <button type="button" onClick={() => { setView("register"); setApiError(null); }} className="font-medium text-primary hover:underline">
                            Create one
                        </button>
                    </>
                ) : (
                    <>
                        Already a member?{" "}
                        <button type="button" onClick={() => { setView("login"); setApiError(null); }} className="font-medium text-primary hover:underline">
                            Sign in
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md sm:rounded-2xl" showCloseButton={false}>
                    <DialogTitle className="sr-only">
                        {view === "login" ? "Sign In" : "Register"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {view === "login"
                            ? "Sign in to your account"
                            : "Create a new account"}
                    </DialogDescription>
                    <AuthContent />
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/80" />
                <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-2xl border bg-background">
                    <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
                    <AuthContent />
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
