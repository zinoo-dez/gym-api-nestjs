import { useThemeStore } from "@/store/theme.store";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:bg-foreground/10`}
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
            <MaterialIcon icon={theme === "light" ? "dark_mode" : "light_mode"} className="text-2xl" />
        </button>
    );
}
