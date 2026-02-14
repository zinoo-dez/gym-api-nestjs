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
    if (status === "DONE") return <Badge>DONE</Badge>;
    if (status === "IN_PROGRESS") return <Badge variant="secondary">IN_PROGRESS</Badge>;
    if (status === "DISMISSED") return <Badge variant="outline">DISMISSED</Badge>;
    return <Badge variant="destructive">OPEN</Badge>;
  };

  return (
    <div className="space-y-6 px-6">
      <div>
        <h1 className="text-2xl font-bold">Retention Tasks</h1>
        <p className="text-muted-foreground">Track and resolve high-risk member follow-ups</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Queue</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
                <SelectItem value="DISMISSED">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as "all" | "1" | "2" | "3")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="1">P1</SelectItem>
                <SelectItem value="2">P2</SelectItem>
                <SelectItem value="3">P3</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadTasks} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No retention tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="font-medium">{task.memberName}</div>
                      <div className="text-xs text-muted-foreground">{task.memberEmail}</div>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="font-medium truncate">{task.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="mb-2">{badgeByStatus(draftStatus[task.id] ?? task.status)}</div>
                      <Select
                        value={draftStatus[task.id] ?? task.status}
                        onValueChange={(value) =>
                          setDraftStatus((prev) => ({
                            ...prev,
                            [task.id]: value as RetentionTaskStatus,
                          }))
                        }
                      >
                        <SelectTrigger className="w-[170px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">OPEN</SelectItem>
                          <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                          <SelectItem value="DONE">DONE</SelectItem>
                          <SelectItem value="DISMISSED">DISMISSED</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>P{task.priority}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={draftNotes[task.id] ?? ""}
                        onChange={(e) =>
                          setDraftNotes((prev) => ({ ...prev, [task.id]: e.target.value }))
                        }
                        placeholder="Add note..."
                        className="min-w-[200px]"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => saveTask(task)}>
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetentionTasks;

