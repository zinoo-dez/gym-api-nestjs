import { Controller, type UseFormReturn } from "react-hook-form";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import type { SecuritySettingsFormValues } from "@/features/settings";
import { cn } from "@/lib/utils";

interface SecuritySettingsFormProps {
  form: UseFormReturn<SecuritySettingsFormValues>;
  mode?: "preferences" | "password" | "all";
}

export function SecuritySettingsForm({ form, mode = "all" }: SecuritySettingsFormProps) {
  const selectedTheme = form.watch("theme");
  const showPreferences = mode === "all" || mode === "preferences";
  const showPassword = mode === "all" || mode === "password";

  return (
    <div className="space-y-6">
      {showPreferences ? (
        <Card>
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
            <CardDescription>Control admin notifications and appearance defaults for the dashboard.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-md border bg-muted/20 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive system update alerts by email.</p>
              </div>

              <Controller
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Toggle email notifications"
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border bg-muted/20 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">SMS Notifications</p>
                <p className="text-xs text-muted-foreground">Receive urgent alerts by SMS.</p>
              </div>

              <Controller
                control={form.control}
                name="smsNotifications"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Toggle SMS notifications"
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={selectedTheme === "light" ? "default" : "outline"}
                  className={cn("justify-start", selectedTheme === "light" ? "border-primary" : "")}
                  onClick={() => form.setValue("theme", "light", { shouldDirty: true })}
                >
                  <Sun className="size-4" />
                  Light Theme
                </Button>

                <Button
                  type="button"
                  variant={selectedTheme === "dark" ? "default" : "outline"}
                  className={cn("justify-start", selectedTheme === "dark" ? "border-primary" : "")}
                  onClick={() => form.setValue("theme", "dark", { shouldDirty: true })}
                >
                  <Moon className="size-4" />
                  Dark Theme
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showPassword ? (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Leave password fields empty if you are not rotating credentials right now.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                aria-invalid={Boolean(form.formState.errors.currentPassword)}
                hasError={Boolean(form.formState.errors.currentPassword)}
                {...form.register("currentPassword")}
              />
              {form.formState.errors.currentPassword?.message ? (
                <p className="error-text">{form.formState.errors.currentPassword.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
                aria-invalid={Boolean(form.formState.errors.newPassword)}
                hasError={Boolean(form.formState.errors.newPassword)}
                {...form.register("newPassword")}
              />
              {form.formState.errors.newPassword?.message ? (
                <p className="error-text">{form.formState.errors.newPassword.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="Re-enter new password"
                aria-invalid={Boolean(form.formState.errors.confirmNewPassword)}
                hasError={Boolean(form.formState.errors.confirmNewPassword)}
                {...form.register("confirmNewPassword")}
              />
              {form.formState.errors.confirmNewPassword?.message ? (
                <p className="error-text">{form.formState.errors.confirmNewPassword.message}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
