/**
 * Application-wide constants
 */

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  MEMBER: "member",
  TRAINER: "trainer",
};

// Member status
export const MEMBER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
};

// Class status
export const CLASS_STATUS = {
  SCHEDULED: "scheduled",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Attendance types
export const ATTENDANCE_TYPE = {
  GYM_ENTRY: "gym_entry",
  CLASS_ATTENDANCE: "class_attendance",
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER: "user",
};

// Query keys for TanStack Query
export const QUERY_KEYS = {
  MEMBERS: "members",
  TRAINERS: "trainers",
  CLASSES: "classes",
  MEMBERSHIPS: "memberships",
  ATTENDANCE: "attendance",
  WORKOUTS: "workouts",
  CURRENT_USER: "currentUser",
};

// Cache times (in milliseconds)
export const CACHE_TIME = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 10 * 60 * 1000, // 10 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
};
