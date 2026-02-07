import { useState, useEffect } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import { PrimaryButton, RichTextEditor } from "@/components/gym";
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
  LayoutGrid,
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

  const getCssVar = (name: string, fallback: string) => {
    if (typeof window === "undefined") return fallback;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return value || fallback;
  };

  const primaryFallback = getCssVar("--primary", "#22c55e");
  const secondaryFallback = getCssVar("--accent", "#4ade80");
  const backgroundFallback = getCssVar("--background", "#0a0a0a");
  const textFallback = getCssVar("--foreground", "#ffffff");

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (field: keyof GymSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (
    field: "logo" | "favicon",
    file?: File | null,
  ) => {
    if (!file) return;

    const maxBytes = field === "favicon" ? 256 * 1024 : 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(
        `${field === "favicon" ? "Favicon" : "Logo"} is too large. Max ${
          field === "favicon" ? "256KB" : "1MB"
        }.`,
      );
      return;
    }

    try {
      const maxSize = field === "favicon" ? 128 : 512;
      const dataUrl = await resizeImage(file, maxSize);
      handleInputChange(field, dataUrl);
    } catch (error) {
      console.error("Failed to process image:", error);
      toast.error("Failed to process image.");
    }
  };

  const resizeImage = (file: File, maxSize: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(
            1,
            maxSize / Math.max(img.width, img.height),
          );
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/png", 0.92));
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = String(reader.result);
      };
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
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
    { id: "public", label: "Public Content", icon: LayoutGrid },
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
                      <div className="mt-1">
                        <RichTextEditor
                          value={formData.description || ""}
                          onChange={(value) =>
                            handleInputChange("description", value)
                          }
                          placeholder="Describe your gym..."
                          height={140}
                        />
                      </div>
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

            {activeTab === "public" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Homepage Content
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Control hero, section headings, and calls to action across public pages.
                  </p>

                  <div className="mt-6 grid gap-4">
                    <div>
                      <label
                        htmlFor="heroTitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Hero Title
                      </label>
                      <input
                        id="heroTitle"
                        type="text"
                        value={formData.heroTitle || ""}
                        onChange={(e) =>
                          handleInputChange("heroTitle", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="heroSubtitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Hero Subtitle
                      </label>
                      <div className="mt-1">
                        <RichTextEditor
                          value={formData.heroSubtitle || ""}
                          onChange={(value) =>
                            handleInputChange("heroSubtitle", value)
                          }
                          placeholder="Hero subtitle..."
                          height={120}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="heroCtaPrimary"
                          className="block text-sm font-medium text-foreground"
                        >
                          Hero CTA Primary
                        </label>
                        <input
                          id="heroCtaPrimary"
                          type="text"
                          value={formData.heroCtaPrimary || ""}
                          onChange={(e) =>
                            handleInputChange("heroCtaPrimary", e.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="heroCtaSecondary"
                          className="block text-sm font-medium text-foreground"
                        >
                          Hero CTA Secondary
                        </label>
                        <input
                          id="heroCtaSecondary"
                          type="text"
                          value={formData.heroCtaSecondary || ""}
                          onChange={(e) =>
                            handleInputChange("heroCtaSecondary", e.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Section Headings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Titles and subtitles for public pages.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="featuresTitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Features Title
                      </label>
                      <input
                        id="featuresTitle"
                        type="text"
                        value={formData.featuresTitle || ""}
                        onChange={(e) =>
                          handleInputChange("featuresTitle", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="featuresSubtitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Features Subtitle
                      </label>
                      <div className="mt-1">
                        <RichTextEditor
                          value={formData.featuresSubtitle || ""}
                          onChange={(value) =>
                            handleInputChange("featuresSubtitle", value)
                          }
                          placeholder="Features subtitle..."
                          height={110}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="classesTitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Classes Title
                      </label>
                      <input
                        id="classesTitle"
                        type="text"
                        value={formData.classesTitle || ""}
                        onChange={(e) =>
                          handleInputChange("classesTitle", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="classesSubtitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Classes Subtitle
                      </label>
                      <div className="mt-1">
                        <RichTextEditor
                          value={formData.classesSubtitle || ""}
                          onChange={(value) =>
                            handleInputChange("classesSubtitle", value)
                          }
                          placeholder="Classes subtitle..."
                          height={110}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="trainersTitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Trainers Title
                      </label>
                      <input
                        id="trainersTitle"
                        type="text"
                        value={formData.trainersTitle || ""}
                        onChange={(e) =>
                          handleInputChange("trainersTitle", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="trainersSubtitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Trainers Subtitle
                      </label>
                      <div className="mt-1">
                        <RichTextEditor
                          value={formData.trainersSubtitle || ""}
                          onChange={(value) =>
                            handleInputChange("trainersSubtitle", value)
                          }
                          placeholder="Trainers subtitle..."
                          height={110}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="workoutsTitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Workouts Title
                      </label>
                      <input
                        id="workoutsTitle"
                        type="text"
                        value={formData.workoutsTitle || ""}
                        onChange={(e) =>
                          handleInputChange("workoutsTitle", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="workoutsSubtitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Workouts Subtitle
                      </label>
                      <div className="mt-1">
                        <RichTextEditor
                          value={formData.workoutsSubtitle || ""}
                          onChange={(value) =>
                            handleInputChange("workoutsSubtitle", value)
                          }
                          placeholder="Workouts subtitle..."
                          height={110}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="pricingTitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Pricing Title
                      </label>
                      <input
                        id="pricingTitle"
                        type="text"
                        value={formData.pricingTitle || ""}
                        onChange={(e) =>
                          handleInputChange("pricingTitle", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="pricingSubtitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        Pricing Subtitle
                      </label>
                      <div className="mt-1">
                        <RichTextEditor
                          value={formData.pricingSubtitle || ""}
                          onChange={(value) =>
                            handleInputChange("pricingSubtitle", value)
                          }
                          placeholder="Pricing subtitle..."
                          height={110}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    App Showcase & CTA
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    App promo and global call-to-action copy used across public pages.
                  </p>

                  <div className="mt-6 grid gap-4">
                    <div>
                      <label
                        htmlFor="appShowcaseTitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        App Showcase Title
                      </label>
                      <input
                        id="appShowcaseTitle"
                        type="text"
                        value={formData.appShowcaseTitle || ""}
                        onChange={(e) =>
                          handleInputChange("appShowcaseTitle", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="appShowcaseSubtitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        App Showcase Subtitle
                      </label>
                      <div className="mt-1">
                        <RichTextEditor
                          value={formData.appShowcaseSubtitle || ""}
                          onChange={(value) =>
                            handleInputChange("appShowcaseSubtitle", value)
                          }
                          placeholder="App showcase subtitle..."
                          height={120}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="ctaTitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        CTA Title
                      </label>
                      <input
                        id="ctaTitle"
                        type="text"
                        value={formData.ctaTitle || ""}
                        onChange={(e) =>
                          handleInputChange("ctaTitle", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ctaSubtitle"
                        className="block text-sm font-medium text-foreground"
                      >
                        CTA Subtitle
                      </label>
                      <div className="mt-1">
                        <RichTextEditor
                          value={formData.ctaSubtitle || ""}
                          onChange={(value) =>
                            handleInputChange("ctaSubtitle", value)
                          }
                          placeholder="CTA subtitle..."
                          height={120}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ctaButtonLabel"
                          className="block text-sm font-medium text-foreground"
                        >
                          CTA Button Label
                        </label>
                        <input
                          id="ctaButtonLabel"
                          type="text"
                          value={formData.ctaButtonLabel || ""}
                          onChange={(e) =>
                            handleInputChange("ctaButtonLabel", e.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="footerTagline"
                          className="block text-sm font-medium text-foreground"
                        >
                          Footer Tagline
                        </label>
                        <div className="mt-1">
                          <RichTextEditor
                            value={formData.footerTagline || ""}
                            onChange={(value) =>
                              handleInputChange("footerTagline", value)
                            }
                            placeholder="Footer tagline..."
                            height={90}
                          />
                        </div>
                      </div>
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
                          value={formData.primaryColor || primaryFallback}
                          onChange={(e) =>
                            handleInputChange("primaryColor", e.target.value)
                          }
                          className="h-10 w-10 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor || primaryFallback}
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
                          value={formData.secondaryColor || secondaryFallback}
                          onChange={(e) =>
                            handleInputChange("secondaryColor", e.target.value)
                          }
                          className="h-10 w-10 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          value={formData.secondaryColor || secondaryFallback}
                          onChange={(e) =>
                            handleInputChange("secondaryColor", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="backgroundColor"
                        className="block text-sm font-medium text-foreground"
                      >
                        Background Color
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id="backgroundColor"
                          type="color"
                          value={formData.backgroundColor || backgroundFallback}
                          onChange={(e) =>
                            handleInputChange("backgroundColor", e.target.value)
                          }
                          className="h-10 w-10 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          value={formData.backgroundColor || backgroundFallback}
                          onChange={(e) =>
                            handleInputChange("backgroundColor", e.target.value)
                          }
                          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="textColor"
                        className="block text-sm font-medium text-foreground"
                      >
                        Text Color
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id="textColor"
                          type="color"
                          value={formData.textColor || textFallback}
                          onChange={(e) =>
                            handleInputChange("textColor", e.target.value)
                          }
                          className="h-10 w-10 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          value={formData.textColor || textFallback}
                          onChange={(e) =>
                            handleInputChange("textColor", e.target.value)
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden">
                          {formData.logo ? (
                            <img
                              src={formData.logo}
                              alt="Logo preview"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Logo
                            </span>
                          )}
                        </div>
                        <label className="text-sm font-medium text-foreground">
                          Logo Upload
                        </label>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload("logo", e.target.files?.[0])
                        }
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                      />
                    </div>

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

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md border border-border bg-background flex items-center justify-center overflow-hidden">
                          {formData.favicon ? (
                            <img
                              src={formData.favicon}
                              alt="Favicon preview"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Icon
                            </span>
                          )}
                        </div>
                        <label className="text-sm font-medium text-foreground">
                          Favicon Upload
                        </label>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload("favicon", e.target.files?.[0])
                        }
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
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
