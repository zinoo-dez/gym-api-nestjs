import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { goeyToast } from "goey-toast";

import {
  BusinessHoursForm,
  GeneralSettingsForm,
  PaymentsSettingsForm,
  SecuritySettingsForm,
} from "@/components/features/settings";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  UNSAVED_SETTINGS_MESSAGE,
  businessHoursSchema,
  createDefaultBusinessHours,
  defaultGeneralSettings,
  defaultPaymentsSettings,
  defaultSecuritySettings,
  generalSettingsSchema,
  paymentsSettingsSchema,
  securitySettingsSchema,
  type BusinessHoursFormValues,
  type GeneralSettingsFormValues,
  type PaymentsSettingsFormValues,
  type SecuritySettingsFormValues,
} from "@/features/settings";
import {
  useSystemSettingsQuery,
  useUpdateBusinessHoursMutation,
  useUpdateGeneralSettingsMutation,
  useUpdatePaymentsMutation,
  useUpdateSecurityMutation,
} from "@/hooks/useSettings";
import { useUnsavedChangesPrompt } from "@/hooks/useUnsavedChangesPrompt";
import { cn } from "@/lib/utils";
import { toSettingsErrorMessage } from "@/services/settings.service";

type SettingsSectionId =
  | "gym-identity"
  | "social-media"
  | "operating-hours"
  | "billing-defaults"
  | "payment-gateway-keys"
  | "system-preferences"
  | "change-password";

type SettingsSaveScope = "general" | "hours" | "payments" | "security";

interface SettingsSectionItem {
  id: SettingsSectionId;
  label: string;
  description: string;
  saveScope: SettingsSaveScope;
}

const SETTINGS_SECTION_GROUPS: Array<{ tag: string; items: SettingsSectionItem[] }> = [
  {
    tag: "General",
    items: [
      {
        id: "gym-identity",
        label: "Gym Identity",
        description: "Brand profile, contact details, and logo.",
        saveScope: "general",
      },
      {
        id: "social-media",
        label: "Social Media",
        description: "Public links for member-facing channels.",
        saveScope: "general",
      },
    ],
  },
  {
    tag: "Operations",
    items: [
      {
        id: "operating-hours",
        label: "Operating Hours",
        description: "Opening and closing schedule by weekday.",
        saveScope: "hours",
      },
    ],
  },
  {
    tag: "Payments",
    items: [
      {
        id: "billing-defaults",
        label: "Billing Defaults",
        description: "Currency and tax settings.",
        saveScope: "payments",
      },
      {
        id: "payment-gateway-keys",
        label: "Payment Gateway Keys",
        description: "Stripe and PayPal configuration fields.",
        saveScope: "payments",
      },
    ],
  },
  {
    tag: "Security",
    items: [
      {
        id: "system-preferences",
        label: "System Preferences",
        description: "Notifications and theme behavior.",
        saveScope: "security",
      },
      {
        id: "change-password",
        label: "Change Password",
        description: "Update your account credentials.",
        saveScope: "security",
      },
    ],
  },
];

const SETTINGS_SECTIONS = SETTINGS_SECTION_GROUPS.flatMap((group) => group.items);

const SETTINGS_SECTION_MAP = SETTINGS_SECTIONS.reduce<Record<SettingsSectionId, SettingsSectionItem>>(
  (accumulator, item) => {
    accumulator[item.id] = item;
    return accumulator;
  },
  {} as Record<SettingsSectionId, SettingsSectionItem>,
);

const isSettingsSectionId = (value: string): value is SettingsSectionId => {
  return SETTINGS_SECTIONS.some((section) => section.id === value);
};

const applyTheme = (theme: "light" | "dark") => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export function SystemSettingsPage() {
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();

  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  const settingsQuery = useSystemSettingsQuery();
  const updateGeneralMutation = useUpdateGeneralSettingsMutation();
  const updateBusinessHoursMutation = useUpdateBusinessHoursMutation();
  const updatePaymentsMutation = useUpdatePaymentsMutation();
  const updateSecurityMutation = useUpdateSecurityMutation();

  const generalForm = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: defaultGeneralSettings,
  });

  const businessHoursForm = useForm<BusinessHoursFormValues>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: {
      hours: createDefaultBusinessHours(),
    },
  });

  const paymentsForm = useForm<PaymentsSettingsFormValues>({
    resolver: zodResolver(paymentsSettingsSchema),
    defaultValues: defaultPaymentsSettings,
  });

  const securityForm = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: defaultSecuritySettings,
  });

  const currentTheme = securityForm.watch("theme");

  const activeSection = useMemo<SettingsSectionId>(() => {
    if (section && isSettingsSectionId(section)) {
      return section;
    }

    return "gym-identity";
  }, [section]);

  useEffect(() => {
    if (!section || !isSettingsSectionId(section)) {
      void navigate("/settings/gym-identity", { replace: true });
    }
  }, [navigate, section]);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    generalForm.reset(settingsQuery.data.general);
    businessHoursForm.reset({ hours: settingsQuery.data.businessHours });
    paymentsForm.reset(settingsQuery.data.payments);
    securityForm.reset({
      ...settingsQuery.data.security,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    setLogoPreviewUrl(settingsQuery.data.general.logo);
  }, [settingsQuery.data, generalForm, businessHoursForm, paymentsForm, securityForm]);

  const hasUnsavedChanges =
    generalForm.formState.isDirty ||
    businessHoursForm.formState.isDirty ||
    paymentsForm.formState.isDirty ||
    securityForm.formState.isDirty;

  useUnsavedChangesPrompt(hasUnsavedChanges, UNSAVED_SETTINGS_MESSAGE);

  const handleLogoFileSelected = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      setLogoPreviewUrl(reader.result);
      generalForm.setValue("logo", reader.result, {
        shouldDirty: true,
        shouldValidate: true,
      });
    };

    reader.readAsDataURL(file);
  };

  const saveGeneralSettings = async (values: GeneralSettingsFormValues) => {
    try {
      const saved = await updateGeneralMutation.mutateAsync(values);
      const nextValues: GeneralSettingsFormValues = {
        ...values,
        ...saved,
        socialLinks: {
          ...values.socialLinks,
          ...saved.socialLinks,
        },
      };

      generalForm.reset(nextValues);
      setLogoPreviewUrl(nextValues.logo);
      goeyToast.success("General settings saved.");
    } catch (error) {
      goeyToast.error(toSettingsErrorMessage(error));
    }
  };

  const saveBusinessHours = async (values: BusinessHoursFormValues) => {
    try {
      const saved = await updateBusinessHoursMutation.mutateAsync(values);
      const nextValues: BusinessHoursFormValues = {
        hours: saved.length > 0 ? saved : values.hours,
      };

      businessHoursForm.reset(nextValues);
      goeyToast.success("Business hours saved.");
    } catch (error) {
      goeyToast.error(toSettingsErrorMessage(error));
    }
  };

  const savePayments = async (values: PaymentsSettingsFormValues) => {
    try {
      const saved = await updatePaymentsMutation.mutateAsync(values);
      const nextValues: PaymentsSettingsFormValues = {
        ...values,
        ...saved,
      };

      paymentsForm.reset(nextValues);
      goeyToast.success("Payment settings saved.");
    } catch (error) {
      goeyToast.error(toSettingsErrorMessage(error));
    }
  };

  const saveSecurity = async (values: SecuritySettingsFormValues) => {
    try {
      const saved = await updateSecurityMutation.mutateAsync(values);
      const nextValues: SecuritySettingsFormValues = {
        ...values,
        ...saved,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      };

      securityForm.reset(nextValues);
      goeyToast.success("Security settings saved.");
    } catch (error) {
      goeyToast.error(toSettingsErrorMessage(error));
    }
  };

  const activeSectionConfig = SETTINGS_SECTION_MAP[activeSection];

  const activeSectionHasUnsavedChanges =
    activeSectionConfig.saveScope === "general"
      ? generalForm.formState.isDirty
      : activeSectionConfig.saveScope === "hours"
        ? businessHoursForm.formState.isDirty
        : activeSectionConfig.saveScope === "payments"
          ? paymentsForm.formState.isDirty
          : securityForm.formState.isDirty;

  const activeSectionIsSaving =
    activeSectionConfig.saveScope === "general"
      ? updateGeneralMutation.isPending
      : activeSectionConfig.saveScope === "hours"
        ? updateBusinessHoursMutation.isPending
        : activeSectionConfig.saveScope === "payments"
          ? updatePaymentsMutation.isPending
          : updateSecurityMutation.isPending;

  const handleSaveActiveSection = () => {
    if (activeSectionConfig.saveScope === "general") {
      void generalForm.handleSubmit(saveGeneralSettings)();
      return;
    }

    if (activeSectionConfig.saveScope === "hours") {
      void businessHoursForm.handleSubmit(saveBusinessHours)();
      return;
    }

    if (activeSectionConfig.saveScope === "payments") {
      void paymentsForm.handleSubmit(savePayments)();
      return;
    }

    void securityForm.handleSubmit(saveSecurity)();
  };

  if (settingsQuery.isLoading && !settingsQuery.data) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="page-title">System Settings</h1>
          <p className="body-text text-muted-foreground">Loading your settings workspace...</p>
        </header>

        <Card>
          <CardContent className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-muted-foreground">
            <MaterialIcon icon="progress_activity" className="size-5 animate-spin" />
            <span>Fetching settings</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="page-title">System Settings</h1>
          <p className="body-text text-muted-foreground">
            Failed to load settings. Please retry to continue configuration.
          </p>
        </header>

        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm text-destructive">{toSettingsErrorMessage(settingsQuery.error)}</p>
            <Button type="button" variant="outlined" onClick={() => void settingsQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="page-title">System Settings</h1>
          <p className="body-text text-muted-foreground">
            Configure gym profile, operations, billing, and security by section.
          </p>
        </div>
        
        <div className="flex shrink-0 items-center justify-end">
          <Button
            type="button"
            onClick={handleSaveActiveSection}
            disabled={!activeSectionHasUnsavedChanges || activeSectionIsSaving}
            className="min-w-[140px]"
          >
            {activeSectionIsSaving && <MaterialIcon icon="progress_activity" className="mr-2 size-4 animate-spin" />}
            <span>{activeSectionIsSaving ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>
      </header>

      <div className="grid gap-6">

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="section-title">{activeSectionConfig.label}</h2>
            <p className="small-text">{activeSectionConfig.description}</p>
          </div>

          {activeSection === "gym-identity" ? (
            <GeneralSettingsForm
              form={generalForm}
              logoPreviewUrl={logoPreviewUrl}
              onLogoFileSelected={handleLogoFileSelected}
              mode="identity"
            />
          ) : null}

          {activeSection === "social-media" ? (
            <GeneralSettingsForm
              form={generalForm}
              logoPreviewUrl={logoPreviewUrl}
              onLogoFileSelected={handleLogoFileSelected}
              mode="social"
            />
          ) : null}

          {activeSection === "operating-hours" ? <BusinessHoursForm form={businessHoursForm} /> : null}

          {activeSection === "billing-defaults" ? (
            <PaymentsSettingsForm form={paymentsForm} mode="billing" />
          ) : null}

          {activeSection === "payment-gateway-keys" ? (
            <PaymentsSettingsForm form={paymentsForm} mode="gateway" />
          ) : null}

          {activeSection === "system-preferences" ? (
            <SecuritySettingsForm form={securityForm} mode="preferences" />
          ) : null}

          {activeSection === "change-password" ? (
            <SecuritySettingsForm form={securityForm} mode="password" />
          ) : null}
        </section>
      </div>


    </div>
  );
}
