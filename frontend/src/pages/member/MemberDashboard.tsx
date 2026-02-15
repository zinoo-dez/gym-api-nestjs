import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { membersService, type Member } from "@/services/members.service";
import { paymentsService, type Payment } from "@/services/payments.service";
import { membershipsService, type MembershipPlan } from "@/services/memberships.service";
import { uploadsService } from "@/services/uploads.service";
import { authService } from "@/services/auth.service";
import { notificationsService, type NotificationItem } from "@/services/notifications.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const MemberDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [member, setMember] = useState<Member | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [edit, setEdit] = useState({
    phone: "",
    address: "",
    avatarUrl: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    methodType: "BANK",
    provider: "KBZ",
    transactionNo: "",
    screenshotUrl: "",
    amount: "",
    discountCode: "",
  });
  const [discountPreview, setDiscountPreview] = useState<number | null>(null);
  const [discountValidated, setDiscountValidated] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const proofInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [data, paymentList, planList, notificationList] = await Promise.all([
          membersService.getMe(),
          paymentsService.getMyPayments(),
          membershipsService.getAllPlans({ limit: 50 }),
          notificationsService.getMe(),
        ]);
        setMember(data);
        setPayments(Array.isArray(paymentList) ? paymentList : []);
        setPlans(Array.isArray(planList.data) ? planList.data : []);
        setNotifications(Array.isArray(notificationList) ? notificationList : []);
        setEdit({
          phone: data.phone || "",
          address: data.address || "",
          avatarUrl: data.avatarUrl || "",
        });
      } catch (err) {
        console.error("Failed to load member", err);
        setMember(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const markNotificationRead = async (id: string) => {
    try {
      await notificationsService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to mark notification read");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationsService.markAllMeRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to mark all notifications read");
    }
  };

  const formatTimeAgo = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const activeSubscription = useMemo(() => {
    if (!member?.subscriptions?.length) return undefined;
    const active = member.subscriptions.find((s) => s.status === "ACTIVE");
    return active || member.subscriptions[0];
  }, [member]);

  const hasActiveOrPending = useMemo(
    () => member?.subscriptions?.some((s) => s.status === "ACTIVE" || s.status === "PENDING") || false,
    [member],
  );
  const hasPendingSubscription = useMemo(
    () => member?.subscriptions?.some((s) => s.status === "PENDING") || false,
    [member],
  );

  const latestPayment = useMemo(() => {
    if (!activeSubscription) return undefined;
    return payments.find((p) => p.subscriptionId === activeSubscription.id);
  }, [payments, activeSubscription]);

  const membershipStatus = activeSubscription?.status || "NONE";
  const expiryDate = activeSubscription?.endDate
    ? new Date(activeSubscription.endDate)
    : null;
  const daysToExpiry =
    expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / 86400000) : null;

  const handleProfileSave = async () => {
    if (!member) return;
    try {
      const updated = await membersService.update(member.id, {
        phone: edit.phone.trim() || undefined,
        address: edit.address.trim() || undefined,
        avatarUrl: edit.avatarUrl.trim() || undefined,
      });
      setMember(updated);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill current and new password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan) {
      toast.error("Please choose a plan first.");
      return;
    }
    if (hasActiveOrPending) {
      toast.error("You already have an active or pending membership. Please wait for admin approval.");
      return;
    }
    if (!paymentForm.transactionNo.trim()) {
      toast.error("Transaction number is required.");
      return;
    }
    if (paymentForm.discountCode.trim() && !discountValidated) {
      toast.error("Please apply the discount code before submitting.");
      return;
    }

    try {
      let screenshotUrl = paymentForm.screenshotUrl;
      if (!screenshotUrl) {
        if (isUploadingProof) {
          toast.error("Proof is still uploading. Please wait.");
          return;
        }
        const fileToUpload = proofFile || proofInputRef.current?.files?.[0] || null;
        if (fileToUpload) {
          const uploadedUrl = await handleProofUpload(fileToUpload);
          if (uploadedUrl) {
            screenshotUrl = uploadedUrl;
          }
        }
      }
      if (!screenshotUrl) {
        toast.error("Payment screenshot is required.");
        return;
      }

      const subscription = await membershipsService.subscribe({
        planId: selectedPlan.id,
        discountCode: paymentForm.discountCode.trim() || undefined,
      });

      const amountValue =
        paymentForm.amount.trim() !== ""
          ? Number(paymentForm.amount)
          : subscription.finalPrice || subscription.originalPrice || 0;
      if (!amountValue) {
        toast.error("Amount is required.");
        return;
      }

      const created = await paymentsService.create({
        subscriptionId: subscription.id,
        amount: amountValue,
        currency: "MMK",
        methodType: paymentForm.methodType as any,
        provider: paymentForm.provider as any,
        transactionNo: paymentForm.transactionNo.trim(),
        screenshotUrl: screenshotUrl.trim() || undefined,
      });
      setPayments((prev) => [created, ...prev]);
      setPaymentForm((prev) => ({
        ...prev,
        transactionNo: "",
        screenshotUrl: "",
        discountCode: "",
      }));
      setProofFile(null);
      setDiscountPreview(null);
      setDiscountValidated(false);
      const refreshed = await membersService.getMe();
      setMember(refreshed);
      toast.success("Payment submitted. Awaiting admin review.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit payment.");
    }
  };

  const handlePauseMembership = async () => {
    if (!activeSubscription) return;
    try {
      await membershipsService.pauseMembership(activeSubscription.id);
      const refreshed = await membersService.getMe();
      setMember(refreshed);
      toast.success("Membership paused");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to pause membership");
    }
  };

  const handleResumeMembership = async () => {
    if (!activeSubscription) return;
    try {
      await membershipsService.resumeMembership(activeSubscription.id);
      const refreshed = await membersService.getMe();
      setMember(refreshed);
      toast.success("Membership resumed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resume membership");
    }
  };

  const handleCancelMembership = async () => {
    if (!activeSubscription) return;
    try {
      await membershipsService.cancelMembership(activeSubscription.id);
      const refreshed = await membersService.getMe();
      setMember(refreshed);
      toast.success("Membership cancelled");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel membership");
    }
  };

  const handleSwitchPlan = async () => {
    if (!selectedPlan || !activeSubscription) return;
    if (activeSubscription.membershipPlan?.id === selectedPlan.id) {
      toast.error("You are already on this plan.");
      return;
    }
    try {
      await membershipsService.switchMyPlan({ newPlanId: selectedPlan.id });
      const refreshed = await membersService.getMe();
      setMember(refreshed);
      toast.success("Plan switched successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to switch plan");
    }
  };

  const handleDownloadInvoice = async () => {
    if (!activeSubscription) return;
    try {
      const blob = await membershipsService.downloadInvoice(activeSubscription.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${activeSubscription.id.slice(-8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to download invoice");
    }
  };

  useEffect(() => {
    setDiscountPreview(null);
    setDiscountValidated(false);
    setPaymentForm((prev) => ({
      ...prev,
      amount: "",
      discountCode: "",
      screenshotUrl: "",
      transactionNo: "",
    }));
    setProofFile(null);
    if (proofInputRef.current) {
      proofInputRef.current.value = "";
    }
  }, [selectedPlan?.id]);

  const handleDiscountPreview = async () => {
    if (!selectedPlan) {
      toast.error("Select a plan first.");
      return;
    }
    if (!paymentForm.discountCode.trim()) {
      toast.error("Enter a discount code.");
      return;
    }
    try {
      const preview = await membershipsService.previewDiscount(
        selectedPlan.id,
        paymentForm.discountCode.trim(),
      );
      const finalPrice = Number(preview.finalPrice || preview.amount || 0);
      setDiscountPreview(finalPrice);
      setDiscountValidated(true);
      if (finalPrice) {
        setPaymentForm((prev) => ({ ...prev, amount: String(finalPrice) }));
      }
      toast.success(`Discount applied. Final price: ${finalPrice.toLocaleString()} MMK`);
    } catch (err: any) {
      setDiscountPreview(null);
      setDiscountValidated(false);
      toast.error(err?.response?.data?.message || "Invalid discount code.");
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadsService.uploadImage(file);
      setEdit((prev) => ({ ...prev, avatarUrl: uploaded.url }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProofUpload = async (file: File) => {
    setIsUploadingProof(true);
    try {
      const uploaded = await uploadsService.uploadImage(file);
      setPaymentForm((prev) => ({ ...prev, screenshotUrl: uploaded.url }));
      toast.success("Payment proof uploaded");
      return uploaded.url;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload proof");
      return null;
    } finally {
      setIsUploadingProof(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading member dashboard...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Member profile not found.
      </div>
    );
  }

  const paymentStatus = latestPayment?.status
    ? latestPayment.status
    : membershipStatus === "ACTIVE"
    ? "PAID"
    : membershipStatus === "PENDING"
    ? "PENDING"
    : membershipStatus === "EXPIRED" || membershipStatus === "CANCELLED"
    ? "EXPIRED"
    : "UNKNOWN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Member Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and membership
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <p className="text-sm font-medium">
                  {member.firstName} {member.lastName}
                </p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm font-medium">{member.email}</p>
              </div>
              <div>
                <Label>Role</Label>
                <p className="text-sm font-medium">{user?.role || "MEMBER"}</p>
              </div>
              <div>
                <Label>Membership status</Label>
                <Badge variant={membershipStatus === "ACTIVE" ? "default" : "secondary"}>
                  {membershipStatus}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={edit.phone}
                  onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={edit.address}
                  onChange={(e) => setEdit({ ...edit, address: e.target.value })}
                />
              </div>
              <div>
                <Label>Avatar URL</Label>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingAvatar}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAvatarUpload(file);
                    }
                  }}
                />
                {edit.avatarUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploaded: {edit.avatarUrl}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleProfileSave}>Save profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Current password</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
              />
            </div>
            <div>
              <Label>New password</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Confirm new password</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
              />
            </div>
            <Button variant="outline" onClick={handleChangePassword}>
              Update password
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Membership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active plan</span>
              <span className="text-sm font-medium">
                {activeSubscription?.membershipPlan?.name || "No active plan"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expiry date</span>
              <span className="text-sm font-medium">
                {expiryDate ? expiryDate.toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment status</span>
              <Badge variant={paymentStatus === "PAID" ? "default" : "secondary"}>
                {paymentStatus}
              </Badge>
            </div>
            {latestPayment?.transactionNo && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction</span>
                <span className="text-sm font-medium">{latestPayment.transactionNo}</span>
              </div>
            )}
            {daysToExpiry !== null && daysToExpiry <= 14 && daysToExpiry >= 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Renewal reminder: your plan expires in {daysToExpiry} day
                {daysToExpiry === 1 ? "" : "s"}.
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {activeSubscription?.status === "ACTIVE" && (
                <Button size="sm" variant="outline" onClick={handlePauseMembership}>
                  Pause
                </Button>
              )}
              {activeSubscription?.status === "FROZEN" && (
                <Button size="sm" variant="outline" onClick={handleResumeMembership}>
                  Resume
                </Button>
              )}
              {activeSubscription && (
                <Button size="sm" variant="outline" onClick={handleDownloadInvoice}>
                  Download Invoice
                </Button>
              )}
              {activeSubscription && activeSubscription.status !== "CANCELLED" && (
                <Button size="sm" variant="outline" onClick={handleCancelMembership}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membership History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {member.subscriptions && member.subscriptions.length > 0 ? (
              member.subscriptions.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">
                      {s.membershipPlan?.name || "Membership plan"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={s.status === "ACTIVE" ? "default" : "secondary"}>
                    {s.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No membership history yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Notifications</CardTitle>
          <Button size="sm" variant="outline" onClick={markAllNotificationsRead}>
            Mark all read
          </Button>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-md border p-3 ${n.read ? "bg-background" : "bg-primary/5 border-primary/20"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm font-medium ${n.read ? "" : "text-primary"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatTimeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markNotificationRead(n.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose a Membership Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPendingSubscription && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              You currently have a pending membership request. Plan selection is temporarily disabled.
            </div>
          )}
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No plans available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 ${selectedPlan?.id === plan.id ? "border-primary" : "border-border"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.description || "Membership plan"}</p>
                    </div>
                  {selectedPlan?.id === plan.id && discountPreview !== null ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="line-through text-muted-foreground">
                        {plan.price.toLocaleString()} MMK
                      </span>
                      <span className="text-primary font-medium">
                        {discountPreview.toLocaleString()} MMK
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline">{plan.price.toLocaleString()} MMK</Badge>
                  )}
                  </div>
                  <Button
                    className="mt-3"
                    variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                    onClick={() => setSelectedPlan(plan)}
                    disabled={hasPendingSubscription}
                  >
                    {selectedPlan?.id === plan.id ? "Selected" : "Choose Plan"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedPlan ? (
            <p className="text-sm text-muted-foreground">
              Select a membership plan to continue.
            </p>
          ) : (
            <>
              <div className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium">{selectedPlan.name}</p>
                <p className="text-muted-foreground">
                  {selectedPlan.price.toLocaleString()} MMK · {selectedPlan.durationDays} days
                </p>
                {discountPreview !== null ? (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="line-through text-muted-foreground">
                        {selectedPlan.price.toLocaleString()} MMK
                      </span>
                      <span className="text-primary font-medium">
                        {discountPreview.toLocaleString()} MMK
                      </span>
                      <Badge variant="outline">Applied</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You save {(selectedPlan.price - discountPreview).toLocaleString()} MMK
                    </p>
                  </div>
                ) : null}
                {selectedPlan.features?.length ? (
                  <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside">
                    {selectedPlan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Method</Label>
              <Select
                value={paymentForm.methodType}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, methodType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK">Bank</SelectItem>
                  <SelectItem value="WALLET">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Provider</Label>
              <Select
                value={paymentForm.provider}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, provider: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AYA">AYA</SelectItem>
                  <SelectItem value="KBZ">KBZ</SelectItem>
                  <SelectItem value="CB">CB</SelectItem>
                  <SelectItem value="UAB">UAB</SelectItem>
                  <SelectItem value="A_BANK">A Bank</SelectItem>
                  <SelectItem value="YOMA">Yoma</SelectItem>
                  <SelectItem value="KBZ_PAY">KBZ Pay</SelectItem>
                  <SelectItem value="AYA_PAY">AYA Pay</SelectItem>
                  <SelectItem value="CB_PAY">CB Pay</SelectItem>
                  <SelectItem value="UAB_PAY">UAB Pay</SelectItem>
                  <SelectItem value="WAVE_MONEY">Wave Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (MMK)</Label>
              <Input
                type="number"
                min="0"
                value={
                  discountPreview !== null
                    ? String(discountPreview)
                    : selectedPlan?.price?.toString() || paymentForm.amount
                }
                readOnly
              />
              {discountPreview !== null && (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="line-through text-muted-foreground">
                    {selectedPlan?.price?.toLocaleString()} MMK
                  </span>
                  <span className="text-primary font-medium">
                    {discountPreview.toLocaleString()} MMK
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Discount code (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={paymentForm.discountCode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, discountCode: e.target.value })}
                />
                <Button type="button" variant="outline" onClick={handleDiscountPreview}>
                  Apply
                </Button>
              </div>
            </div>
            <div>
              <Label>Transaction No</Label>
              <Input
                value={paymentForm.transactionNo}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionNo: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Screenshot</Label>
            <Input
              type="file"
              accept="image/*"
              disabled={isUploadingProof}
              ref={proofInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setProofFile(file);
                  handleProofUpload(file);
                }
                }}
              />
            {paymentForm.screenshotUrl && (
              <p className="text-xs text-muted-foreground mt-1">
                Uploaded: {paymentForm.screenshotUrl}
              </p>
            )}
            {!paymentForm.screenshotUrl && proofFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {proofFile.name}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSubmitPayment} disabled={isUploadingProof}>
              {isUploadingProof ? "Uploading..." : "Submit Payment"}
            </Button>
            <Button
              variant="outline"
              onClick={handleSwitchPlan}
              disabled={!selectedPlan || !activeSubscription || isUploadingProof}
            >
              Switch Plan
            </Button>
          </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberDashboard;
