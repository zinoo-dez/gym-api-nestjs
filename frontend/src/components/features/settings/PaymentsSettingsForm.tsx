import type { UseFormReturn } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { CURRENCY_OPTIONS, type PaymentsSettingsFormValues } from "@/features/settings";

interface PaymentsSettingsFormProps {
  form: UseFormReturn<PaymentsSettingsFormValues>;
  mode?: "billing" | "gateway" | "all";
}

export function PaymentsSettingsForm({ form, mode = "all" }: PaymentsSettingsFormProps) {
  const showBilling = mode === "all" || mode === "billing";
  const showGateway = mode === "all" || mode === "gateway";

  return (
    <div className="space-y-6">
      {showBilling ? (
        <Card>
          <CardHeader>
            <CardTitle>Billing Defaults</CardTitle>
            <CardDescription>
              Configure currency and tax handling used across memberships, invoices, and reports.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                id="currency"
                aria-invalid={Boolean(form.formState.errors.currency)}
                hasError={Boolean(form.formState.errors.currency)}
                {...form.register("currency")}
              >
                {CURRENCY_OPTIONS.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </Select>
              {form.formState.errors.currency?.message ? (
                <p className="error-text">{form.formState.errors.currency.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxPercentage">Tax Percentage *</Label>
              <Input
                id="taxPercentage"
                type="number"
                min={0}
                max={100}
                step="0.01"
                placeholder="8.25"
                aria-invalid={Boolean(form.formState.errors.taxPercentage)}
                hasError={Boolean(form.formState.errors.taxPercentage)}
                {...form.register("taxPercentage", { valueAsNumber: true })}
              />
              {form.formState.errors.taxPercentage?.message ? (
                <p className="error-text">{form.formState.errors.taxPercentage.message}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showGateway ? (
        <Card>
          <CardHeader>
            <CardTitle>Payment Gateway Keys</CardTitle>
            <CardDescription>
              Store gateway credentials used by your billing integration. These fields are placeholders for backend-managed secrets.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                <Input id="stripePublicKey" placeholder="pk_live_..." {...form.register("stripePublicKey")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                <Input
                  id="stripeSecretKey"
                  type="password"
                  placeholder="sk_live_..."
                  {...form.register("stripeSecretKey")}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                <Input id="paypalClientId" placeholder="PayPal Client ID" {...form.register("paypalClientId")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypalSecret">PayPal Secret</Label>
                <Input
                  id="paypalSecret"
                  type="password"
                  placeholder="PayPal Secret"
                  {...form.register("paypalSecret")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
