import { useGymSettings } from "@/hooks/use-gym-settings";

/**
 * ColorPreview Component
 * Demonstrates how gym settings colors are applied throughout the app
 * Use this in the settings page to preview color changes
 */
export function ColorPreview() {
  const { primaryColor, secondaryColor, backgroundColor, textColor } =
    useGymSettings();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Primary Color Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Primary Color</p>
          <div className="flex items-center gap-2">
            <div
              className="h-12 w-12 rounded-lg border border-border"
              style={{ backgroundColor: primaryColor || "var(--primary)" }}
            />
            <code className="text-xs text-muted-foreground">
              {primaryColor || "var(--primary)"}
            </code>
          </div>
        </div>

        {/* Secondary Color Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Secondary Color</p>
          <div className="flex items-center gap-2">
            <div
              className="h-12 w-12 rounded-lg border border-border"
              style={{ backgroundColor: secondaryColor || "var(--accent)" }}
            />
            <code className="text-xs text-muted-foreground">
              {secondaryColor || "var(--accent)"}
            </code>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Background</p>
          <div className="flex items-center gap-2">
            <div
              className="h-12 w-12 rounded-lg border border-border"
              style={{ backgroundColor: backgroundColor || "var(--background)" }}
            />
            <code className="text-xs text-muted-foreground">
              {backgroundColor || "var(--background)"}
            </code>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Text</p>
          <div className="flex items-center gap-2">
            <div
              className="h-12 w-12 rounded-lg border border-border"
              style={{ backgroundColor: textColor || "var(--foreground)" }}
            />
            <code className="text-xs text-muted-foreground">
              {textColor || "var(--foreground)"}
            </code>
          </div>
        </div>
      </div>

      {/* Live Examples */}
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground">Live Preview</p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Primary Button
          </button>
          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90">
            Accent Button
          </button>
          <button className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10">
            Outline Button
          </button>
        </div>

        {/* Links */}
        <div className="flex gap-4">
          <a href="#" className="text-sm text-primary hover:underline">
            Primary Link
          </a>
          <a href="#" className="text-sm text-accent hover:underline">
            Accent Link
          </a>
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Active
          </span>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            New
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-3/4 bg-primary" />
        </div>

        {/* Text Gradient */}
        <p className="text-gradient text-lg font-bold">Gradient Text Effect</p>
      </div>
    </div>
  );
}
