// 'use client';

// import React from "react"

// import { useState, Suspense } from 'react';
// import { AdminLayout } from '@/components/layouts/admin-layout';
// import { PrimaryButton, SecondaryButton, FormInput, FormSelect } from '@/components/gym';
// import { FormModal } from '@/components/gym/form-modal';
// import { ConfirmationDialog } from '@/components/gym/confirmation-dialog';
// import { Plus, Search, Edit, Trash2, Users, Clock, Calendar } from 'lucide-react';

// interface GymClass {
//   id: string;
//   name: string;
//   instructor: string;
//   schedule: string;
//   time: string;
//   duration: string;
//   capacity: number;
//   enrolled: number;
//   status: 'active' | 'cancelled' | 'full';
//   category: string;
// }

// const mockClasses: GymClass[] = [
//   {
//     id: '1',
//     name: 'Morning HIIT',
//     instructor: 'Sarah Johnson',
//     schedule: 'Mon, Wed, Fri',
//     time: '6:00 AM',
//     duration: '45 min',
//     capacity: 20,
//     enrolled: 18,
//     status: 'active',
//     category: 'Cardio',
//   },
//   {
//     id: '2',
//     name: 'Power Yoga',
//     instructor: 'Mike Chen',
//     schedule: 'Tue, Thu',
//     time: '7:00 AM',
//     duration: '60 min',
//     capacity: 15,
//     enrolled: 15,
//     status: 'full',
//     category: 'Flexibility',
//   },
// ];

// export default function AdminClassesPage() {
//   const [classes, setClasses] = useState<GymClass[]>(mockClasses);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     instructor: '',
//     schedule: '',
//     time: '',
//     duration: '',
//     capacity: '',
//     category: '',
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const newClass: GymClass = {
//       id: String(classes.length + 1),
//       name: formData.name,
//       instructor: formData.instructor,
//       schedule: formData.schedule,
//       time: formData.time,
//       duration: formData.duration,
//       capacity: parseInt(formData.capacity),
//       enrolled: 0,
//       status: 'active',
//       category: formData.category,
//     };

//     setClasses([...classes, newClass]);
//     setIsAddModalOpen(false);
//     setFormData({ name: '', instructor: '', schedule: '', time: '', duration: '', capacity: '', category: '' });
//   };

//   const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!selectedClass) return;

//     setClasses(
//       classes.map((c) =>
//         c.id === selectedClass.id
//           ? {
//               ...c,
//               name: formData.name,
//               instructor: formData.instructor,
//               schedule: formData.schedule,
//               time: formData.time,
//               duration: formData.duration,
//               capacity: parseInt(formData.capacity),
//               category: formData.category,
//             }
//           : c
//       )
//     );

//     setIsEditModalOpen(false);
//     setSelectedClass(null);
//     setFormData({ name: '', instructor: '', schedule: '', time: '', duration: '', capacity: '', category: '' });
//   };

//   const handleDelete = (id: string) => {
//     setClasses(classes.filter((c) => c.id !== id));
//     setDeletingId(null);
//   };

//   const openEditModal = (gymClass: GymClass) => {
//     setSelectedClass(gymClass);
//     setFormData({
//       name: gymClass.name,
//       instructor: gymClass.instructor,
//       schedule: gymClass.schedule,
//       time: gymClass.time,
//       duration: gymClass.duration,
//       capacity: String(gymClass.capacity),
//       category: gymClass.category,
//     });
//     setIsEditModalOpen(true);
//   };

//   const filteredClasses = classes.filter((c) =>
//     c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const categoryOptions = [
//     { value: 'Cardio', label: 'Cardio' },
//     { value: 'Strength', label: 'Strength' },
//     { value: 'Flexibility', label: 'Flexibility' },
//     { value: 'Balance', label: 'Balance' },
//   ];

//   return (
//     <AdminLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Classes</h1>
//             <p className="text-muted-foreground mt-2">Manage gym classes and schedules</p>
//           </div>
//           <PrimaryButton onClick={() => setIsAddModalOpen(true)} className="gap-2">
//             <Plus className="w-4 h-4" />
//             Add Class
//           </PrimaryButton>
//         </div>

//         {/* Search Bar */}
//         <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2.5">
//           <Search className="w-5 h-5 text-muted-foreground" />
//           <input
//             type="text"
//             placeholder="Search by class name or instructor..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
//           />
//         </div>

//         {/* Classes Table */}
//         <div className="bg-card border border-border rounded-lg overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-muted border-b border-border">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Class Name</th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Instructor</th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Schedule</th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Time</th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Enrollment</th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-border">
//                 {filteredClasses.map((gymClass) => (
//                   <tr key={gymClass.id} className="hover:bg-muted/50">
//                     <td className="px-6 py-4 text-sm text-foreground font-medium">{gymClass.name}</td>
//                     <td className="px-6 py-4 text-sm text-muted-foreground">{gymClass.instructor}</td>
//                     <td className="px-6 py-4 text-sm text-muted-foreground">{gymClass.schedule}</td>
//                     <td className="px-6 py-4 text-sm text-muted-foreground">{gymClass.time}</td>
//                     <td className="px-6 py-4 text-sm text-muted-foreground">
//                       {gymClass.enrolled}/{gymClass.capacity}
//                     </td>
//                     <td className="px-6 py-4 text-sm">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         gymClass.status === 'active'
//                           ? 'bg-primary/20 text-primary'
//                           : gymClass.status === 'full'
//                             ? 'bg-amber-500/20 text-amber-500'
//                             : 'bg-destructive/20 text-destructive'
//                       }`}>
//                         {gymClass.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => openEditModal(gymClass)}
//                           className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => setDeletingId(gymClass.id)}
//                           className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Add Class Modal */}
//       <FormModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//         title="Add New Class"
//         onSubmit={handleAdd}
//       >
//         <FormInput
//           label="Class Name"
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           required
//         />
//         <FormInput
//           label="Instructor"
//           name="instructor"
//           value={formData.instructor}
//           onChange={handleChange}
//           required
//         />
//         <FormSelect
//           label="Category"
//           name="category"
//           value={formData.category}
//           onChange={handleChange}
//           options={categoryOptions}
//           placeholder="Select category"
//           required
//         />
//         <FormInput
//           label="Schedule"
//           placeholder="e.g., Mon, Wed, Fri"
//           name="schedule"
//           value={formData.schedule}
//           onChange={handleChange}
//           required
//         />
//         <div className="grid grid-cols-2 gap-4">
//           <FormInput
//             label="Time"
//             type="time"
//             name="time"
//             value={formData.time}
//             onChange={handleChange}
//             required
//           />
//           <FormInput
//             label="Duration"
//             placeholder="e.g., 45 min"
//             name="duration"
//             value={formData.duration}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <FormInput
//           label="Capacity"
//           type="number"
//           name="capacity"
//           value={formData.capacity}
//           onChange={handleChange}
//           required
//         />
//       </FormModal>

//       {/* Edit Class Modal */}
//       <FormModal
//         isOpen={isEditModalOpen}
//         onClose={() => setIsEditModalOpen(false)}
//         title="Edit Class"
//         onSubmit={handleEdit}
//       >
//         <FormInput
//           label="Class Name"
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           required
//         />
//         <FormInput
//           label="Instructor"
//           name="instructor"
//           value={formData.instructor}
//           onChange={handleChange}
//           required
//         />
//         <FormSelect
//           label="Category"
//           name="category"
//           value={formData.category}
//           onChange={handleChange}
//           options={categoryOptions}
//           placeholder="Select category"
//           required
//         />
//         <FormInput
//           label="Schedule"
//           placeholder="e.g., Mon, Wed, Fri"
//           name="schedule"
//           value={formData.schedule}
//           onChange={handleChange}
//           required
//         />
//         <div className="grid grid-cols-2 gap-4">
//           <FormInput
//             label="Time"
//             type="time"
//             name="time"
//             value={formData.time}
//             onChange={handleChange}
//             required
//           />
//           <FormInput
//             label="Duration"
//             placeholder="e.g., 45 min"
//             name="duration"
//             value={formData.duration}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <FormInput
//           label="Capacity"
//           type="number"
//           name="capacity"
//           value={formData.capacity}
//           onChange={handleChange}
//           required
//         />
//       </FormModal>

//       {/* Delete Confirmation */}
//       <ConfirmationDialog
//         isOpen={!!deletingId}
//         title="Delete Class"
//         description="Are you sure you want to delete this class? This action cannot be undone."
//         confirmText="Delete"
//         type="danger"
//         onConfirm={() => deletingId && handleDelete(deletingId)}
//         onCancel={() => setDeletingId(null)}
//       />
//     </AdminLayout>
//   );
// }
