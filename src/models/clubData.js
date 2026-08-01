/*
 * File Path: src/models/clubData.js
 * Description: Data schemas, default workout/diet templates, backend enum mappings, and role configurations for HCMS.
 * Dynamic Data: Static dummy arrays have been removed so live data is populated directly from Spring Boot REST APIs.
 * Used By: Controllers (useClubDashboard), Navigation Shell, and UI Views.
 */
import { Dumbbell, LayoutDashboard, UsersRound, WalletCards } from 'lucide-react';

// Backend Enum Constants (matching Spring Boot Java Enums: RoleName, SubscriptionStatus, RequestStatus)
export const RoleName = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  TRAINER: 'TRAINER'
};

export const SubscriptionStatus = {
  ACTIVE: 'Active',
  RENEWAL_DUE: 'Renewal Due',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled'
};

export const RequestStatus = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected'
};

export const roleMeta = {
  admin: { label: 'Admin', title: 'Admin Panel', dashboard: 'admin-dashboard', description: 'Manage members, subscription plans, and trainer profiles.' },
  member: { label: 'Member', title: 'Member Portal', dashboard: 'member-dashboard', description: 'View assigned day-by-day workout routines, custom diet plans, and request trainers.' },
  trainer: { label: 'Trainer', title: 'Trainer Workspace', dashboard: 'trainer-dashboard', description: 'Manage assigned clients, accept member requests, and build workout & diet plans.' }
};

const navigationItems = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'member-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'trainer-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'members', label: 'Members', icon: UsersRound },
  { id: 'plans', label: 'Plans', icon: WalletCards },
  { id: 'trainers', label: 'Trainers', icon: Dumbbell }
];

export const roleNavigation = {
  admin: navigationItems.filter((item) => ['admin-dashboard', 'members', 'plans', 'trainers'].includes(item.id)),
  member: navigationItems.filter((item) => ['member-dashboard', 'plans'].includes(item.id)),
  trainer: navigationItems.filter((item) => ['trainer-dashboard', 'members'].includes(item.id))
};

export const defaultWorkoutPlan = {
  Mon: { title: 'Chest & Triceps Focus', exercises: ['Barbell Bench Press (4x10)', 'Incline Dumbbell Press (3x12)', 'Triceps Rope Pushdowns (3x15)'] },
  Tue: { title: 'Back & Biceps Strength', exercises: ['Lat Pulldowns (4x10)', 'Seated Cable Rows (3x12)', 'Barbell Bicep Curls (3x12)'] },
  Wed: { title: 'Legs & Core Power', exercises: ['Barbell Squats (4x10)', 'Leg Extension & Press (3x12)', 'Plank & Hanging Leg Raises (3x60s)'] },
  Thu: { title: 'Rest & Mobility Recovery', exercises: ['Light Stretching (15 mins)', 'Foam Rolling & Hydration'] },
  Fri: { title: 'Shoulders & Upper Core', exercises: ['Overhead Dumbbell Press (4x10)', 'Lateral & Rear Delt Raises (3x15)', 'Cable Woodchoppers (3x15)'] },
  Sat: { title: 'Full Body HIIT Conditioning', exercises: ['Kettlebell Swings (4x15)', 'Burpees & Mountain Climbers (3x12)', 'Cardio Bike (15 mins)'] },
  Sun: { title: 'Active Recovery', exercises: ['30 Min Light Walk', 'Full Body Mobility Stretch'] }
};

export const defaultDietPlan = {
  breakfast: '3 Scrambled Eggs / Tofu, Oatmeal with Almonds & Berries',
  lunch: '200g Grilled Chicken / Paneer, Brown Rice & Steamed Broccoli',
  snack: 'Greek Yogurt with chia seeds & Green Tea',
  dinner: 'Grilled Fish / Sprouts Salad, Quinoa & Olive Oil Dressing',
  calories: '2,200 kcal',
  water: '3.5 Liters'
};

// Empty fallback arrays replaced by live Spring Boot REST API responses
export const members = [];
export const trainers = [];
export const plans = [];
export const trainerRequests = [];
export const demoUsers = [];
