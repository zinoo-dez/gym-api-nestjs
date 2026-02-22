import { Controller, type UseFormReturn } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { BUSINESS_DAY_LABELS, type BusinessHoursFormValues } from "@/features/settings";

interface BusinessHoursFormProps {
  form: UseFormReturn<BusinessHoursFormValues>;
}

export function BusinessHoursForm({ form }: BusinessHoursFormProps) {
  const hours = form.watch("hours");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>
            Set opening and closing times for each weekday. Turn on Closed for days your gym is not operating.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {hours.map((row, index) => {
            const openTimeError = form.formState.errors.hours?.[index]?.openTime?.message;
            const closeTimeError = form.formState.errors.hours?.[index]?.closeTime?.message;

            return (
              <div
                key={row.day}
                className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[150px_1fr_1fr_auto] md:items-end"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{BUSINESS_DAY_LABELS[row.day]}</p>
                  <p className="text-xs text-muted-foreground">{row.closed ? "Closed" : "Open"}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`open-${row.day}`}>Opening Time</Label>
                  <Input
                    id={`open-${row.day}`}
                    type="time"
                    disabled={row.closed}
                    aria-invalid={Boolean(openTimeError)}
                    hasError={Boolean(openTimeError)}
                    {...form.register(`hours.${index}.openTime`)}
                  />
                  {openTimeError ? <p className="error-text">{openTimeError}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`close-${row.day}`}>Closing Time</Label>
                  <Input
                    id={`close-${row.day}`}
                    type="time"
                    disabled={row.closed}
                    aria-invalid={Boolean(closeTimeError)}
                    hasError={Boolean(closeTimeError)}
                    {...form.register(`hours.${index}.closeTime`)}
                  />
                  {closeTimeError ? <p className="error-text">{closeTimeError}</p> : null}
                </div>

                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <Label htmlFor={`closed-${row.day}`} className="text-sm text-muted-foreground">
                    Closed
                  </Label>
                  <Controller
                    control={form.control}
                    name={`hours.${index}.closed`}
                    render={({ field }) => (
                      <Switch
                        id={`closed-${row.day}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label={`Set ${BUSINESS_DAY_LABELS[row.day]} as closed`}
                      />
                    )}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
