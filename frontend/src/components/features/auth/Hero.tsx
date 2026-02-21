import { Button } from "@/components/ui/Button";

interface HeroProps {
  onOpenAuth: (type: "login" | "register") => void;
}

export function Hero({ onOpenAuth }: HeroProps) {
  return (
    <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-background px-4 py-24 text-center">
      {/* Background styling for gym vibe */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-70" />
      
      <div className="relative z-10 flex max-w-3xl flex-col items-center space-y-8">
        <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Transform Your Body. <br />
          <span className="text-primary">Track Your Progress.</span>
        </h1>
        
        <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 max-w-xl text-lg text-muted-foreground sm:text-xl">
          Join the gym that gives you the tools to succeed. Flexible plans, smart tracking, and expert insights all in one place.
        </p>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg h-14 px-8"
            onClick={() => onOpenAuth("register")}
          >
            Join the Gym
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto text-lg h-14 px-8"
            onClick={() => onOpenAuth("login")}
          >
            Already a Member? Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
