import React from "react";
import { useAlert } from "@/context/AlertContext";
import { Button } from "@/components/ui/Button";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const AlertTestPage: React.FC = () => {
  const { showAlert } = useAlert();

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Alert System Showcase</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard>
          <CardHeader>
            <CardTitle>Success Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="tonal"
              onClick={() => showAlert("Member created successfully!", "success")}
            >
              Trigger Success
            </Button>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard>
          <CardHeader>
            <CardTitle>Error Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="error"
              onClick={() => showAlert("Failed to save changes. Please try again.", "error")}
            >
              Trigger Error
            </Button>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard>
          <CardHeader>
            <CardTitle>Warning Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outlined"
              onClick={() => showAlert("Your subscription will expire in 3 days.", "warning")}
            >
              Trigger Warning
            </Button>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard>
          <CardHeader>
            <CardTitle>Info Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="text"
              onClick={() => showAlert("New classes have been added to the schedule.", "info")}
            >
              Trigger Info
            </Button>
          </CardContent>
        </AnimatedCard>
      </div>

      <div className="mt-12 text-center">
        <Button 
          variant="filled"
          onClick={() => {
            showAlert("First alert", "info", 2000);
            setTimeout(() => showAlert("Second alert", "success", 3000), 500);
            setTimeout(() => showAlert("Third alert", "warning", 4000), 1000);
          }}
        >
          Trigger Multiple Alerts
        </Button>
      </div>
    </div>
  );
};
