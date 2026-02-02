// Temporary utility function until clsx and tailwind-merge are installed
// Once you have internet access, run: pnpm add clsx tailwind-merge
// Then replace this file with the original implementation

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
