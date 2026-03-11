export interface BucketItem {
  id: string;
  title: string;
  description: string;
  category: string;
  target_date: string | null;
  status: "Not Started" | "In Progress" | "Completed";
  priority: "High" | "Medium" | "Low";
  created_at: string;
  updated_at: string;
  user_id: string;
  sort_order: number;
  completed_at: string | null;
  photo_url: string | null;
}

export type BucketItemInsert = Omit<
  BucketItem,
  "id" | "created_at" | "updated_at"
>;
export type BucketItemUpdate = Partial<BucketItemInsert>;

export const CATEGORIES = [
  "Travel",
  "Adventure",
  "Learning",
  "Personal",
  "Career",
  "Romance",
  "Health",
  "Creative",
  "Food",
  "Social",
  "Financial",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["Not Started", "In Progress", "Completed"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["High", "Medium", "Low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Travel: "bg-blue-50 text-blue-700 border border-blue-200",
  Adventure: "bg-orange-50 text-orange-700 border border-orange-200",
  Learning: "bg-purple-50 text-purple-700 border border-purple-200",
  Personal: "bg-petal text-rose-gold border border-rose/30",
  Career: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Romance: "bg-blush text-wine border border-rose/30",
  Health: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Creative: "bg-amber-50 text-amber-700 border border-amber-200",
  Food: "bg-red-50 text-red-700 border border-red-200",
  Social: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  Financial: "bg-lime-50 text-lime-700 border border-lime-200",
  Other: "bg-gray-50 text-gray-600 border border-gray-200",
};

// Checklist types
export interface ChecklistGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  checklist_id: string;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-50 text-red-600 border border-red-200",
  Medium: "bg-amber-50 text-amber-600 border border-amber-200",
  Low: "bg-emerald-50 text-emerald-600 border border-emerald-200",
};

export const STATUS_COLORS: Record<string, string> = {
  "Not Started": "bg-gray-50 text-gray-600 border border-gray-200",
  "In Progress": "bg-blue-50 text-blue-600 border border-blue-200",
  Completed: "bg-petal text-rose-gold border border-rose/30",
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  Travel: "✈️",
  Adventure: "🏔️",
  Learning: "📚",
  Personal: "🌟",
  Career: "💼",
  Romance: "💕",
  Health: "💪",
  Creative: "🎨",
  Food: "🍜",
  Social: "👥",
  Financial: "💰",
  Other: "📌",
};
