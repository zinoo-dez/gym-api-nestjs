import type { ChangeEvent } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import type { GeneralSettingsFormValues } from "@/features/settings";

interface GeneralSettingsFormProps {
  form: UseFormReturn<GeneralSettingsFormValues>;
  logoPreviewUrl: string;
  onLogoFileSelected: (file: File | undefined) => void;
  mode?: "identity" | "social" | "all";
}

export function GeneralSettingsForm({
  form,
  logoPreviewUrl,
  onLogoFileSelected,
  mode = "all",
}: GeneralSettingsFormProps) {
  const logoValue = form.watch("logo");
  const logoSource = logoPreviewUrl || logoValue || "/placeholder-logo.svg";
  const showIdentity = mode === "all" || mode === "identity";
  const showSocial = mode === "all" || mode === "social";

  const handleLogoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onLogoFileSelected(event.target.files?.[0]);
  };

  return (
    <div className="space-y-6">
      {showIdentity ? (
        <Card>
          <CardHeader>
            <CardTitle>Gym Identity</CardTitle>
            <CardDescription>Manage your gym profile, primary contact details, and branding assets.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gymName">Gym Name *</Label>
                  <Input
                    id="gymName"
                    placeholder="IronForge Fitness"
                    aria-invalid={Boolean(form.formState.errors.gymName)}
                    hasError={Boolean(form.formState.errors.gymName)}
                    {...form.register("gymName")}
                  />
                  {form.formState.errors.gymName?.message ? (
                    <p className="error-text">{form.formState.errors.gymName.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagLine">Tagline</Label>
                  <Input
                    id="tagLine"
                    placeholder="Train smarter. Live stronger."
                    aria-invalid={Boolean(form.formState.errors.tagLine)}
                    hasError={Boolean(form.formState.errors.tagLine)}
                    {...form.register("tagLine")}
                  />
                  {form.formState.errors.tagLine?.message ? (
                    <p className="error-text">{form.formState.errors.tagLine.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your gym atmosphere, training philosophy, and specialty programs..."
                    aria-invalid={Boolean(form.formState.errors.description)}
                    hasError={Boolean(form.formState.errors.description)}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description?.message ? (
                    <p className="error-text">{form.formState.errors.description.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">Logo Preview</p>
                <div className="flex h-40 items-center justify-center rounded-md border bg-background p-3">
                  <img
                    src={logoSource}
                    alt="Gym logo preview"
                    className="max-h-full max-w-full rounded object-contain"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUpload">Upload Logo</Label>
                  <Input id="logoUpload" type="file" accept="image/*" onChange={handleLogoInputChange} />
                  <p className="small-text">PNG, JPG, or SVG. Upload updates preview instantly.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="admin@gym.com"
                  aria-invalid={Boolean(form.formState.errors.contactEmail)}
                  hasError={Boolean(form.formState.errors.contactEmail)}
                  {...form.register("contactEmail")}
                />
                {form.formState.errors.contactEmail?.message ? (
                  <p className="error-text">{form.formState.errors.contactEmail.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="+1 555 0100"
                  aria-invalid={Boolean(form.formState.errors.phone)}
                  hasError={Boolean(form.formState.errors.phone)}
                  {...form.register("phone")}
                />
                {form.formState.errors.phone?.message ? (
                  <p className="error-text">{form.formState.errors.phone.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="123 Main Street, Springfield"
                aria-invalid={Boolean(form.formState.errors.address)}
                hasError={Boolean(form.formState.errors.address)}
                {...form.register("address")}
              />
              {form.formState.errors.address?.message ? (
                <p className="error-text">{form.formState.errors.address.message}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showSocial ? (
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>
              Optional links shown in branded communications and member-facing touchpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yourgym.com"
                aria-invalid={Boolean(form.formState.errors.socialLinks?.website)}
                hasError={Boolean(form.formState.errors.socialLinks?.website)}
                {...form.register("socialLinks.website")}
              />
              {form.formState.errors.socialLinks?.website?.message ? (
                <p className="error-text">{form.formState.errors.socialLinks.website.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                placeholder="https://facebook.com/yourgym"
                aria-invalid={Boolean(form.formState.errors.socialLinks?.facebook)}
                hasError={Boolean(form.formState.errors.socialLinks?.facebook)}
                {...form.register("socialLinks.facebook")}
              />
              {form.formState.errors.socialLinks?.facebook?.message ? (
                <p className="error-text">{form.formState.errors.socialLinks.facebook.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="https://instagram.com/yourgym"
                aria-invalid={Boolean(form.formState.errors.socialLinks?.instagram)}
                hasError={Boolean(form.formState.errors.socialLinks?.instagram)}
                {...form.register("socialLinks.instagram")}
              />
              {form.formState.errors.socialLinks?.instagram?.message ? (
                <p className="error-text">{form.formState.errors.socialLinks.instagram.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">X / Twitter</Label>
              <Input
                id="twitter"
                placeholder="https://x.com/yourgym"
                aria-invalid={Boolean(form.formState.errors.socialLinks?.twitter)}
                hasError={Boolean(form.formState.errors.socialLinks?.twitter)}
                {...form.register("socialLinks.twitter")}
              />
              {form.formState.errors.socialLinks?.twitter?.message ? (
                <p className="error-text">{form.formState.errors.socialLinks.twitter.message}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
