import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, BarChart3, Sparkles } from "lucide-react";

const panelFloat = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1400px] gap-6 lg:grid-cols-2">
        <section className="flex items-center justify-center rounded-3xl bg-background px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <section className="relative hidden overflow-hidden rounded-3xl bg-primary/10 p-8 lg:flex lg:items-center lg:justify-center">
          <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-secondary/20" />
          <div className="absolute -right-12 bottom-10 h-44 w-44 rounded-3xl bg-primary/20" />

          <motion.div
            variants={panelFloat}
            animate="animate"
            className="relative z-10 w-full rounded-3xl border border-input bg-background/75 p-8 backdrop-blur"
          >
            <div className="rounded-2xl bg-secondary/20 p-8">
              <div className="grid h-64 place-content-center rounded-2xl border border-input bg-background/70 text-center">
                <Activity className="mx-auto size-8 text-primary" />
                <p className="card-title mt-4">Training Dashboard Preview</p>
                <p className="small-text mt-2 text-muted-foreground">Illustration / Product Visual</p>
              </div>
            </div>

            <motion.div
              variants={panelFloat}
              animate="animate"
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-5 top-10 rounded-xl border border-input bg-background/85 px-4 py-3 shadow-sm backdrop-blur"
            >
              <p className="small-text text-muted-foreground">Daily Focus</p>
              <p className="card-title inline-flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" /> 10 Tasks / 84%
              </p>
            </motion.div>

            <div className="mt-8 flex items-center justify-between rounded-xl border border-input bg-background/70 px-4 py-3">
              <span className="small-text text-muted-foreground">01</span>
              <p className="small-text inline-flex items-center gap-2 text-muted-foreground">
                <Sparkles className="size-4" /> Built for modern gym operations
              </p>
              <span className="small-text text-muted-foreground">03</span>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
