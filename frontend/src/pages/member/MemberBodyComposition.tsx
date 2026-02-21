import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  bodyCompositionService,
  type BodyCompositionDashboard,
  type BodyCompositionMeasurement,
  type ProgressGoal,
  type ProgressGoalType,
  type ProgressMetric,
  type ProgressPhoto,
  type ProgressPhotoPhase,
  type ProgressPhotoPose,
} from "@/services/body-composition.service";
import { uploadsService } from "@/services/uploads.service";
import { Progress } from "@/components/ui/progress";
import { resolveMediaUrl } from "@/lib/media-url";
import { toast } from "sonner";
import {
  Camera,
  Goal,
  LineChart,
  Plus,
  RefreshCcw,
  Save,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const GOAL_TYPES: ProgressGoalType[] = [
  "WEIGHT",
  "STRENGTH",
  "BODY_COMPOSITION",
  "MEASUREMENT",
];

const METRICS: ProgressMetric[] = [
  "WEIGHT",
  "BMI",
  "BODY_FAT",
  "MUSCLE_MASS",
  "CHEST",
  "WAIST",
  "HIPS",
  "LEFT_ARM",
  "RIGHT_ARM",
  "LEFT_THIGH",
  "RIGHT_THIGH",
  "LEFT_CALF",
  "RIGHT_CALF",
  "BENCH_PRESS",
  "SQUAT",
  "DEADLIFT",
  "CUSTOM",
];

const PHOTO_POSES: ProgressPhotoPose[] = ["FRONT", "SIDE", "BACK", "FLEXED", "OTHER"];
const PHOTO_PHASES: ProgressPhotoPhase[] = ["BEFORE", "AFTER", "PROGRESS"];

const toNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const metricUnit = (metric: ProgressMetric) => {
  if (metric === "WEIGHT") return "kg";
  if (metric === "BODY_FAT") return "%";
  if (metric === "BMI") return "BMI";
  return "";
};

export default function MemberBodyComposition() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<BodyCompositionDashboard | null>(null);
  const [measurements, setMeasurements] = useState<BodyCompositionMeasurement[]>([]);
  const [goals, setGoals] = useState<ProgressGoal[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);

  const [measurementForm, setMeasurementForm] = useState({
    weight: "",
    bodyFat: "",
    muscleMass: "",
    chest: "",
    waist: "",
    hips: "",
    notes: "",
  });

  const [goalForm, setGoalForm] = useState({
    type: "WEIGHT" as ProgressGoalType,
    metric: "WEIGHT" as ProgressMetric,
    title: "",
    targetValue: "",
    unit: "kg",
    description: "",
  });

  const [photoForm, setPhotoForm] = useState({
    pose: "FRONT" as ProgressPhotoPose,
    phase: "PROGRESS" as ProgressPhotoPhase,
    note: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [goalProgressValue, setGoalProgressValue] = useState<Record<string, string>>({});

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardData, measurementRows, goalRows, photoRows] = await Promise.all([
        bodyCompositionService.getMyDashboard({ take: 90 }),
        bodyCompositionService.getMyMeasurements({ take: 20 }),
        bodyCompositionService.getMyGoals({ take: 20 }),
        bodyCompositionService.getMyPhotos({ take: 20 }),
      ]);
      setDashboard(dashboardData || null);
      setMeasurements(Array.isArray(measurementRows) ? measurementRows : []);
      setGoals(Array.isArray(goalRows) ? goalRows : []);
      setPhotos(Array.isArray(photoRows) ? photoRows : []);
      setGoalProgressValue(
        Object.fromEntries(
          (Array.isArray(goalRows) ? goalRows : []).map((goal) => [
            goal.id,
            goal.currentValue != null ? String(goal.currentValue) : "",
          ]),
        ),
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load body composition data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const submitMeasurement = async () => {
    try {
      await bodyCompositionService.recordMeasurement({
        weight: toNumber(measurementForm.weight),
        bodyFat: toNumber(measurementForm.bodyFat),
        muscleMass: toNumber(measurementForm.muscleMass),
        chest: toNumber(measurementForm.chest),
        waist: toNumber(measurementForm.waist),
        hips: toNumber(measurementForm.hips),
        notes: measurementForm.notes.trim() || undefined,
      });
      toast.success("Measurement saved");
      setMeasurementForm({
        weight: "",
        bodyFat: "",
        muscleMass: "",
        chest: "",
        waist: "",
        hips: "",
        notes: "",
      });
      await refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save measurement");
    }
  };

  const submitGoal = async () => {
    if (!goalForm.title.trim()) {
      toast.error("Goal title is required");
      return;
    }
    if (!goalForm.targetValue || Number(goalForm.targetValue) <= 0) {
      toast.error("Target value must be greater than 0");
      return;
    }

    try {
      const result = await bodyCompositionService.createGoal({
        type: goalForm.type,
        metric: goalForm.metric,
        title: goalForm.title.trim(),
        targetValue: Number(goalForm.targetValue),
        unit: goalForm.unit.trim() || undefined,
        description: goalForm.description.trim() || undefined,
      });

      const nextGoal = result?.goal || result;
      setGoals((prev) => [nextGoal, ...prev]);
      setGoalForm({
        type: "WEIGHT",
        metric: "WEIGHT",
        title: "",
        targetValue: "",
        unit: "kg",
        description: "",
      });
      toast.success("Goal created");
      await refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create goal");
    }
  };

  const updateGoalProgress = async (goal: ProgressGoal) => {
    const raw = goalProgressValue[goal.id];
    const currentValue = toNumber(raw || "");
    if (currentValue == null) {
      toast.error("Enter a progress value first");
      return;
    }

    setUpdatingGoalId(goal.id);
    try {
      const updated = await bodyCompositionService.updateGoal(goal.id, {
        currentValue,
      });
      const nextGoal = updated?.goal || updated;
      setGoals((prev) => prev.map((item) => (item.id === goal.id ? nextGoal : item)));
      toast.success("Goal progress updated");
      await refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update goal");
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const uploadAndSavePhoto = async () => {
    if (!photoFile) {
      toast.error("Please choose a photo file");
      return;
    }

    setUploadingPhoto(true);
    try {
      const uploaded = await uploadsService.uploadImage(photoFile);
      await bodyCompositionService.createPhoto({
        photoUrl: uploaded.url,
        pose: photoForm.pose,
        phase: photoForm.phase,
        note: photoForm.note.trim() || undefined,
      });

      setPhotoFile(null);
      setPhotoForm({ pose: "FRONT", phase: "PROGRESS", note: "" });
      toast.success("Progress photo uploaded");
      await refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const summaryChange = useMemo(() => {
    if (!dashboard?.summary) return null;
    return {
      weight: dashboard.summary.weightChange,
      bodyFat: dashboard.summary.bodyFatChange,
      muscleMass: dashboard.summary.muscleMassChange,
    };
  }, [dashboard]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Body Composition</h1>
            <p className="text-sm text-muted-foreground">
              Track measurements, progress photos, and personal goals.
            </p>
          </div>
          <Button variant="outline" onClick={refresh} disabled={refreshing || loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboard?.summary?.totalEntries ?? measurements.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboard?.summary?.latestWeight ?? "-"}</p>
            {summaryChange?.weight != null && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {summaryChange.weight > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {summaryChange.weight > 0 ? "+" : ""}
                {summaryChange.weight} kg
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Photo Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboard?.photos?.total ?? photos.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Before: {dashboard?.photos?.beforeCount ?? 0} | After: {dashboard?.photos?.afterCount ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Log Measurement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={measurementForm.weight}
                  onChange={(e) =>
                    setMeasurementForm((prev) => ({ ...prev, weight: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Body Fat (%)</Label>
                <Input
                  type="number"
                  value={measurementForm.bodyFat}
                  onChange={(e) =>
                    setMeasurementForm((prev) => ({ ...prev, bodyFat: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Muscle Mass</Label>
                <Input
                  type="number"
                  value={measurementForm.muscleMass}
                  onChange={(e) =>
                    setMeasurementForm((prev) => ({ ...prev, muscleMass: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Chest</Label>
                <Input
                  type="number"
                  value={measurementForm.chest}
                  onChange={(e) =>
                    setMeasurementForm((prev) => ({ ...prev, chest: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Waist</Label>
                <Input
                  type="number"
                  value={measurementForm.waist}
                  onChange={(e) =>
                    setMeasurementForm((prev) => ({ ...prev, waist: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Hips</Label>
                <Input
                  type="number"
                  value={measurementForm.hips}
                  onChange={(e) =>
                    setMeasurementForm((prev) => ({ ...prev, hips: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={measurementForm.notes}
                onChange={(e) =>
                  setMeasurementForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional notes"
              />
            </div>
            <Button onClick={submitMeasurement} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Measurement
            </Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader>
            <CardTitle>Recent Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : measurements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No measurements recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {measurements.map((row) => (
                  <div key={row.id} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">
                      {new Date(row.recordedAt).toLocaleString()}
                    </p>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                      <span>Weight: {row.weight ?? "-"}</span>
                      <span>Body Fat: {row.bodyFat ?? "-"}</span>
                      <span>Muscle: {row.muscleMass ?? "-"}</span>
                      <span>BMI: {row.bmi ?? "-"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Goal className="h-4 w-4" />
              Goal Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Goal Type</Label>
                <Select
                  value={goalForm.type}
                  onValueChange={(value) =>
                    setGoalForm((prev) => ({ ...prev, type: value as ProgressGoalType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Metric</Label>
                <Select
                  value={goalForm.metric}
                  onValueChange={(value) =>
                    setGoalForm((prev) => ({
                      ...prev,
                      metric: value as ProgressMetric,
                      unit: metricUnit(value as ProgressMetric),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METRICS.map((metric) => (
                      <SelectItem key={metric} value={metric}>
                        {metric}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={goalForm.title}
                onChange={(e) =>
                  setGoalForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Lose 5kg in 12 weeks"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Target Value</Label>
                <Input
                  type="number"
                  value={goalForm.targetValue}
                  onChange={(e) =>
                    setGoalForm((prev) => ({ ...prev, targetValue: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={goalForm.unit}
                  onChange={(e) =>
                    setGoalForm((prev) => ({ ...prev, unit: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={goalForm.description}
                onChange={(e) =>
                  setGoalForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional details"
              />
            </div>
            <Button onClick={submitGoal} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>

            <div className="space-y-3 pt-2">
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No goals created yet.</p>
              ) : (
                goals.map((goal) => (
                  <div key={goal.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{goal.title}</p>
                      <Badge variant="outline">{goal.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {goal.metric} target: {goal.targetValue} {goal.unit || ""}
                    </p>
                    <Progress
                      className="mt-2"
                      value={Math.max(0, Math.min(100, goal.progressPercent || 0))}
                    />
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="Current value"
                        value={goalProgressValue[goal.id] ?? ""}
                        onChange={(e) =>
                          setGoalProgressValue((prev) => ({
                            ...prev,
                            [goal.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() => updateGoalProgress(goal)}
                        disabled={updatingGoalId === goal.id}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Progress Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Photo File</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Pose</Label>
                <Select
                  value={photoForm.pose}
                  onValueChange={(value) =>
                    setPhotoForm((prev) => ({ ...prev, pose: value as ProgressPhotoPose }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHOTO_POSES.map((pose) => (
                      <SelectItem key={pose} value={pose}>
                        {pose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phase</Label>
                <Select
                  value={photoForm.phase}
                  onValueChange={(value) =>
                    setPhotoForm((prev) => ({ ...prev, phase: value as ProgressPhotoPhase }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHOTO_PHASES.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {phase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Note</Label>
              <Textarea
                value={photoForm.note}
                onChange={(e) =>
                  setPhotoForm((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="Optional photo note"
              />
            </div>
            <Button onClick={uploadAndSavePhoto} disabled={uploadingPhoto} className="w-full">
              {uploadingPhoto ? "Uploading..." : "Upload Photo"}
            </Button>

            <div className="grid grid-cols-2 gap-2 pt-1 md:grid-cols-3">
              {photos.slice(0, 12).map((photo) => (
                <div key={photo.id} className="rounded-md border p-2">
                  <img
                    src={resolveMediaUrl(photo.photoUrl)}
                    alt={`Progress ${photo.phase}`}
                    className="h-28 w-full rounded object-cover"
                  />
                  <p className="mt-2 text-xs font-medium">{photo.phase}</p>
                  <p className="text-[11px] text-muted-foreground">{photo.pose}</p>
                </div>
              ))}
              {photos.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground">
                  No photos uploaded yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
