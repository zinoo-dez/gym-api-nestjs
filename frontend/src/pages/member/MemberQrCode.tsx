import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  QrCode,
  RefreshCw,
  Download,
  CheckCircle,
  AlertCircle,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

export default function MemberQrCode() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: qrData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["member-qr-code"],
    queryFn: () => qrCheckinService.getMyQrCode(),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => qrCheckinService.regenerateMyQrCode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-qr-code"] });
      toast({
        title: "QR Code Regenerated",
        description: "Your new QR code is ready to use",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Regeneration Failed",
        description:
          error.response?.data?.message || "Failed to regenerate QR code",
        variant: "destructive",
      });
    },
  });

  const handleDownload = () => {
    if (!qrData?.qrCodeDataUrl) return;

    setIsDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = qrData.qrCodeDataUrl;
      link.download = `gym-qr-code-${qrData.member.firstName}-${qrData.member.lastName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR Code Downloaded",
        description: "Your QR code has been saved",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerate = () => {
    if (
      confirm(
        "Are you sure you want to regenerate your QR code? Your old QR code will no longer work.",
      )
    ) {
      regenerateMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load QR code. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <QrCode className="h-8 w-8" />
          My QR Code
        </h1>
        <p className="text-muted-foreground">
          Show this QR code at the gym entrance for quick check-in
        </p>
      </div>

      {/* Membership Status Alert */}
      {qrData?.member.membershipStatus === "Inactive" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your membership is inactive. Please renew to use gym facilities.
          </AlertDescription>
        </Alert>
      )}

      {qrData?.member.membershipStatus === "Active" && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Your membership is active. You're ready to check in!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Check-in QR Code</CardTitle>
            <CardDescription>
              Scan this code at the gym entrance
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {/* QR Code Image */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img
                src={qrData?.qrCodeDataUrl}
                alt="Member QR Code"
                className="w-64 h-64"
              />
            </div>

            {/* Member Info */}
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">
                {qrData?.member.firstName} {qrData?.member.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {qrData?.member.email}
              </p>
              <Badge
                variant={
                  qrData?.member.membershipStatus === "Active"
                    ? "default"
                    : "destructive"
                }
              >
                {qrData?.member.membershipStatus}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download"}
              </Button>
              <Button
                onClick={handleRegenerate}
                disabled={regenerateMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${regenerateMutation.isPending ? "animate-spin" : ""}`}
                />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
            <CardDescription>Quick check-in instructions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Show Your QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Open this page on your phone or show the downloaded image at
                    the gym entrance
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Staff Scans Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Reception staff will scan your QR code using their scanner
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">You're Checked In!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your attendance is automatically recorded. Enjoy your
                    workout!
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold">Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Save the QR code to your phone for offline access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Regenerate your QR code if you think it's been compromised
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Make sure your membership is active before visiting
                  </span>
                </li>
              </ul>
            </div>

            {qrData?.generatedAt && (
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Generated on{" "}
                  {format(
                    new Date(qrData.generatedAt),
                    "MMM dd, yyyy 'at' HH:mm",
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Security Notice
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Keep your QR code private. Don't share it with others as it
                provides access to your gym account. If you suspect unauthorized
                use, regenerate your QR code immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
