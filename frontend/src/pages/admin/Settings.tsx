import { useGymSettings } from "@/hooks/use-gym-settings";

export default function Settings() {
  const {
    gymName,
    email,
    phone,
    address,
    primaryColor,
    secondaryColor,
    backgroundColor,
    textColor,
  } = useGymSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Gym profile and appearance settings
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Gym Profile</h2>
        <div className="text-sm text-muted-foreground">Name: {gymName}</div>
        <div className="text-sm text-muted-foreground">Email: {email || "—"}</div>
        <div className="text-sm text-muted-foreground">Phone: {phone || "—"}</div>
        <div className="text-sm text-muted-foreground">Address: {address || "—"}</div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <div className="text-sm text-muted-foreground">
          Primary: {primaryColor || "—"}
        </div>
        <div className="text-sm text-muted-foreground">
          Secondary: {secondaryColor || "—"}
        </div>
        <div className="text-sm text-muted-foreground">
          Background: {backgroundColor || "—"}
        </div>
        <div className="text-sm text-muted-foreground">
          Text: {textColor || "—"}
        </div>
      </div>
    </div>
  );
}
