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
  Travel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Adventure:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Learning:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Personal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Career:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Romance: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  Health:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  Creative:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Food: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Social: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  Financial: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
  Other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

export const STATUS_COLORS: Record<string, string> = {
  "Not Started":
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "In Progress":
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Completed:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
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
