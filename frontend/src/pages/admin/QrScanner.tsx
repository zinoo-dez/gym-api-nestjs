import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Camera,
  Keyboard,
  CheckCircle,
  XCircle,
  User,
  Calendar,
} from "lucide-react";
import { qrCheckinService } from "@/services/qr-checkin.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface CheckInResult {
  success: boolean;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  checkInTime?: string;
  error?: string;
}

export default function QrScanner() {
  const { toast } = useToast();
  const [manualToken, setManualToken] = useState("");
  const [lastCheckIn, setLastCheckIn] = useState<CheckInResult | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInResult[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  const checkInMutation = useMutation({
    mutationFn: (qrCodeToken: string) =>
      qrCheckinService.qrCheckIn(qrCodeToken),
    onSuccess: (data) => {
      const result: CheckInResult = {
        success: true,
        member: data.member,
        checkInTime: data.checkInTime,
      };
      setLastCheckIn(result);
      setRecentCheckIns((prev) => [result, ...prev.slice(0, 9)]);
      setManualToken("");

      toast({
        title: "Check-in Successful!",
        description: `${data.member?.firstName} ${data.member?.lastName} checked in`,
      });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Check-in failed";
      const result: CheckInResult = {
        success: false,
        error: errorMsg,
      };
      setLastCheckIn(result);

      toast({
        title: "Check-in Failed",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      checkInMutation.mutate(manualToken.trim());
    }
  };

  const handleScanResult = (token: string) => {
    if (token && !checkInMutation.isPending) {
      checkInMutation.mutate(token);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Camera className="h-8 w-8" />
          QR Code Scanner
        </h1>
        <p className="text-muted-foreground">
          Scan member QR codes for quick check-in
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Check-in Scanner</CardTitle>
            <CardDescription>
              Scan QR code or enter token manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">
                  <Keyboard className="mr-2 h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="camera" disabled>
                  <Camera className="mr-2 h-4 w-4" />
                  Camera (Coming Soon)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <form onSubmit={handleManualCheckIn} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">QR Code Token</label>
                    <Input
                      placeholder="Enter or paste QR code token..."
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      disabled={checkInMutation.isPending}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!manualToken.trim() || checkInMutation.isPending}
                    className="w-full"
                  >
                    {checkInMutation.isPending ? "Processing..." : "Check In"}
                  </Button>
                </form>

                {/* Last Check-in Result */}
                {lastCheckIn && (
                  <Alert
                    variant={lastCheckIn.success ? "default" : "destructive"}
                    className={
                      lastCheckIn.success
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : ""
                    }
                  >
                    {lastCheckIn.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {lastCheckIn.success ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            Check-in Successful!
                          </p>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            {lastCheckIn.member?.firstName}{" "}
                            {lastCheckIn.member?.lastName}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            {lastCheckIn.checkInTime &&
                              format(
                                new Date(lastCheckIn.checkInTime),
                                "HH:mm:ss",
                              )}
                          </p>
                        </div>
                      ) : (
                        <p>{lastCheckIn.error}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="camera">
                <div className="text-center py-12 text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Camera scanner coming soon</p>
                  <p className="text-sm">Use manual entry for now</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
            <CardDescription>Last 10 check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCheckIns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No check-ins yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    {checkIn.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      {checkIn.success ? (
                        <>
                          <p className="font-medium truncate">
                            {checkIn.member?.firstName}{" "}
                            {checkIn.member?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {checkIn.member?.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {checkIn.checkInTime &&
                              format(new Date(checkIn.checkInTime), "HH:mm:ss")}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-red-600">{checkIn.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold">Get QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Ask member to show their QR code from the member app or printed
                card
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold">Enter Token</h3>
              <p className="text-sm text-muted-foreground">
                Type or paste the QR code token in the manual entry field
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold">Confirm Check-in</h3>
              <p className="text-sm text-muted-foreground">
                System validates membership and records attendance automatically
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
