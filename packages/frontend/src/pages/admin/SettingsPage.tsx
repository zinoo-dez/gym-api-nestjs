import { useState, useEffect } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import { PrimaryButton } from "@/components/gym";
import { ColorPreview } from "@/components/ColorPreview";
import {
  Building,
  Bell,
  Palette,
  Save,
  Loader2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { gymSettingsService, type GymSettings } from "@/services";
import { useGymSettingsStore } from "@/store/gym-settings.store";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const { settings, isLoading } = useGymSettingsStore();
  const updateStoreSettings = useGymSettingsStore(
    (state) => state.updateSettings,
  );
  const [formData, setFormData] = useState<Partial<GymSettings>>({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (field: keyof GymSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Only send updatable fields, exclude readonly fields
      const { id, createdAt, updatedAt, ...updateData } =
        formData as GymSettings;

      const updated = await gymSettingsService.updateSettings(updateData);
      setFormData(updated);
      updateStoreSettings(updated); // Update global store
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: Building },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your gym settings and preferences
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full shrink-0 lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Gym Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Basic information about your gym
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="gymName"
                        className="block text-sm font-medium text-foreground"
                      >
                        Gym Name
                      </label>
                      <input
                        id="gymName"
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="tagline"
                        className="block text-sm font-medium text-foreground"
                      >
                        Tagline
                      </label>
                      <input
                        id="tagline"
                        type="text"
                        value={formData.tagLine || ""}
                        onChange={(e) =>
                          handleInputChange("tagLine", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-foreground"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        value={formData.description || ""}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Contact Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    How members can reach you
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="email"
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <Phone className="h-4 w-4" />
                        Phone
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address"
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <MapPin className="h-4 w-4" />
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={formData.address || ""}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure email notification preferences
                  </p>

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        id: "newMemberNotification",
                        label: "New member registration",
                        description: "Receive email when a new member signs up",
                      },
                      {
                        id: "newPaymentNotification",
                        label: "Payment notifications",
                        description:
                          "Receive alerts for successful and failed payments",
                      },
                      {
                        id: "newMembershipNotification",
                        label: "Membership expiry alerts",
                        description:
                          "Get notified before member subscriptions expire",
                      },
                      {
                        id: "newSessionNotification",
                        label: "Training session notifications",
                        description:
                          "Get notified when training sessions are scheduled",
                      },
                      {
                        id: "newAttendanceNotification",
                        label: "Attendance notifications",
                        description: "Receive alerts for member check-ins",
                      },
                      {
                        id: "newTrainerNotification",
                        label: "New trainer notifications",
                        description: "Get notified when new trainers join",
                      },
                      {
                        id: "newWorkoutPlanNotification",
                        label: "Workout plan notifications",
                        description: "Receive alerts for new workout plans",
                      },
                      {
                        id: "newProgressNotification",
                        label: "Progress tracking notifications",
                        description:
                          "Get notified about member progress updates",
                      },
                    ].map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start justify-between border-b border-border pb-4 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {notification.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={
                              (formData[
                                notification.id as keyof GymSettings
                              ] as boolean) || false
                            }
                            onChange={(e) =>
                              handleInputChange(
                                notification.id as keyof GymSettings,
                                e.target.checked,
                              )
                            }
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-foreground after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Brand Colors
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize your gym's brand appearance
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="primaryColor"
                        className="block text-sm font-medium text-foreground"
                      >
                        Primary Color
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id="primaryColor"
                          type="color"
                          value={formData.primaryColor || "#22c55e"}
                          onChange={(e) =>
                            handleInputChange("primaryColor", e.target.value)
                          }
                          className="h-10 w-10 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor || "#22c55e"}
                          onChange={(e) =>
                            handleInputChange("primaryColor", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="secondaryColor"
                        className="block text-sm font-medium text-foreground"
                      >
                        Secondary Color
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id="secondaryColor"
                          type="color"
                          value={formData.secondaryColor || "#4ade80"}
                          onChange={(e) =>
                            handleInputChange("secondaryColor", e.target.value)
                          }
                          className="h-10 w-10 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          value={formData.secondaryColor || "#4ade80"}
                          onChange={(e) =>
                            handleInputChange("secondaryColor", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Logo & Branding
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your gym's logo and favicon
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="logo"
                        className="block text-sm font-medium text-foreground"
                      >
                        Logo URL
                      </label>
                      <input
                        id="logo"
                        type="text"
                        value={formData.logo || ""}
                        onChange={(e) =>
                          handleInputChange("logo", e.target.value)
                        }
                        placeholder="/logo.png"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="favicon"
                        className="block text-sm font-medium text-foreground"
                      >
                        Favicon URL
                      </label>
                      <input
                        id="favicon"
                        type="text"
                        value={formData.favicon || ""}
                        onChange={(e) =>
                          handleInputChange("favicon", e.target.value)
                        }
                        placeholder="/favicon.ico"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Color Preview
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    See how your colors look in action
                  </p>
                  <ColorPreview />
                </div>

                <div className="flex justify-end">
                  <PrimaryButton onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Appearance
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
