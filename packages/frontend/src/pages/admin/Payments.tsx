import { useState } from "react";
import { payments as initialPayments, Payment } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, DollarSign, Clock, AlertCircle } from "lucide-react";

const Payments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = initialPayments.filter((p) => {
    const matchesSearch = p.memberName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = initialPayments.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0);
  const totalPending = initialPayments.filter((p) => p.status === "pending").reduce((a, p) => a + p.amount, 0);
  const totalFailed = initialPayments.filter((p) => p.status === "failed").length;

  const statusColor = (s: Payment["status"]) => s === "paid" ? "default" : s === "pending" ? "secondary" : "destructive";

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Payments</h1><p className="text-muted-foreground">Payment history and tracking</p></div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6 flex items-center gap-4"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Paid</p><p className="text-xl font-bold">${totalPaid}</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center"><Clock className="h-5 w-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-xl font-bold">${totalPending}</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertCircle className="h-5 w-5 text-destructive" /></div><div><p className="text-sm text-muted-foreground">Failed</p><p className="text-xl font-bold">{totalFailed}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Amount</TableHead><TableHead className="hidden sm:table-cell">Plan</TableHead><TableHead className="hidden md:table-cell">Method</TableHead><TableHead className="hidden lg:table-cell">Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.memberName}</TableCell>
                  <TableCell>${p.amount}</TableCell>
                  <TableCell className="hidden sm:table-cell">{p.plan}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize">{p.method}</TableCell>
                  <TableCell className="hidden lg:table-cell">{p.date}</TableCell>
                  <TableCell><Badge variant={statusColor(p.status)}>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
