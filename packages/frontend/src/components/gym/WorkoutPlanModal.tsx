import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/gym";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workoutPlansService, type WorkoutPlan, type CreateWorkoutPlanDto } from "@/services/workout-plans.service";
import { membersService, type Member } from "@/services/members.service";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";

interface WorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: WorkoutPlan | null;
}

const GOALS = [
  { value: "WEIGHT_LOSS", label: "Weight Loss" },
  { value: "MUSCLE_GAIN", label: "Muscle Gain" },
  { value: "ENDURANCE", label: "Endurance" },
  { value: "FLEXIBILITY", label: "Flexibility" },
];

export function WorkoutPlanModal({
  isOpen,
  onClose,
  onSuccess,
  plan,
}: WorkoutPlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState<CreateWorkoutPlanDto>({
    name: "",
    description: "",
    memberId: "",
    goal: "WEIGHT_LOSS",
    exercises: [
      {
        name: "",
        description: "",
        sets: 3,
        reps: 10,
        targetMuscles: [],
        order: 0,
      },
    ],
  });

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await membersService.getAll({ limit: 100 });
        setMembers(response.data);
      } catch (error) {
        console.error("Failed to load members:", error);
      }
    };
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || "",
        memberId: plan.memberId,
        goal: plan.goal as any,
        exercises: plan.exercises?.length 
          ? plan.exercises.map((ex, idx) => ({
              name: ex.name,
              description: ex.description || "",
              sets: ex.sets || 3,
              reps: ex.reps || 10,
              duration: ex.duration,
              targetMuscles: ex.targetMuscles || [],
              order: ex.order ?? idx,
            }))
          : [
              {
                name: "",
                description: "",
                sets: 3,
                reps: 10,
                targetMuscles: [],
                order: 0,
              },
            ],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        memberId: "",
        goal: "WEIGHT_LOSS",
        exercises: [
          {
            name: "",
            description: "",
            sets: 3,
            reps: 10,
            targetMuscles: [],
            order: 0,
          },
        ],
      });
    }
  }, [plan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (plan) {
        await workoutPlansService.update(plan.id, formData);
        toast.success("Workout plan updated successfully");
      } else {
        await workoutPlansService.create(formData);
        toast.success("Workout plan created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save workout plan:", error);
      toast.error(error.response?.data?.message || "Failed to save workout plan");
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          name: "",
          description: "",
          sets: 3,
          reps: 10,
          targetMuscles: [],
          order: prev.exercises.length,
        },
      ],
    }));
  };

  const removeExercise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newExercises = [...prev.exercises];
      newExercises[index] = { ...newExercises[index], [field]: value };
      return { ...prev, exercises: newExercises };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {plan ? "Edit Workout Plan" : "Create Workout Plan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Plan Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Shred"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">
                Goal <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.goal}
                onValueChange={(val: any) => setFormData({ ...formData, goal: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  {GOALS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="member">
                Member <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.memberId}
                onValueChange={(val) => setFormData({ ...formData, memberId: val })}
                disabled={!!plan}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the plan"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Exercises</h3>
              <button
                type="button"
                onClick={addExercise}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Plus className="h-4 w-4" /> Add Exercise
              </button>
            </div>

            {formData.exercises.map((ex, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-border bg-muted/30 p-4"
              >
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Exercise Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      required
                      value={ex.name}
                      onChange={(e) => updateExercise(index, "name", e.target.value)}
                      placeholder="e.g., Bench Press"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>
                        Sets <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        required
                        min={1}
                        value={ex.sets}
                        onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Reps <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        required
                        min={1}
                        value={ex.reps}
                        onChange={(e) => updateExercise(index, "reps", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>
                      Target Muscles <span className="text-red-500">*</span> (Comma separated)
                    </Label>
                    <Input
                      required
                      value={ex.targetMuscles.join(", ")}
                      onChange={(e) =>
                        updateExercise(
                          index,
                          "targetMuscles",
                          e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      placeholder="e.g., Chest, Triceps"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <PrimaryButton type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
