import * as React from "react"
import { DatePicker } from "@/components/ui/DatePicker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { addDays } from "date-fns"

export function DesignSystemShowcase() {
  const [date1, setDate1] = React.useState<Date | undefined>(new Date())
  const [date2, setDate2] = React.useState<Date | undefined>()
  const [date3, setDate3] = React.useState<Date | undefined>(new Date())
  const [date4, setDate4] = React.useState<Date | undefined>()

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Design System Showcase</h1>
        <p className="text-muted-foreground">
          A place to test and verify our reusable UI components.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>DatePicker - Basic</CardTitle>
            <CardDescription>
              Testing basic date selection and label support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePicker
              label="Birth Date"
              value={date1}
              onChange={setDate1}
              required
            />
            <p className="text-sm">Selected: {date1?.toDateString() || "None"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DatePicker - States</CardTitle>
            <CardDescription>
              Testing disabled, error, and clearable states.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePicker
              label="Disabled Date"
              value={date1}
              onChange={() => {}}
              disabled
            />
            <DatePicker
              label="Error State"
              value={date2}
              onChange={setDate2}
              error="A valid date is required for registration."
            />
            <DatePicker
              label="Clearable Date"
              value={date3}
              onChange={setDate3}
              clearable
              placeholder="Pick a day"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DatePicker - Constraints</CardTitle>
            <CardDescription>
              Testing min and max date boundaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePicker
              label="Future Dates Only"
              value={date4}
              onChange={setDate4}
              minDate={new Date()}
              helperText="Min date set to today."
            />
            <DatePicker
              label="Past Dates Only"
              value={date4}
              onChange={setDate4}
              maxDate={new Date()}
              helperText="Max date set to today."
            />
            <DatePicker
              label="Next 7 Days Only"
              value={date4}
              onChange={setDate4}
              minDate={new Date()}
              maxDate={addDays(new Date(), 7)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
