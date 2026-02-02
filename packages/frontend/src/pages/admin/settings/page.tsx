"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { PrimaryButton, SecondaryButton } from "@/components/gym";
import {
  Building,
  Clock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Save,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Building },
    { id: "hours", label: "Operating Hours", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your gym settings and preferences
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full shrink-0 lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Gym Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Basic information about your gym
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="gymName"
                        className="block text-sm font-medium text-foreground"
                      >
                        Gym Name
                      </label>
                      <input
                        id="gymName"
                        type="text"
                        defaultValue="PowerFit Gym"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="tagline"
                        className="block text-sm font-medium text-foreground"
                      >
                        Tagline
                      </label>
                      <input
                        id="tagline"
                        type="text"
                        defaultValue="Transform Your Body, Transform Your Life"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-foreground"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        defaultValue="State-of-the-art fitness facility with world-class equipment and expert trainers."
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Contact Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    How members can reach you
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="email"
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        defaultValue="info@powerfit.com"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <Phone className="h-4 w-4" />
                        Phone
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address"
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <MapPin className="h-4 w-4" />
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        defaultValue="123 Fitness Street, Workout City, WC 12345"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="website"
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </label>
                      <input
                        id="website"
                        type="url"
                        defaultValue="https://powerfit.com"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </PrimaryButton>
                </div>
              </div>
            )}

            {activeTab === "hours" && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Operating Hours
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set your gym's operating schedule
                </p>

                <div className="mt-6 space-y-4">
                  {[
                    { day: "Monday", open: "05:00", close: "23:00" },
                    { day: "Tuesday", open: "05:00", close: "23:00" },
                    { day: "Wednesday", open: "05:00", close: "23:00" },
                    { day: "Thursday", open: "05:00", close: "23:00" },
                    { day: "Friday", open: "05:00", close: "22:00" },
                    { day: "Saturday", open: "07:00", close: "20:00" },
                    { day: "Sunday", open: "08:00", close: "18:00" },
                  ].map((schedule) => (
                    <div
                      key={schedule.day}
                      className="flex items-center gap-4 border-b border-border pb-4 last:border-0"
                    >
                      <span className="w-28 font-medium text-foreground">
                        {schedule.day}
                      </span>
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="time"
                          defaultValue={schedule.open}
                          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          aria-label={`${schedule.day} opening time`}
                        />
                        <span className="text-muted-foreground">to</span>
                        <input
                          type="time"
                          defaultValue={schedule.close}
                          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          aria-label={`${schedule.day} closing time`}
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          Open
                        </span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <PrimaryButton>
                    <Save className="mr-2 h-4 w-4" />
                    Save Hours
                  </PrimaryButton>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure email notification preferences
                  </p>

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        id: "new-member",
                        label: "New member registration",
                        description: "Receive email when a new member signs up",
                      },
                      {
                        id: "class-booking",
                        label: "Class booking notifications",
                        description:
                          "Get notified when classes are booked or cancelled",
                      },
                      {
                        id: "payment",
                        label: "Payment notifications",
                        description:
                          "Receive alerts for successful and failed payments",
                      },
                      {
                        id: "membership-expiry",
                        label: "Membership expiry alerts",
                        description:
                          "Get notified before member subscriptions expire",
                      },
                      {
                        id: "daily-report",
                        label: "Daily summary report",
                        description:
                          "Receive a daily summary of gym activity",
                      },
                    ].map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start justify-between border-b border-border pb-4 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {notification.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-foreground after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </PrimaryButton>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Password Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Update your admin password
                  </p>

                  <div className="mt-6 max-w-md space-y-4">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-foreground"
                      >
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-foreground"
                      >
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-foreground"
                      >
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <PrimaryButton>Update Password</PrimaryButton>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          2FA Status
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Two-factor authentication is currently disabled
                        </p>
                      </div>
                      <SecondaryButton>Enable 2FA</SecondaryButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Payment Gateway
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure payment processing settings
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="stripeKey"
                        className="block text-sm font-medium text-foreground"
                      >
                        Stripe Publishable Key
                      </label>
                      <input
                        id="stripeKey"
                        type="text"
                        placeholder="pk_live_..."
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="stripeSecret"
                        className="block text-sm font-medium text-foreground"
                      >
                        Stripe Secret Key
                      </label>
                      <input
                        id="stripeSecret"
                        type="password"
                        placeholder="sk_live_..."
                        className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Invoice Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize invoice generation
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="invoicePrefix"
                        className="block text-sm font-medium text-foreground"
                      >
                        Invoice Prefix
                      </label>
                      <input
                        id="invoicePrefix"
                        type="text"
                        defaultValue="PF-"
                        className="mt-1 w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="taxRate"
                        className="block text-sm font-medium text-foreground"
                      >
                        Tax Rate (%)
                      </label>
                      <input
                        id="taxRate"
                        type="number"
                        defaultValue="10"
                        className="mt-1 w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton>
                    <Save className="mr-2 h-4 w-4" />
                    Save Billing Settings
                  </PrimaryButton>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Brand Colors
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize your gym's brand appearance
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="primaryColor"
                        className="block text-sm font-medium text-foreground"
                      >
                        Primary Color
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id="primaryColor"
                          type="color"
                          defaultValue="#22c55e"
                          className="h-10 w-10 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          defaultValue="#22c55e"
                          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="accentColor"
                        className="block text-sm font-medium text-foreground"
                      >
                        Accent Color
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id="accentColor"
                          type="color"
                          defaultValue="#4ade80"
                          className="h-10 w-10 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          defaultValue="#4ade80"
                          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Logo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your gym's logo
                  </p>

                  <div className="mt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                        <span className="text-2xl font-bold text-primary">
                          PF
                        </span>
                      </div>
                      <div>
                        <SecondaryButton>Upload Logo</SecondaryButton>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Recommended: 200x200px, PNG or SVG
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton>
                    <Save className="mr-2 h-4 w-4" />
                    Save Appearance
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
