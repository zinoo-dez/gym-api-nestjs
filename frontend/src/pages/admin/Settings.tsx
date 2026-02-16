import { useEffect, useState } from "react";
import { useGymSettingsStore } from "@/store/gym-settings.store";
import { gymSettingsService, type GymSettings } from "@/services/gym-settings.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleDateTimePicker } from "@/components/ui/google-date-time-picker";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
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
    <div className="space-y-4">
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Gym Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Manage your gym's public profile, operating schedule, and global notification preferences.
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving || isLoading}
            className="bg-primary hover:bg-primary/90 h-10 px-6 font-semibold shadow-lg shadow-primary/10"
          >
            {saving ? "Saving Changes..." : "Save All Settings"}
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Profile Card */}
        <section className="lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="m3-title-md">Public Profile</h2>
            <p className="text-xs text-muted-foreground">This information will be visible to members on the mobile app and public portal.</p>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="m3-label">Gym Name</Label>
                <Input
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600"
                  placeholder="e.g. Iron Forge Gym"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="m3-label">Brand Tagline</Label>
                <Input
                  value={form.tagLine || ""}
                  onChange={(e) => setForm({ ...form, tagLine: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600"
                  placeholder="e.g. Strength through community"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="m3-label">Support Email</Label>
                <Input
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600"
                  placeholder="support@gym.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="m3-label">Contact Phone</Label>
                <Input
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="m3-label">Physical Address</Label>
              <Input
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600"
                placeholder="123 Fitness St, Muscle City"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="m3-label">Brand Assets (URLs)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={form.logo || ""}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  placeholder="Logo URL"
                  className="h-11 rounded-xl border-gray-200 text-xs"
                />
                <Input
                  value={form.favicon || ""}
                  onChange={(e) => setForm({ ...form, favicon: e.target.value })}
                  placeholder="Favicon URL"
                  className="h-11 rounded-xl border-gray-200 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="m3-label">About the Gym</Label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="min-h-[120px] rounded-xl border-gray-200 focus-visible:ring-blue-600 py-3"
                placeholder="Write a brief overview of your gym's mission and facilities..."
              />
            </div>
          </div>
        </section>

        {/* Side Panel: Notifications & Alerts */}
        <section className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="m3-title-md">System Alerts</h2>
              <p className="text-xs text-muted-foreground">Configure global triggers for admin staff.</p>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-primary">Email Hub</span>
                  <span className="m3-label !text-primary/70 !text-[9px]">Global Master Switch</span>
                </div>
                <Checkbox
                  checked={form.emailNotification ?? false}
                  onCheckedChange={(value) => setForm({ ...form, emailNotification: Boolean(value) })}
                  className="h-5 w-5 rounded-md border-blue-300"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-emerald-700">SMS Gateway</span>
                  <span className="m3-label !text-emerald-600/70 !text-[9px]">Mobile Alerts</span>
                </div>
                <Checkbox
                  checked={form.smsNotification ?? false}
                  onCheckedChange={(value) => setForm({ ...form, smsNotification: Boolean(value) })}
                  className="h-5 w-5 rounded-md border-emerald-300"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Event Notifications</p>
                <div className="space-y-3">
                  {[
                    ["newMemberNotification", "New Member Signup"],
                    ["newTrainerNotification", "Staff Onboarding"],
                    ["newMembershipNotification", "Subscription Changes"],
                    ["newPaymentNotification", "Financial Transactions"],
                    ["newSessionNotification", "Booking Requests"],
                    ["newAttendanceNotification", "Check-in Events"],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between group">
                      <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
                      <Checkbox
                        checked={Boolean((form as any)[key])}
                        onCheckedChange={(value) => setForm({ ...form, [key]: Boolean(value) } as any)}
                        className="rounded-md border-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Operating Hours */}
        <section className="lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="m3-title-md">Standard Schedule</h2>
              <p className="text-xs text-muted-foreground">Define weekly check-in availability and staff hours.</p>
            </div>
            <Button variant="outline" onClick={saveOperatingHours} className="h-9 rounded-xl border-border px-4 font-semibold text-xs">
              Update Schedule
            </Button>
          </div>
          <div className="space-y-3">
            {hours.map((h, idx) => (
              <div key={h.dayOfWeek} className={cn(
                "flex flex-wrap items-center gap-4 p-3 rounded-2xl transition-all",
                h.isClosed ? "bg-gray-50 border border-dashed border-gray-200 grayscale" : "bg-white border border-gray-100 shadow-sm"
              )}>
                <div className="w-24 text-sm font-bold text-gray-900">{days[idx]}</div>
                <div className="flex-1 flex gap-2 items-center">
                  <div className="relative group">
                    <TimePicker
                      value={h.openTime}
                      disabled={h.isClosed}
                      onChange={(value) => {
                        const next = [...hours];
                        next[idx] = { ...next[idx], openTime: value };
                        setHours(next);
                      }}
                      className="h-9 w-28 rounded-lg border-gray-200 text-xs font-semibold"
                    />
                  </div>
                  <span className="text-gray-300">→</span>
                  <div className="relative group">
                    <TimePicker
                      value={h.closeTime}
                      disabled={h.isClosed}
                      durationFromValue={h.openTime}
                      showDurationLabels
                      onChange={(value) => {
                        const next = [...hours];
                        next[idx] = { ...next[idx], closeTime: value };
                        setHours(next);
                      }}
                      className="h-9 w-28 rounded-lg border-gray-200 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-blue-200 transition-all cursor-pointer">
                  <Checkbox
                    checked={h.isClosed}
                    onCheckedChange={(value) => {
                      const next = [...hours];
                      next[idx] = { ...next[idx], isClosed: Boolean(value) };
                      setHours(next);
                    }}
                    className="rounded-md border-gray-300"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-gray-500">CLOSED</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Seasonal Closures */}
        <section className="lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="m3-title-md">Staff Holidays</h2>
            <p className="text-xs text-muted-foreground">Plan facility closures and temporary schedule changes.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Effective Date</Label>
              <GoogleDateTimePicker
                value={newClosure.date}
                onChange={(value) => setNewClosure({ ...newClosure, date: value })}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</Label>
              <Input
                value={newClosure.reason}
                onChange={(e) => setNewClosure({ ...newClosure, reason: e.target.value })}
                className="h-10 rounded-xl border-gray-200 text-xs"
                placeholder="e.g. New Year's Day"
              />
            </div>
            <Button variant="outline" onClick={addClosure} className="w-full h-10 rounded-xl border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white font-bold transition-all">
              Schedule Holiday
            </Button>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Planned Closures</p>
              {closures.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-[11px] text-gray-400 font-medium">No holidays scheduled.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {closures.map((c) => (
                    <div key={c.id} className="group flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-gray-900">{new Date(c.date).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{c.reason || "General Closure"}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeClosure(c.id)}
                        className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
