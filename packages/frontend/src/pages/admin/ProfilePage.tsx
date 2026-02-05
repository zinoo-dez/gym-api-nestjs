import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/layouts";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/auth.store";
import { usersService, type UserProfile } from "@/services/users.service";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import {
  PrimaryButton,
  FormInput,
  FormCheckbox,
} from "@/components/gym";
import { FormModal } from "@/components/gym/form-modal";
import { ConfirmationDialog } from "@/components/gym/confirmation-dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Lock,
  Shield,
  Bell,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const { user, clearAuth, setUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogoutConfirming, setIsLogoutConfirming] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsAlerts: false,
    reportSummary: true,
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await usersService.getById(user.id);
        setProfile(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Admin";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!user?.id) return;
      const updated = await usersService.update(user.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
      });
      setProfile(updated);
      setUser({
        ...user,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone || undefined,
      });
      setIsEditModalOpen(false);
      toast.success("Profile updated");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setIsPasswordModalOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password.");
    }
  };

  const handleLogout = async () => {
    try {
      clearAuth();
      setIsLogoutConfirming(false);
      navigate("/auth/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Admin Profile
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your account settings and preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {profile?.role || user?.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-lg font-semibold text-foreground">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold text-primary">Active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Account Information
                  </h2>
                  <PrimaryButton
                    onClick={() => setIsEditModalOpen(true)}
                    className="gap-2"
                    disabled={loading}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </PrimaryButton>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Profile Picture
                      </p>
                      <button className="text-sm text-primary hover:underline mt-1">
                        Upload New Photo
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Full Name
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {displayName || "Not set"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Email Address
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {profile?.email || user?.email || "Not set"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Phone Number
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {profile?.phone || "Not set"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        Not set
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Security
                  </h3>
                </div>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <p className="text-sm text-muted-foreground">Password</p>
                  <p className="text-foreground">Change Password</p>
                </button>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Notifications
                  </h3>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <FormCheckbox
                      checked={preferences.emailNotifications}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          emailNotifications: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm text-foreground">
                      Email Notifications
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <FormCheckbox
                      checked={preferences.smsAlerts}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          smsAlerts: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm text-foreground">SMS Alerts</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <FormCheckbox
                      checked={preferences.reportSummary}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          reportSummary: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm text-foreground">
                      Daily Report Summary
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => setIsLogoutConfirming(true)}
                className="w-full px-4 py-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile Information"
          onSubmit={handleSubmit}
          submitText="Save Changes"
          size="lg"
        >
          <div className="space-y-4">
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
            />
            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
            />
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>
        </FormModal>

        <FormModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title="Change Password"
          onSubmit={handlePasswordSubmit}
          submitText="Update Password"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </FormModal>

        <ConfirmationDialog
          isOpen={isLogoutConfirming}
          title="Logout Confirmation"
          description="Are you sure you want to logout? You'll need to login again to access the admin dashboard."
          confirmText="Logout"
          cancelText="Cancel"
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutConfirming(false)}
          type="warning"
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
