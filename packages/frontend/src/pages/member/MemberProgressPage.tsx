'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { MemberLayout } from '@/components/layouts/member-layout';
import { PrimaryButton, StatCard } from '@/components/gym';
import { FormModal } from '@/components/gym/form-modal';
import { FormInput } from '@/components/gym/form-input';
import { TrendingUp, Plus, LineChart } from 'lucide-react';

interface ProgressEntry {
  id: string;
  date: string;
  weight: number;
  bodyFat: number;
  workoutsCompleted: number;
  notes: string;
}

export default function MemberProgressPage() {
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([
    { id: '1', date: '2025-02-01', weight: 180, bodyFat: 18.5, workoutsCompleted: 4, notes: 'Feeling strong' },
    { id: '2', date: '2025-01-25', weight: 182, bodyFat: 19.2, workoutsCompleted: 5, notes: 'Good week' },
    { id: '3', date: '2025-01-18', weight: 185, bodyFat: 20.1, workoutsCompleted: 3, notes: 'Started training' },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    workoutsCompleted: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newEntry: ProgressEntry = {
      id: String(progressEntries.length + 1),
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(formData.weight),
      bodyFat: parseFloat(formData.bodyFat),
      workoutsCompleted: parseInt(formData.workoutsCompleted),
      notes: formData.notes,
    };

    setProgressEntries((prev) => [newEntry, ...prev]);
    setFormData({ weight: '', bodyFat: '', workoutsCompleted: '', notes: '' });
    setIsAddModalOpen(false);
  };

  const latestEntry = progressEntries[0];
  const previousEntry = progressEntries[1];
  const weightChange = previousEntry ? (latestEntry.weight - previousEntry.weight).toFixed(1) : '0';
  const bodyFatChange = previousEntry ? (latestEntry.bodyFat - previousEntry.bodyFat).toFixed(1) : '0';

  return (
    <ProtectedRoute requiredRole="member">
      <MemberLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Progress</h1>
              <p className="text-muted-foreground mt-2">Track your fitness journey</p>
            </div>
            <PrimaryButton onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Entry
            </PrimaryButton>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<LineChart className="w-6 h-6" />}
              label="Current Weight"
              value={`${latestEntry.weight} lbs`}
              change={weightChange > 0 ? `+${weightChange}` : weightChange}
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Body Fat %"
              value={`${latestEntry.bodyFat}%`}
              change={bodyFatChange > 0 ? `+${bodyFatChange}` : bodyFatChange}
            />
            <StatCard
              icon={<Plus className="w-6 h-6" />}
              label="Workouts This Month"
              value={String(progressEntries.filter((e) => {
                const entryDate = new Date(e.date);
                return entryDate.getMonth() === new Date().getMonth();
              }).reduce((sum, e) => sum + e.workoutsCompleted, 0))}
            />
            <StatCard
              icon={<LineChart className="w-6 h-6" />}
              label="Total Entries"
              value={String(progressEntries.length)}
            />
          </div>

          {/* Progress History */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Progress History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Weight</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Body Fat</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Workouts</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {progressEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm text-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{entry.weight} lbs</td>
                      <td className="px-6 py-4 text-sm text-foreground">{entry.bodyFat}%</td>
                      <td className="px-6 py-4 text-sm text-foreground">{entry.workoutsCompleted}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Entry Modal */}
        <FormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Progress Entry"
          onSubmit={handleSubmit}
        >
          <FormInput
            label="Weight (lbs)"
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            step="0.1"
            required
          />
          <FormInput
            label="Body Fat %"
            type="number"
            name="bodyFat"
            value={formData.bodyFat}
            onChange={handleChange}
            step="0.1"
            required
          />
          <FormInput
            label="Workouts Completed"
            type="number"
            name="workoutsCompleted"
            value={formData.workoutsCompleted}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="How are you feeling? Any achievements?"
              rows={3}
            />
          </div>
        </FormModal>
      </MemberLayout>
    </ProtectedRoute>
  );
}
