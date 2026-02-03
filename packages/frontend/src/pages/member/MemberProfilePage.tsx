'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { MemberLayout } from '@/components/layouts/member-layout';
import { PrimaryButton, SecondaryButton, FormInput } from '@/components/gym';
import { FormModal } from '@/components/gym/form-modal';
import { User, Mail, Phone, MapPin, Calendar, Edit2 } from 'lucide-react';

export default function MemberProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateUser({
        name: formData.name,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole="member">
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
                  <p className="text-lg text-foreground mt-1">{user?.name}</p>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-lg text-foreground mt-1">{user?.email}</p>
                </div>

                {/* Join Date */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </label>
                  <p className="text-lg text-foreground mt-1">
                    {user?.joinDate
                      ? new Date(user.joinDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <p className="text-lg text-foreground">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
              <p className="text-2xl font-bold text-primary mt-2">Premium</p>
              <p className="text-xs text-muted-foreground mt-2">Unlimited access</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Renewal Date</h3>
              <p className="text-2xl font-bold text-foreground mt-2">Mar 15, 2025</p>
              <p className="text-xs text-muted-foreground mt-2">41 days remaining</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Classes Attended</h3>
              <p className="text-2xl font-bold text-accent mt-2">24</p>
              <p className="text-xs text-muted-foreground mt-2">This month</p>
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
          />
          <FormInput
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St, City, State"
          />
        </FormModal>
      </MemberLayout>
    </ProtectedRoute>
  );
}
