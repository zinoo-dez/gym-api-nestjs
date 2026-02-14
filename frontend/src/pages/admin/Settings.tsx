import { useEffect, useState } from "react";
import { useGymSettingsStore } from "@/store/gym-settings.store";
import { gymSettingsService, type GymSettings } from "@/services/gym-settings.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Settings() {
  const {
    settings,
    operatingHours,
    closures,
    isLoading,
    fetchSettings,
    fetchOperatingHours,
    fetchClosures,
    updateSettings,
  } = useGymSettingsStore();

  const [form, setForm] = useState<Partial<GymSettings>>({});
  const [hours, setHours] = useState(
    Array.from({ length: 7 }).map((_, idx) => ({
      dayOfWeek: idx,
      openTime: "06:00",
      closeTime: "22:00",
      isClosed: false,
    })),
  );
  const [newClosure, setNewClosure] = useState({ date: "", reason: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchOperatingHours();
    fetchClosures();
  }, [fetchSettings, fetchOperatingHours, fetchClosures]);

  useEffect(() => {
    if (settings) {
      setForm({
        ...settings,
      });
    }
  }, [settings]);

  useEffect(() => {
    if (operatingHours?.length) {
      const normalized = Array.from({ length: 7 }).map((_, idx) => {
        const row = operatingHours.find((h) => h.dayOfWeek === idx);
        return row
          ? {
              dayOfWeek: row.dayOfWeek,
              openTime: row.openTime,
              closeTime: row.closeTime,
              isClosed: row.isClosed,
            }
          : {
              dayOfWeek: idx,
              openTime: "06:00",
              closeTime: "22:00",
              isClosed: false,
            };
      });
      setHours(normalized);
    }
  }, [operatingHours]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        tagLine: form.tagLine,
        address: form.address,
        phone: form.phone,
        email: form.email,
        logo: form.logo,
        description: form.description,
        favicon: form.favicon,
        emailNotification: form.emailNotification,
        smsNotification: form.smsNotification,
        newMemberNotification: form.newMemberNotification,
        newTrainerNotification: form.newTrainerNotification,
        newMembershipNotification: form.newMembershipNotification,
        newPaymentNotification: form.newPaymentNotification,
        newSessionNotification: form.newSessionNotification,
        newWorkoutPlanNotification: form.newWorkoutPlanNotification,
        newProgressNotification: form.newProgressNotification,
        newAttendanceNotification: form.newAttendanceNotification,
        newEquipmentNotification: form.newEquipmentNotification,
        newGymSettingNotification: form.newGymSettingNotification,
        newUserSettingNotification: form.newUserSettingNotification,
      };
      const updated = await gymSettingsService.updateSettings(payload);
      updateSettings(updated);
      toast.success("Settings updated");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save settings.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const saveOperatingHours = async () => {
    try {
      setSaving(true);
      await Promise.all(
        hours.map((h) =>
          gymSettingsService.updateOperatingHours({
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          }),
        ),
      );
      await fetchOperatingHours();
      toast.success("Operating hours updated");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update hours.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addClosure = async () => {
    if (!newClosure.date) {
      toast.error("Closure date is required.");
      return;
    }
    try {
      setSaving(true);
      await gymSettingsService.createClosure(newClosure);
      setNewClosure({ date: "", reason: "" });
      await fetchClosures();
      toast.success("Closure added");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to add closure.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const removeClosure = async (id: string) => {
    try {
      setSaving(true);
      await gymSettingsService.deleteClosure(id);
      await fetchClosures();
      toast.success("Closure removed");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to remove closure.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 px-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Gym profile and appearance settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gym Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={form.tagLine || ""}
                onChange={(e) => setForm({ ...form, tagLine: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                value={form.logo || ""}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input
                value={form.favicon || ""}
                onChange={(e) => setForm({ ...form, favicon: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description (Rich Text)</Label>
            <Textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.emailNotification ?? false}
              onCheckedChange={(value) =>
                setForm({ ...form, emailNotification: Boolean(value) })
              }
            />
            <span className="text-sm">Email notifications enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.smsNotification ?? false}
              onCheckedChange={(value) =>
                setForm({ ...form, smsNotification: Boolean(value) })
              }
            />
            <span className="text-sm">SMS notifications enabled</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["newMemberNotification", "New member"],
              ["newTrainerNotification", "New trainer"],
              ["newMembershipNotification", "New membership"],
              ["newPaymentNotification", "New payment"],
              ["newSessionNotification", "New session"],
              ["newWorkoutPlanNotification", "New workout plan"],
              ["newProgressNotification", "New progress"],
              ["newAttendanceNotification", "New attendance"],
              ["newEquipmentNotification", "New equipment"],
              ["newGymSettingNotification", "Gym setting updates"],
              ["newUserSettingNotification", "User setting updates"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  checked={Boolean((form as any)[key])}
                  onCheckedChange={(value) =>
                    setForm({ ...form, [key]: Boolean(value) } as any)
                  }
                />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hours.map((h, idx) => (
            <div key={h.dayOfWeek} className="grid grid-cols-4 gap-4 items-center">
              <div className="text-sm font-medium">{days[idx]}</div>
              <Input
                type="time"
                value={h.openTime}
                disabled={h.isClosed}
                onChange={(e) => {
                  const next = [...hours];
                  next[idx] = { ...next[idx], openTime: e.target.value };
                  setHours(next);
                }}
              />
              <Input
                type="time"
                value={h.closeTime}
                disabled={h.isClosed}
                onChange={(e) => {
                  const next = [...hours];
                  next[idx] = { ...next[idx], closeTime: e.target.value };
                  setHours(next);
                }}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={h.isClosed}
                  onCheckedChange={(value) => {
                    const next = [...hours];
                    next[idx] = { ...next[idx], isClosed: Boolean(value) };
                    setHours(next);
                  }}
                />
                <span className="text-sm">Closed</span>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={saveOperatingHours}>
            Save Operating Hours
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Closures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={newClosure.date}
                onChange={(e) =>
                  setNewClosure({ ...newClosure, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Reason</Label>
              <Input
                value={newClosure.reason}
                onChange={(e) =>
                  setNewClosure({ ...newClosure, reason: e.target.value })
                }
              />
            </div>
          </div>
          <Button variant="outline" onClick={addClosure}>
            Add Closure
          </Button>
          {closures.length === 0 ? (
            <p className="text-sm text-muted-foreground">No closures</p>
          ) : (
            <div className="space-y-2">
              {closures.map((c) => (
                <div key={c.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">{c.date}</p>
                    <p className="text-xs text-muted-foreground">{c.reason || "—"}</p>
                  </div>
                  <Button variant="outline" onClick={() => removeClosure(c.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || isLoading}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
