import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  retentionService,
  type RetentionTask,
  type RetentionTaskStatus,
} from "@/services/retention.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  RefreshCcw, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  AlertCircle, 
  Save, 
  Calendar, 
  ClipboardList 
} from "lucide-react";

const RetentionTasks = () => {
  const [tasks, setTasks] = useState<RetentionTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RetentionTaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "1" | "2" | "3">("all");
  const [draftStatus, setDraftStatus] = useState<Record<string, RetentionTaskStatus>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await retentionService.getTasks({
        limit: 100,
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : Number(priorityFilter),
      });
      const items = Array.isArray(response?.data) ? response.data : [];
      setTasks(items);
      setDraftStatus(
        Object.fromEntries(items.map((task) => [task.id, task.status])),
      );
      setDraftNotes(
        Object.fromEntries(items.map((task) => [task.id, task.note ?? ""])),
      );
    } catch (error) {
      console.error("Failed to load retention tasks", error);
      toast.error("Failed to load retention tasks");
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const saveTask = async (task: RetentionTask) => {
    try {
      const updated = await retentionService.updateTask(task.id, {
        status: draftStatus[task.id] ?? task.status,
        note: draftNotes[task.id] ?? task.note,
      });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)));
      toast.success("Task updated");
    } catch (error) {
      console.error("Failed to update retention task", error);
      toast.error("Failed to update task");
    }
  };

  const badgeByStatus = (status: RetentionTaskStatus) => {
    if (status === "DONE") {
      return (
        <Badge className="rounded-lg bg-emerald-100 text-emerald-700 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 w-fit">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    }
    if (status === "IN_PROGRESS") {
      return (
        <Badge className="rounded-lg bg-blue-100 text-blue-700 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 w-fit">
          <PlayCircle className="h-3 w-3" />
          In Progress
        </Badge>
      );
    }
    if (status === "DISMISSED") {
      return (
        <Badge className="rounded-lg bg-gray-100 text-gray-500 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight w-fit">
          Dismissed
        </Badge>
      );
    }
    return (
      <Badge className="rounded-lg bg-red-100 text-red-700 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 w-fit">
        <AlertCircle className="h-3 w-3" />
        Open Task
      </Badge>
    );
  };

  const priorityBadge = (priority: number) => {
    const tones = [
      "bg-red-50 text-red-600 border-red-100",
      "bg-orange-50 text-orange-600 border-orange-100",
      "bg-blue-50 text-blue-600 border-blue-100"
    ];
    return (
      <Badge variant="outline" className={cn("rounded-lg text-[10px] font-bold px-1.5 h-5", tones[priority-1] || tones[2])}>
        P{priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Retention Follow-up Queue</h1>
            <p className="text-sm text-muted-foreground">
              Manage proactive intervention tasks for at-risk gym members.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadTasks} 
            disabled={isLoading}
            className="h-10 rounded-xl border-border font-semibold text-xs transition-all"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Sync Task Queue
          </Button>
        </div>
      </section>

      {/* Filters & Table Section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-50">
              <ClipboardList className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="m3-title-md">Active Task List</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="m3-label !normal-case !tracking-normal bg-muted/50 border-border">
                  {tasks.length} Task{tasks.length !== 1 && "s"} Found
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="h-10 w-full sm:w-44 rounded-xl border-border focus:ring-primary m3-label !text-[11px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200">
                <SelectItem value="all" className="rounded-lg">All Statuses</SelectItem>
                <SelectItem value="OPEN" className="rounded-lg">Open Only</SelectItem>
                <SelectItem value="IN_PROGRESS" className="rounded-lg">In Progress</SelectItem>
                <SelectItem value="DONE" className="rounded-lg">Completed</SelectItem>
                <SelectItem value="DISMISSED" className="rounded-lg">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as "all" | "1" | "2" | "3")}
            >
              <SelectTrigger className="h-10 w-full sm:w-40 rounded-xl border-gray-200 focus:ring-blue-600 text-xs font-bold uppercase tracking-tight">
                <SelectValue placeholder="Priority All" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200">
                <SelectItem value="all" className="rounded-lg">Priority All</SelectItem>
                <SelectItem value="1" className="rounded-lg">P1 - Critical</SelectItem>
                <SelectItem value="2" className="rounded-lg">P2 - High</SelectItem>
                <SelectItem value="3" className="rounded-lg">P3 - Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/30 text-left border-y border-border">
              <tr>
                <th className="px-5 py-4 m3-label !text-[10px]">Assignee Identity</th>
                <th className="px-2 py-4 m3-label !text-[10px]">Follow-up Objective</th>
                <th className="px-2 py-4 m3-label !text-[10px]">Current Status</th>
                <th className="px-2 py-4 m3-label !text-[10px] text-center">Priority</th>
                <th className="px-2 py-4 m3-label !text-[10px] hidden lg:table-cell">Timeline</th>
                <th className="px-2 py-4 m3-label !text-[10px]">Resolution Note</th>
                <th className="px-5 py-4 m3-label !text-[10px] text-right">Commit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <RefreshCcw className="h-8 w-8 text-orange-200 animate-spin mb-4" />
                      <p className="text-gray-400 text-xs font-medium italic">Assembling task queue...</p>
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400">
                    <p className="font-medium italic">No retention tasks currently pending your intervention.</p>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{task.memberName}</div>
                      <div className="text-[10px] font-mono text-gray-400 mt-0.5">{task.memberEmail}</div>
                    </td>
                    <td className="px-2 py-4">
                      <div className="font-medium text-gray-700 max-w-[180px] break-words line-clamp-2 leading-relaxed">
                        {task.title}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <div className="space-y-2">
                        {badgeByStatus(draftStatus[task.id] ?? task.status)}
                        <Select
                          value={draftStatus[task.id] ?? task.status}
                          onValueChange={(value) =>
                            setDraftStatus((prev) => ({
                              ...prev,
                              [task.id]: value as RetentionTaskStatus,
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 w-28 rounded-lg border-gray-100 bg-white text-[10px] font-bold uppercase tracking-tighter focus:ring-blue-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-gray-200">
                            <SelectItem value="OPEN" className="text-[10px] font-bold uppercase">OPEN</SelectItem>
                            <SelectItem value="IN_PROGRESS" className="text-[10px] font-bold uppercase">IN_PROGRESS</SelectItem>
                            <SelectItem value="DONE" className="text-[10px] font-bold uppercase">DONE</SelectItem>
                            <SelectItem value="DISMISSED" className="text-[10px] font-bold uppercase">DISMISSED</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-center">
                      {priorityBadge(task.priority)}
                    </td>
                    <td className="px-2 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                        <Calendar className="h-3 w-3 text-gray-300" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Deadline"}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <Input
                        value={draftNotes[task.id] ?? ""}
                        onChange={(e) =>
                          setDraftNotes((prev) => ({ ...prev, [task.id]: e.target.value }))
                        }
                        placeholder="Resolution narrative..."
                        className="h-9 w-48 rounded-lg border-gray-100 text-xs focus-visible:ring-blue-600 bg-white placeholder:text-gray-300"
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button 
                        size="icon" 
                        onClick={() => saveTask(task)}
                        className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-100 transition-all active:scale-90"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default RetentionTasks;
