export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: "active" | "inactive" | "expired";
  joinDate: string;
  avatar?: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  schedule: string;
  status: "active" | "on-leave" | "inactive";
  clients: number;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: "active" | "inactive";
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

export interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  validFrom: string;
  validTo: string;
  applicablePlans: string[];
  status: "active" | "expired";
  usageCount: number;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  method: "card" | "cash" | "bank-transfer";
  status: "paid" | "pending" | "failed";
  plan: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
  date: string;
  read: boolean;
  target: "all" | "members" | "staff";
}

export const members: Member[] = [
  { id: "1", name: "Alex Johnson", email: "alex@email.com", phone: "+1 234-567-8901", plan: "Premium", status: "active", joinDate: "2024-01-15" },
  { id: "2", name: "Sarah Williams", email: "sarah@email.com", phone: "+1 234-567-8902", plan: "Basic", status: "active", joinDate: "2024-02-20" },
  { id: "3", name: "Mike Chen", email: "mike@email.com", phone: "+1 234-567-8903", plan: "VIP", status: "active", joinDate: "2023-11-10" },
  { id: "4", name: "Emma Davis", email: "emma@email.com", phone: "+1 234-567-8904", plan: "Premium", status: "inactive", joinDate: "2023-09-05" },
  { id: "5", name: "James Wilson", email: "james@email.com", phone: "+1 234-567-8905", plan: "Basic", status: "expired", joinDate: "2023-06-18" },
  { id: "6", name: "Lisa Anderson", email: "lisa@email.com", phone: "+1 234-567-8906", plan: "VIP", status: "active", joinDate: "2024-03-01" },
  { id: "7", name: "David Brown", email: "david@email.com", phone: "+1 234-567-8907", plan: "Premium", status: "active", joinDate: "2024-01-28" },
  { id: "8", name: "Amy Taylor", email: "amy@email.com", phone: "+1 234-567-8908", plan: "Basic", status: "active", joinDate: "2024-04-12" },
];

export const trainers: Trainer[] = [
  { id: "1", name: "John Martinez", email: "john@gym.com", phone: "+1 345-678-9001", specialization: "Strength Training", schedule: "Mon-Fri 6AM-2PM", status: "active", clients: 12 },
  { id: "2", name: "Rachel Kim", email: "rachel@gym.com", phone: "+1 345-678-9002", specialization: "Yoga & Pilates", schedule: "Mon-Sat 8AM-4PM", status: "active", clients: 18 },
  { id: "3", name: "Carlos Rivera", email: "carlos@gym.com", phone: "+1 345-678-9003", specialization: "CrossFit", schedule: "Tue-Sat 7AM-3PM", status: "active", clients: 15 },
  { id: "4", name: "Nina Patel", email: "nina@gym.com", phone: "+1 345-678-9004", specialization: "Cardio & HIIT", schedule: "Mon-Fri 10AM-6PM", status: "on-leave", clients: 10 },
  { id: "5", name: "Tom Fischer", email: "tom@gym.com", phone: "+1 345-678-9005", specialization: "Boxing", schedule: "Mon-Fri 2PM-10PM", status: "active", clients: 8 },
];

export const staff: Staff[] = [
  { id: "1", name: "Maria Lopez", email: "maria@gym.com", phone: "+1 456-789-0001", role: "Receptionist", department: "Front Desk", status: "active" },
  { id: "2", name: "Kevin Park", email: "kevin@gym.com", phone: "+1 456-789-0002", role: "Manager", department: "Operations", status: "active" },
  { id: "3", name: "Sandra White", email: "sandra@gym.com", phone: "+1 456-789-0003", role: "Cleaner", department: "Maintenance", status: "active" },
  { id: "4", name: "Robert Lee", email: "robert@gym.com", phone: "+1 456-789-0004", role: "Accountant", department: "Finance", status: "active" },
  { id: "5", name: "Diane Clark", email: "diane@gym.com", phone: "+1 456-789-0005", role: "Marketing Lead", department: "Marketing", status: "inactive" },
];

export const membershipPlans: MembershipPlan[] = [
  { id: "1", name: "Basic", price: 29, duration: "Monthly", features: ["Gym Access", "Locker Room", "Free WiFi"] },
  { id: "2", name: "Premium", price: 59, duration: "Monthly", features: ["Gym Access", "Locker Room", "Free WiFi", "Group Classes", "Sauna"], popular: true },
  { id: "3", name: "VIP", price: 99, duration: "Monthly", features: ["Gym Access", "Locker Room", "Free WiFi", "Group Classes", "Sauna", "Personal Trainer", "Nutrition Plan", "Priority Booking"] },
];

export const discounts: Discount[] = [
  { id: "1", code: "NEWYEAR25", type: "percentage", value: 25, validFrom: "2025-01-01", validTo: "2025-01-31", applicablePlans: ["Premium", "VIP"], status: "expired", usageCount: 45 },
  { id: "2", code: "SUMMER10", type: "percentage", value: 10, validFrom: "2025-06-01", validTo: "2025-08-31", applicablePlans: ["Basic", "Premium", "VIP"], status: "active", usageCount: 12 },
  { id: "3", code: "FLAT50", type: "fixed", value: 50, validFrom: "2025-03-01", validTo: "2025-12-31", applicablePlans: ["VIP"], status: "active", usageCount: 8 },
];

export const payments: Payment[] = [
  { id: "1", memberId: "1", memberName: "Alex Johnson", amount: 59, date: "2025-02-01", method: "card", status: "paid", plan: "Premium" },
  { id: "2", memberId: "2", memberName: "Sarah Williams", amount: 29, date: "2025-02-01", method: "card", status: "paid", plan: "Basic" },
  { id: "3", memberId: "3", memberName: "Mike Chen", amount: 99, date: "2025-02-01", method: "bank-transfer", status: "paid", plan: "VIP" },
  { id: "4", memberId: "4", memberName: "Emma Davis", amount: 59, date: "2025-01-15", method: "card", status: "failed", plan: "Premium" },
  { id: "5", memberId: "5", memberName: "James Wilson", amount: 29, date: "2025-01-10", method: "cash", status: "pending", plan: "Basic" },
  { id: "6", memberId: "6", memberName: "Lisa Anderson", amount: 99, date: "2025-02-05", method: "card", status: "paid", plan: "VIP" },
  { id: "7", memberId: "7", memberName: "David Brown", amount: 59, date: "2025-02-03", method: "bank-transfer", status: "paid", plan: "Premium" },
  { id: "8", memberId: "8", memberName: "Amy Taylor", amount: 29, date: "2025-02-07", method: "card", status: "pending", plan: "Basic" },
];

export const notifications: Notification[] = [
  { id: "1", title: "New Member Signup", message: "Amy Taylor has joined with a Basic plan.", type: "success", date: "2025-02-07", read: false, target: "staff" },
  { id: "2", title: "Payment Failed", message: "Payment for Emma Davis has failed. Please follow up.", type: "alert", date: "2025-01-15", read: true, target: "staff" },
  { id: "3", title: "Maintenance Scheduled", message: "Pool area will be closed for maintenance on Feb 15.", type: "warning", date: "2025-02-08", read: false, target: "all" },
  { id: "4", title: "New Group Class", message: "Zumba classes now available every Wednesday at 6PM.", type: "info", date: "2025-02-06", read: false, target: "members" },
  { id: "5", title: "Trainer On Leave", message: "Nina Patel will be on leave from Feb 10-20.", type: "warning", date: "2025-02-05", read: true, target: "all" },
];

export const memberGrowthData = [
  { month: "Sep", members: 120 },
  { month: "Oct", members: 145 },
  { month: "Nov", members: 162 },
  { month: "Dec", members: 178 },
  { month: "Jan", members: 205 },
  { month: "Feb", members: 234 },
];

export const revenueData = [
  { month: "Sep", revenue: 8500 },
  { month: "Oct", revenue: 9200 },
  { month: "Nov", revenue: 10100 },
  { month: "Dec", revenue: 11400 },
  { month: "Jan", revenue: 12800 },
  { month: "Feb", revenue: 14200 },
];
