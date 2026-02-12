import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dumbbell } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("admin@gym.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated && user) {
    const dashboardPath = user.role === "admin" ? "/dashboard" : 
                         user.role === "member" ? `/member/${user.id}` :
                         user.role === "trainer" ? `/trainer/${user.id}` :
                         user.role === "staff" ? `/staff-profile/${user.id}` : "/dashboard";
    navigate(dashboardPath, { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      // The useEffect or the check above will handle redirection after state update
    } else {
      setError("Invalid credentials. Please check the demo accounts below.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Dumbbell className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">GymPro</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
            <div className="mt-4 space-y-1 text-[10px] text-center text-muted-foreground border-t pt-4">
              <p>Admin: admin@gym.com / admin123</p>
              <p>Member: member@gym.com / member123</p>
              <p>Trainer: trainer@gym.com / trainer123</p>
              <p>Staff: staff@gym.com / staff123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
