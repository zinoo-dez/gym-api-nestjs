import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { Dumbbell } from "lucide-react";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [gym, setGym] = useState({
    name: "GymPro Fitness Center",
    address: "123 Fitness Street, Muscle City, MC 12345",
    phone: "+1 800-GYM-PROS",
    email: "info@gympro.com",
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Manage your gym preferences</p></div>

      <Card>
        <CardHeader><CardTitle>Gym Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-bold text-lg">{gym.name}</p>
              <p className="text-sm text-muted-foreground">Manage your gym details</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Gym Name</Label><Input value={gym.name} onChange={(e) => setGym({ ...gym, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={gym.phone} onChange={(e) => setGym({ ...gym, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={gym.email} onChange={(e) => setGym({ ...gym, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Address</Label><Input value={gym.address} onChange={(e) => setGym({ ...gym, address: e.target.value })} /></div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle between dark and light themes</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
