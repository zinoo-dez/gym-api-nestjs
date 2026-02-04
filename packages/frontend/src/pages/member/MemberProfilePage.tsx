import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { MemberLayout } from '../../layouts';
import { PrimaryButton, SecondaryButton, FormInput } from '@/components/gym';
import { FormModal } from '@/components/gym/form-modal';
import { membersService, type Member } from '@/services/members.service';
import { User, Mail, Calendar, Edit2 } from 'lucide-react';

export default function MemberProfilePage() {
  const { user } = useAuthStore();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Construct full name if available, otherwise use email or fallback
  const displayName = member?.firstName && member?.lastName
    ? `${member.firstName} ${member.lastName}`
    : user?.email?.split('@')[0] || 'User';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: displayName,
    email: user?.email || '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const loadMember = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await membersService.getMe();
        setMember(response);
        setFormData((prev) => ({
          ...prev,
          name: `${response.firstName} ${response.lastName}`.trim(),
          email: response.email,
          phone: response.phone || '',
        }));
      } catch (err) {
        console.error('Failed to load member profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // await updateUser({
      //   name: formData.name,
      // });
      console.log('Update user not implemented yet', formData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground mt-2">Manage your account settings</p>
            </div>
            <PrimaryButton onClick={() => setIsEditModalOpen(true)} className="gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </PrimaryButton>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
              {error}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12 text-primary" />
              </div>

              {/* Profile Info */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-lg text-foreground mt-1">{displayName}</p>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-lg text-foreground mt-1">{member?.email || user?.email}</p>
                </div>

                {/* Join Date */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </label>
                  <p className="text-lg text-foreground mt-1">
                    {member?.createdAt
                      ? new Date(member.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <p className="text-lg text-foreground">{member?.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
              <p className="text-2xl font-bold text-primary mt-2">—</p>
              <p className="text-xs text-muted-foreground mt-2">Plan details coming soon</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Renewal Date</h3>
              <p className="text-2xl font-bold text-foreground mt-2">—</p>
              <p className="text-xs text-muted-foreground mt-2">Auto-renew not available</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Classes Attended</h3>
              <p className="text-2xl font-bold text-accent mt-2">—</p>
              <p className="text-xs text-muted-foreground mt-2">Attendance data loading</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SecondaryButton className="w-full justify-center">
                Download Invoice
              </SecondaryButton>
              <SecondaryButton className="w-full justify-center">
                Payment Method
              </SecondaryButton>
              <SecondaryButton className="w-full justify-center">
                Schedule Consultation
              </SecondaryButton>
              <SecondaryButton className="w-full justify-center">
                Contact Support
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile"
          onSubmit={handleSubmit}
        >
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled
          />
          <FormInput
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            required={false}
          />
          <FormInput
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St, City, State"
            required={false}
          />
        </FormModal>
    </MemberLayout>
  );
}
