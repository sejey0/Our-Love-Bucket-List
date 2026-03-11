"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { BucketItem } from "@/types/bucket";
import Header, { Section } from "./Header";
import ChecklistDashboard from "./ChecklistDashboard";

interface BucketList {
  id: string;
  name: string;
  description: string;
  target_date: string | null;
  created_at: string;
}

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [bucketLists, setBucketLists] = useState<BucketList[]>([]);
  const [items, setItems] = useState<BucketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newListDate, setNewListDate] = useState("");
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [viewingList, setViewingList] = useState<BucketList | null>(null);
  const [viewingCompleted, setViewingCompleted] = useState<BucketList | null>(
    null,
  );
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingGalleryItem, setViewingGalleryItem] =
    useState<BucketItem | null>(null);
  const [renamingList, setRenamingList] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [editingListDesc, setEditingListDesc] = useState<string | null>(null);
  const [editListDescValue, setEditListDescValue] = useState("");
  const [editingListDate, setEditingListDate] = useState<string | null>(null);
  const [editListDateValue, setEditListDateValue] = useState("");
  const [deletingList, setDeletingList] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [editNotesValue, setEditNotesValue] = useState("");
  const [editingGalleryTitle, setEditingGalleryTitle] = useState(false);
  const [editGalleryTitleValue, setEditGalleryTitleValue] = useState("");
  const [deletingImageIdx, setDeletingImageIdx] = useState<number | null>(null);
  const [deleteImageConfirm, setDeleteImageConfirm] = useState("");
  const [deletingItem, setDeletingItem] = useState<BucketItem | null>(null);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState("");
  const [editCounts, setEditCounts] = useState<Record<string, number>>({});
  const [completingItem, setCompletingItem] = useState<BucketItem | null>(null);
  const [completeDesc, setCompleteDesc] = useState("");
  const [completePhotos, setCompletePhotos] = useState<string[]>([]);
  const [completeDate, setCompleteDate] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completeFileRef = useRef<HTMLInputElement>(null);

  const fetchBucketLists = useCallback(async () => {
    try {
      const res = await fetch("/api/lists");
      if (!res.ok) throw new Error("Failed to fetch lists");
      const data = await res.json();
      setBucketLists(data);
      try {
        localStorage.setItem("cached-bucket-lists", JSON.stringify(data));
      } catch {
        /* quota exceeded, ignore */
      }

      // Auto-migrate localStorage bucket lists to Supabase (one-time)
      const stored = localStorage.getItem("bucket-lists");
      if (stored) {
        try {
          const localLists: BucketList[] = JSON.parse(stored);
          const serverNames = new Set(data.map((l: BucketList) => l.name));
          const toMigrate = localLists.filter((l) => !serverNames.has(l.name));
          for (const list of toMigrate) {
            await fetch("/api/lists", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: list.name,
                description: list.description,
              }),
            });
          }
          if (toMigrate.length > 0) {
            const refreshRes = await fetch("/api/lists");
            if (refreshRes.ok) {
              const refreshed = await refreshRes.json();
              setBucketLists(refreshed);
            }
          }
        } catch {
          /* ignore migration errors */
        }
        localStorage.removeItem("bucket-lists");
      }
    } catch {
      console.error("Failed to fetch bucket lists");
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/buckets");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch");
      }
      const data = await res.json();
      setItems(data);
      try {
        const lite = data.map((item: BucketItem) => ({
          ...item,
          photo_url: null,
        }));
        localStorage.setItem("cached-items", JSON.stringify(lite));
      } catch {
        /* quota exceeded, ignore */
      }
    } catch (err) {
      console.error("Fetch items error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load cached data instantly, then refresh from server
  useEffect(() => {
    const cachedLists = localStorage.getItem("cached-bucket-lists");
    if (cachedLists) {
      try {
        setBucketLists(JSON.parse(cachedLists));
      } catch {
        /* ignore */
      }
    }
    const cached = localStorage.getItem("cached-items");
    if (cached) {
      try {
        setItems(JSON.parse(cached));
        setIsLoading(false);
      } catch {
        /* ignore bad cache */
      }
    }
    fetchBucketLists();
    fetchItems();
  }, [fetchBucketLists, fetchItems]);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    const tempList: BucketList = {
      id: `temp-${Date.now()}`,
      name: newListName.trim(),
      description: newListDesc.trim(),
      target_date: newListDate || null,
      created_at: new Date().toISOString(),
    };
    setBucketLists((prev) => [...prev, tempList]);
    setNewListName("");
    setNewListDesc("");
    setNewListDate("");
    setShowCreateForm(false);
    toast.success("Bucket list created!");
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tempList.name,
          description: tempList.description,
          target_date: tempList.target_date,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const created = await res.json();
      setBucketLists((prev) =>
        prev.map((l) => (l.id === tempList.id ? created : l)),
      );
    } catch {
      setBucketLists((prev) => prev.filter((l) => l.id !== tempList.id));
      toast.error("Failed to save bucket list");
    }
  };

  const handleDeleteList = async (id: string) => {
    if (deleteConfirm.toLowerCase() !== "i love you") {
      toast.error("Type 'i love you' to confirm deletion");
      return;
    }
    const original = bucketLists;
    setBucketLists(bucketLists.filter((l) => l.id !== id));
    setDeletingList(null);
    setDeleteConfirm("");
    toast.success("Bucket list removed");
    try {
      const res = await fetch(`/api/lists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    } catch {
      setBucketLists(original);
      toast.error("Failed to delete bucket list");
    }
  };

  const getEditCount = (id: string, field: string) =>
    editCounts[`${id}-${field}`] || 0;
  const canEdit = (id: string, field: string) => getEditCount(id, field) < 3;
  const incrementEditCount = (id: string, field: string) => {
    setEditCounts((prev) => ({
      ...prev,
      [`${id}-${field}`]: (prev[`${id}-${field}`] || 0) + 1,
    }));
  };

  const handleRenameList = async (id: string) => {
    if (!renameValue.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const original = bucketLists;
    const oldName = bucketLists.find((l) => l.id === id)?.name;
    const newName = renameValue.trim();
    setBucketLists(
      bucketLists.map((l) => (l.id === id ? { ...l, name: newName } : l)),
    );
    setRenamingList(null);
    setRenameValue("");
    incrementEditCount(id, "name");
    toast.success("Name updated!");
    try {
      const res = await fetch(`/api/lists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error("Failed to rename");
      if (oldName) {
        const itemsToUpdate = items.filter((i) => i.category === oldName);
        for (const item of itemsToUpdate) {
          await fetch(`/api/buckets/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: newName }),
          });
        }
        setItems((prev) =>
          prev.map((i) =>
            i.category === oldName ? { ...i, category: newName } : i,
          ),
        );
      }
    } catch {
      setBucketLists(original);
      toast.error("Failed to update name");
    }
  };

  const handleEditListDesc = async (id: string) => {
    const original = bucketLists;
    const newDesc = editListDescValue.trim();
    setBucketLists(
      bucketLists.map((l) =>
        l.id === id ? { ...l, description: newDesc } : l,
      ),
    );
    setEditingListDesc(null);
    setEditListDescValue("");
    incrementEditCount(id, "description");
    toast.success("Description updated!");
    try {
      const res = await fetch(`/api/lists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newDesc }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setBucketLists(original);
      toast.error("Failed to update description");
    }
  };

  const handleEditListDate = async (id: string) => {
    const original = bucketLists;
    const newDate = editListDateValue || null;
    setBucketLists(
      bucketLists.map((l) =>
        l.id === id ? { ...l, target_date: newDate } : l,
      ),
    );
    setEditingListDate(null);
    setEditListDateValue("");
    incrementEditCount(id, "date");
    toast.success("Date updated!");
    try {
      const res = await fetch(`/api/lists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_date: newDate }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setBucketLists(original);
      toast.error("Failed to update date");
    }
  };

  const handleAddItem = async (category: string) => {
    const title = newItems[category]?.trim();
    if (!title) {
      toast.error("Please enter an item");
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const tempItem: BucketItem = {
      id: tempId,
      title,
      description: "",
      category,
      target_date: null,
      status: "Not Started",
      priority: "Medium",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "default",
      sort_order: items.length,
      completed_at: null,
      photo_url: null,
    };
    setItems((prev) => [...prev, tempItem]);
    setNewItems((prev) => ({ ...prev, [category]: "" }));
    toast.success("Added!");
    try {
      const res = await fetch("/api/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          priority: "Medium",
          status: "Not Started",
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const created = await res.json();
      setItems((prev) => prev.map((i) => (i.id === tempId ? created : i)));
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
      toast.error("Failed to add item");
    }
  };

  const handleToggleComplete = async (item: BucketItem) => {
    if (item.status === "Completed") {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: "Not Started" as const, completed_at: null }
            : i,
        ),
      );
      try {
        const res = await fetch(`/api/buckets/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Not Started", completed_at: null }),
        });
        if (!res.ok) throw new Error("Failed to update");
      } catch {
        setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
        toast.error("Failed to update");
      }
    } else {
      setCompletingItem(item);
      setCompleteDesc("");
      setCompletePhotos([]);
      setCompleteDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleConfirmComplete = async () => {
    if (!completingItem) return;
    const completedAt = completeDate
      ? new Date(completeDate).toISOString()
      : new Date().toISOString();
    const desc = completeDesc.trim() || completingItem.description;
    const photoUrl =
      completePhotos.length > 0
        ? JSON.stringify(completePhotos)
        : completingItem.photo_url;
    const original = completingItem;
    setItems((prev) =>
      prev.map((i) =>
        i.id === completingItem.id
          ? {
              ...i,
              status: "Completed" as const,
              description: desc,
              completed_at: completedAt,
              photo_url: photoUrl,
            }
          : i,
      ),
    );
    toast.success("Marked as done!");
    setCompletingItem(null);
    setCompleteDesc("");
    setCompletePhotos([]);
    try {
      const updateData: Record<string, unknown> = {
        status: "Completed",
        description: desc,
        completed_at: completedAt,
      };
      if (completePhotos.length > 0)
        updateData.photo_url = JSON.stringify(completePhotos);
      const res = await fetch(`/api/buckets/${original.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === original.id ? original : i)),
      );
      toast.error("Failed to complete");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (deleteItemConfirm.toLowerCase() !== "i love you") {
      toast.error("Type 'i love you' to confirm deletion");
      return;
    }
    const original = items.find((i) => i.id === id);
    setDeletingItem(null);
    setDeleteItemConfirm("");
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Removed!");
    try {
      const res = await fetch(`/api/buckets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    } catch {
      if (original) setItems((prev) => [...prev, original]);
      toast.error("Failed to delete");
    }
  };

  const handleEditItem = async (id: string) => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    const original = items.find((i) => i.id === id);
    const newTitle = editTitle.trim();
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, title: newTitle } : i)),
    );
    toast.success("Updated!");
    setEditingItem(null);
    setEditTitle("");
    incrementEditCount(id, "title");
    try {
      const res = await fetch(`/api/buckets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      if (original)
        setItems((prev) => prev.map((i) => (i.id === id ? original : i)));
      toast.error("Failed to update");
    }
  };

  const handleUploadPhoto = (itemId: string, file: File) => {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please select an image or video file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const item = items.find((i) => i.id === itemId);
      const existing = item ? getMediaUrls(item.photo_url) : [];
      const allPhotos = [...existing, base64];
      const newPhotoUrl = JSON.stringify(allPhotos);
      const originalPhotoUrl = item?.photo_url ?? null;
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, photo_url: newPhotoUrl } : i,
        ),
      );
      toast.success("Photo uploaded!");
      try {
        const res = await fetch(`/api/buckets/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo_url: newPhotoUrl }),
        });
        if (!res.ok) throw new Error("Failed to upload");
      } catch {
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, photo_url: originalPhotoUrl } : i,
          ),
        );
        toast.error("Failed to upload photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateNotes = async (itemId: string, newDescription: string) => {
    const original = items.find((i) => i.id === itemId);
    const desc = newDescription.trim();
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, description: desc || "" } : i,
      ),
    );
    if (viewingGalleryItem && viewingGalleryItem.id === itemId) {
      setViewingGalleryItem({
        ...viewingGalleryItem,
        description: desc || "",
      });
    }
    setEditingNotes(false);
    setEditNotesValue("");
    incrementEditCount(itemId, "notes");
    toast.success("Notes updated!");
    try {
      const res = await fetch(`/api/buckets/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc || null }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      if (original)
        setItems((prev) => prev.map((i) => (i.id === itemId ? original : i)));
      toast.error("Failed to update notes");
    }
  };

  const handleUpdateGalleryTitle = async (itemId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const original = items.find((i) => i.id === itemId);
    const title = newTitle.trim();
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, title } : i)),
    );
    if (viewingGalleryItem && viewingGalleryItem.id === itemId) {
      setViewingGalleryItem({ ...viewingGalleryItem, title });
    }
    setEditingGalleryTitle(false);
    setEditGalleryTitleValue("");
    incrementEditCount(itemId, "galleryTitle");
    toast.success("Name updated!");
    try {
      const res = await fetch(`/api/buckets/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      if (original)
        setItems((prev) => prev.map((i) => (i.id === itemId ? original : i)));
      toast.error("Failed to update name");
    }
  };

  const handleDeleteSingleImage = async (itemId: string, imageIdx: number) => {
    if (deleteImageConfirm.toLowerCase() !== "i love you") {
      toast.error("Type 'i love you' to confirm deletion");
      return;
    }
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const mediaUrls = getMediaUrls(item.photo_url);
    const newUrls = mediaUrls.filter((_, idx) => idx !== imageIdx);
    const newPhotoUrl = newUrls.length > 0 ? JSON.stringify(newUrls) : null;
    const originalPhotoUrl = item.photo_url;
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, photo_url: newPhotoUrl } : i)),
    );
    if (viewingGalleryItem && viewingGalleryItem.id === itemId) {
      setViewingGalleryItem({ ...viewingGalleryItem, photo_url: newPhotoUrl });
    }
    setDeletingImageIdx(null);
    setDeleteImageConfirm("");
    toast.success("Image deleted!");
    try {
      const res = await fetch(`/api/buckets/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: newPhotoUrl }),
      });
      if (!res.ok) throw new Error("Failed to delete image");
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, photo_url: originalPhotoUrl } : i,
        ),
      );
      toast.error("Failed to delete image");
    }
  };

  const handleRemovePhoto = async (itemId: string) => {
    const original = items.find((i) => i.id === itemId);
    const originalPhotoUrl = original?.photo_url ?? null;
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, photo_url: null } : i)),
    );
    toast.success("Photo removed");
    try {
      const res = await fetch(`/api/buckets/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: null }),
      });
      if (!res.ok) throw new Error("Failed to remove");
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, photo_url: originalPhotoUrl } : i,
        ),
      );
      toast.error("Failed to remove photo");
    }
  };

  const getItemsByCategory = (category: string) =>
    items.filter((item) => item.category === category);

  const getMediaUrls = (photoUrl: string | null): string[] => {
    if (!photoUrl) return [];
    try {
      const parsed = JSON.parse(photoUrl);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* not JSON */
    }
    return [photoUrl];
  };

  return (
    <div className="min-h-screen relative">
      {/* Floating Hearts Background */}
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>

      <Header
        onLogout={onLogout}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {activeSection === null ? (
        <main
          className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex items-center justify-center"
          style={{ minHeight: "calc(100vh - 80px)" }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gradient mb-2 font-cursive">
              Welcome, My Love
            </h2>
            <p className="text-sm text-rose-gold/60 mb-10">
              What would you like to open?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveSection("bucket")}
                className="group relative px-8 py-6 rounded-3xl border-2 border-rose/20 bg-white hover:border-rose/40 hover:shadow-rose-lg transition-all duration-300 min-w-[200px]"
              >
                <div className="text-4xl mb-3" style={{ color: "#b76e79" }}>
                  &hearts;
                </div>
                <div className="text-base font-bold text-gradient">
                  Bucket List
                </div>
                <p className="text-xs text-rose-gold/50 mt-1">
                  Our dreams &amp; adventures
                </p>
              </button>
              <button
                onClick={() => setActiveSection("checklist")}
                className="group relative px-8 py-6 rounded-3xl border-2 border-rose/20 bg-white hover:border-rose/40 hover:shadow-rose-lg transition-all duration-300 min-w-[200px]"
              >
                <div className="text-4xl mb-3" style={{ color: "#b76e79" }}>
                  &#9745;
                </div>
                <div className="text-base font-bold text-gradient">
                  Checklist
                </div>
                <p className="text-xs text-rose-gold/50 mt-1">
                  Tasks &amp; to-dos together
                </p>
              </button>
            </div>
          </div>
        </main>
      ) : activeSection === "checklist" ? (
        <ChecklistDashboard />
      ) : (
        <>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10">
            {/* Create New Bucket List Button */}
            <div className="mb-6">
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Create Bucket List
                </button>
              ) : (
                <div className="card max-w-md">
                  <h3 className="text-lg font-bold text-gradient mb-3">
                    New Bucket List
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Name (e.g., Travel & Location)"
                      className="input-field text-sm py-2"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newListDesc}
                      onChange={(e) => setNewListDesc(e.target.value)}
                      placeholder="What will you achieve? (e.g., Visit dream destinations)"
                      className="input-field text-sm py-2"
                    />
                    <div>
                      <input
                        type="date"
                        value={newListDate}
                        onChange={(e) => setNewListDate(e.target.value)}
                        className="input-field text-sm py-2 w-full"
                        title="Target date (optional)"
                      />
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: "rgba(183,110,121,0.8)" }}
                      >
                        Target date (optional)
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewListName("");
                          setNewListDesc("");
                          setNewListDate("");
                        }}
                        className="px-4 py-2 text-sm rounded-pill border border-rose/20 text-rose-gold hover:bg-blush transition-colors duration-150"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateList}
                        className="btn-primary text-sm px-5 py-2"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bucket List Cards */}
            {bucketLists.length === 0 && !showCreateForm ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="text-5xl mb-3">&#x2665;</div>
                <h3 className="text-xl font-bold text-gradient mb-2">
                  No bucket lists yet
                </h3>
                <p className="text-xs text-rose-gold/50">
                  Create your first bucket list to start adding dreams
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bucketLists.map((list) => {
                  const categoryItems = getItemsByCategory(list.name);
                  const completedCount = categoryItems.filter(
                    (i) => i.status === "Completed",
                  ).length;

                  return (
                    <div key={list.id} className="card flex flex-col">
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          {/* Editable Name */}
                          {renamingList === list.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleRenameList(list.id);
                              }}
                              className="flex gap-2 mb-1"
                            >
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                placeholder="Name"
                                className="input-field flex-1 text-sm py-1"
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="btn-primary text-xs px-3 py-1"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingList(null);
                                  setRenameValue("");
                                }}
                                className="text-xs px-2 py-1 rounded-pill border border-rose/20 hover:bg-blush transition-colors duration-150"
                                style={{ color: "#b76e79" }}
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <h2 className="text-base font-bold text-gradient truncate">
                                {list.name}
                                {!editingListDate ||
                                editingListDate !== list.id ? (
                                  <>
                                    {list.target_date && (
                                      <span
                                        className="text-xs font-normal ml-1"
                                        style={{
                                          color: "rgba(183,110,121,0.85)",
                                        }}
                                      >
                                        (
                                        {new Date(
                                          list.target_date + "T00:00:00",
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                        )
                                      </span>
                                    )}
                                  </>
                                ) : null}
                              </h2>
                              {canEdit(list.id, "date") &&
                                editingListDate !== list.id && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingListDate(list.id);
                                      setEditListDateValue(
                                        list.target_date || "",
                                      );
                                    }}
                                    className="p-0.5 rounded-lg hover:bg-blush/50 transition-colors duration-150 flex-shrink-0"
                                    style={{ color: "#b76e79" }}
                                    title={`Edit date (${3 - getEditCount(list.id, "date")} left)`}
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                      />
                                    </svg>
                                  </button>
                                )}
                              {canEdit(list.id, "name") && (
                                <button
                                  onClick={() => {
                                    setRenamingList(list.id);
                                    setRenameValue(list.name);
                                  }}
                                  className="p-0.5 rounded-lg hover:bg-blush/50 transition-colors duration-150 flex-shrink-0"
                                  style={{ color: "#b76e79" }}
                                  title={`Edit name (${3 - getEditCount(list.id, "name")} left)`}
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Editable Date */}
                          {editingListDate === list.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleEditListDate(list.id);
                              }}
                              className="flex gap-2 mt-1"
                            >
                              <input
                                type="date"
                                value={editListDateValue}
                                onChange={(e) =>
                                  setEditListDateValue(e.target.value)
                                }
                                className="input-field flex-1 text-xs py-1"
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="btn-primary text-xs px-3 py-1"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingListDate(null);
                                  setEditListDateValue("");
                                }}
                                className="text-xs px-2 py-1 rounded-pill border border-rose/20 hover:bg-blush transition-colors duration-150"
                                style={{ color: "#b76e79" }}
                              >
                                Cancel
                              </button>
                            </form>
                          ) : null}

                          {/* Editable Description */}
                          {editingListDesc === list.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleEditListDesc(list.id);
                              }}
                              className="flex gap-2 mt-1"
                            >
                              <input
                                type="text"
                                value={editListDescValue}
                                onChange={(e) =>
                                  setEditListDescValue(e.target.value)
                                }
                                placeholder="Description"
                                className="input-field flex-1 text-xs py-1"
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="btn-primary text-xs px-3 py-1"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingListDesc(null);
                                  setEditListDescValue("");
                                }}
                                className="text-xs px-2 py-1 rounded-pill border border-rose/20 hover:bg-blush transition-colors duration-150"
                                style={{ color: "#b76e79" }}
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {list.description ? (
                                <p className="text-xs text-rose-gold/50 truncate">
                                  {list.description}
                                </p>
                              ) : (
                                <p className="text-xs text-rose-gold/30 italic">
                                  No description
                                </p>
                              )}
                              {canEdit(list.id, "description") && (
                                <button
                                  onClick={() => {
                                    setEditingListDesc(list.id);
                                    setEditListDescValue(
                                      list.description || "",
                                    );
                                  }}
                                  className="p-0.5 rounded-lg hover:bg-blush/50 transition-colors duration-150 flex-shrink-0"
                                  style={{ color: "#b76e79" }}
                                  title={`Edit description (${3 - getEditCount(list.id, "description")} left)`}
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        {renamingList !== list.id &&
                          editingListDesc !== list.id &&
                          editingListDate !== list.id && (
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              {/* Delete */}
                              <button
                                onClick={() => {
                                  setDeletingList(list.id);
                                  setDeleteConfirm("");
                                }}
                                className="p-1 rounded-lg hover:bg-red-50 transition-colors duration-150"
                                style={{ color: "#722f37" }}
                                title="Delete"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                      </div>

                      {/* Delete Confirmation */}
                      {deletingList === list.id && (
                        <div
                          className="mb-3 p-3 rounded-xl"
                          style={{
                            border: "1px solid rgba(114,47,55,0.2)",
                            backgroundColor: "rgba(114,47,55,0.05)",
                          }}
                        >
                          <p
                            className="text-xs mb-2"
                            style={{ color: "#722f37" }}
                          >
                            Type <strong>i love you</strong> to confirm deletion
                          </p>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleDeleteList(list.id);
                            }}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              value={deleteConfirm}
                              onChange={(e) => setDeleteConfirm(e.target.value)}
                              placeholder="i love you"
                              className="input-field flex-1 text-sm py-1.5"
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="text-xs px-3 py-1.5 rounded-pill text-white transition-colors duration-150"
                              style={{ backgroundColor: "#722f37" }}
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingList(null);
                                setDeleteConfirm("");
                              }}
                              className="text-xs px-3 py-1.5 rounded-pill border border-rose/20 hover:bg-blush transition-colors duration-150"
                              style={{ color: "#b76e79" }}
                            >
                              Cancel
                            </button>
                          </form>
                        </div>
                      )}

                      {/* Created Date */}
                      {list.created_at && (
                        <p className="text-xs text-rose-gold/40 mb-2">
                          Created{" "}
                          {new Date(list.created_at).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-rose-gold/60">
                          {categoryItems.length} goals
                        </span>
                        {categoryItems.length > 0 && (
                          <span
                            className="text-xs font-semibold"
                            style={{ color: "#b76e79" }}
                          >
                            {completedCount} done
                          </span>
                        )}
                      </div>

                      {/* Add Item Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddItem(list.name);
                        }}
                        className="flex gap-2 mb-3"
                      >
                        <input
                          type="text"
                          value={newItems[list.name] || ""}
                          onChange={(e) =>
                            setNewItems((prev) => ({
                              ...prev,
                              [list.name]: e.target.value,
                            }))
                          }
                          placeholder="Add a goal..."
                          className="input-field flex-1 text-sm py-1.5"
                        />
                        <button
                          type="submit"
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          Add
                        </button>
                      </form>

                      {/* View Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingList(list)}
                          className="flex-1 py-2 text-xs font-semibold rounded-pill border border-rose/20 hover:bg-blush transition-colors duration-150"
                          style={{ color: "#b76e79" }}
                        >
                          View List ({categoryItems.length - completedCount})
                        </button>
                        {completedCount > 0 && (
                          <button
                            onClick={() => setViewingCompleted(list)}
                            className="flex-1 py-2 text-xs font-semibold rounded-pill transition-colors duration-150 text-white"
                            style={{ backgroundColor: "#b76e79" }}
                          >
                            Completed ({completedCount})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* View Modal */}
          {viewingList && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  setViewingList(null);
                  setEditingItem(null);
                }}
              />

              {/* Modal */}
              <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div
                  className="px-6 py-4 flex items-center justify-between border-b"
                  style={{ backgroundColor: "#b76e79" }}
                >
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {viewingList.name}
                    </h2>
                    {viewingList.description && (
                      <p className="text-xs text-white/70">
                        {viewingList.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setViewingList(null);
                      setEditingItem(null);
                    }}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Add Item */}
                <div className="px-6 py-3 border-b border-rose/10">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddItem(viewingList.name);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newItems[viewingList.name] || ""}
                      onChange={(e) =>
                        setNewItems((prev) => ({
                          ...prev,
                          [viewingList.name]: e.target.value,
                        }))
                      }
                      placeholder="Add a new goal..."
                      className="input-field flex-1 text-sm py-2"
                    />
                    <button
                      type="submit"
                      className="btn-primary text-xs px-4 py-2"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-3">
                  {isLoading ? (
                    <p className="text-xs text-rose-gold/40 text-center py-4">
                      Loading...
                    </p>
                  ) : getItemsByCategory(viewingList.name).filter(
                      (i) => i.status !== "Completed",
                    ).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-rose-gold/40 italic">
                        No active goals. Add one above!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ul className="space-y-2">
                        {getItemsByCategory(viewingList.name)
                          .filter((i) => i.status !== "Completed")
                          .map((item) => (
                            <li
                              key={item.id}
                              className="p-3 rounded-xl bg-white hover:bg-blush/20 transition-colors duration-150"
                              style={{
                                border: "1px solid rgba(232,160,160,0.15)",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {/* Checkbox */}
                                <button
                                  onClick={() => handleToggleComplete(item)}
                                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150"
                                  style={{
                                    borderColor: "rgba(232,160,160,0.4)",
                                  }}
                                  title="Mark as done"
                                />

                                {/* Title or Edit */}
                                <div className="flex-1 min-w-0">
                                  {editingItem === item.id ? (
                                    <form
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        handleEditItem(item.id);
                                      }}
                                      className="flex gap-2"
                                    >
                                      <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) =>
                                          setEditTitle(e.target.value)
                                        }
                                        className="input-field flex-1 text-sm py-1"
                                        autoFocus
                                      />
                                      <button
                                        type="submit"
                                        className="btn-primary text-xs px-3 py-1"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingItem(null);
                                          setEditTitle("");
                                        }}
                                        className="text-xs px-2 py-1 rounded-pill border border-rose/20 text-rose-gold hover:bg-blush transition-colors duration-150"
                                      >
                                        Cancel
                                      </button>
                                    </form>
                                  ) : (
                                    <span className="text-sm block truncate text-wine">
                                      {item.title}
                                    </span>
                                  )}
                                </div>

                                {/* Actions */}
                                {editingItem !== item.id && (
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {canEdit(item.id, "title") && (
                                      <button
                                        onClick={() => {
                                          setEditingItem(item.id);
                                          setEditTitle(item.title);
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-blush/50 transition-colors duration-150"
                                        style={{ color: "#b76e79" }}
                                        title={`Edit (${3 - getEditCount(item.id, "title")} left)`}
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={1.5}
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
                                          />
                                        </svg>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setDeletingItem(item);
                                        setDeleteItemConfirm("");
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors duration-150"
                                      style={{ color: "#722f37" }}
                                      title="Delete"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                {getItemsByCategory(viewingList.name).filter(
                  (i) => i.status !== "Completed",
                ).length > 0 && (
                  <div
                    className="px-6 py-3 border-t border-rose/10 text-center text-xs font-semibold"
                    style={{ color: "#b76e79" }}
                  >
                    {
                      getItemsByCategory(viewingList.name).filter(
                        (i) => i.status !== "Completed",
                      ).length
                    }{" "}
                    active goals
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed Modal */}
          {viewingCompleted && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setViewingCompleted(null)}
              />

              {/* Modal */}
              <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div
                  className="px-6 py-5 flex items-center justify-between border-b"
                  style={{ backgroundColor: "#b76e79" }}
                >
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {viewingCompleted.name} — Completed
                    </h2>
                    <p className="text-sm text-white/70 mt-0.5">
                      {
                        getItemsByCategory(viewingCompleted.name).filter(
                          (i) => i.status === "Completed",
                        ).length
                      }{" "}
                      goals achieved
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingCompleted(null)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Completed Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {getItemsByCategory(viewingCompleted.name).filter(
                    (i) => i.status === "Completed",
                  ).length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-rose-gold/40 italic">
                        No completed goals yet.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {getItemsByCategory(viewingCompleted.name)
                        .filter((i) => i.status === "Completed")
                        .map((item) => (
                          <li
                            key={item.id}
                            className="p-3.5 rounded-xl bg-petal/50 transition-colors duration-150"
                            style={{
                              border: "1px solid rgba(232,160,160,0.15)",
                            }}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                {/* Completed checkbox */}
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: "#b76e79" }}
                                >
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={3}
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M4.5 12.75l6 6 9-13.5"
                                    />
                                  </svg>
                                </div>

                                {/* Title */}
                                <span className="flex-1 text-sm line-through text-rose-gold/40 truncate">
                                  {item.title}
                                </span>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {/* View gallery */}
                                  <button
                                    onClick={() => setViewingGalleryItem(item)}
                                    className="p-1.5 rounded-lg hover:bg-blush/50 transition-colors duration-150"
                                    style={{ color: "#b76e79" }}
                                    title="View details"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              {/* Date and Description */}
                              {(item.completed_at || item.description) && (
                                <div className="ml-8 mt-1.5 space-y-1">
                                  {item.completed_at && (
                                    <p
                                      className="text-xs"
                                      style={{
                                        color: "rgba(183,110,121,0.8)",
                                      }}
                                    >
                                      Completed on{" "}
                                      {new Date(
                                        item.completed_at,
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  )}
                                  {item.description && (
                                    <p
                                      className="text-xs"
                                      style={{ color: "#722f37" }}
                                    >
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Completion Modal */}
          {completingItem && (
            <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  setCompletingItem(null);
                  setCompleteDesc("");
                  setCompletePhotos([]);
                }}
              />

              {/* Modal */}
              <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div
                  className="px-6 py-4 border-b"
                  style={{ backgroundColor: "#b76e79" }}
                >
                  <h2 className="text-lg font-bold text-white">Mark as Done</h2>
                  <p className="text-xs text-white/70 mt-0.5">
                    {completingItem.title}
                  </p>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                  {/* Date */}
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "#b76e79" }}
                    >
                      Date Completed
                    </label>
                    <input
                      type="date"
                      value={completeDate}
                      onChange={(e) => setCompleteDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors duration-150"
                      style={{
                        backgroundColor: "rgba(183,110,121,0.08)",
                        border: "1px solid rgba(183,110,121,0.15)",
                        color: "#722f37",
                      }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "#b76e79" }}
                    >
                      Description / Notes
                    </label>
                    <textarea
                      value={completeDesc}
                      onChange={(e) => setCompleteDesc(e.target.value)}
                      placeholder="How was the experience? Any memorable moments..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-colors duration-150"
                      style={{
                        border: "1px solid rgba(183,110,121,0.2)",
                        color: "#722f37",
                      }}
                    />
                  </div>

                  {/* Photos / Videos Upload */}
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "#b76e79" }}
                    >
                      Photos / Videos (optional)
                    </label>
                    {completePhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {completePhotos.map((photo, idx) => (
                          <div key={idx} className="relative group">
                            {photo.startsWith("data:video/") ? (
                              <video
                                src={photo}
                                className="w-full h-24 object-cover rounded-lg"
                                style={{
                                  border: "1px solid rgba(183,110,121,0.2)",
                                }}
                              />
                            ) : (
                              <img
                                src={photo}
                                alt={`Upload ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                                style={{
                                  border: "1px solid rgba(183,110,121,0.2)",
                                }}
                              />
                            )}
                            <button
                              onClick={() =>
                                setCompletePhotos((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => completeFileRef.current?.click()}
                      className="w-full py-4 rounded-xl text-sm flex flex-col items-center gap-1 transition-colors duration-150 hover:bg-blush/30"
                      style={{
                        border: "1px dashed rgba(183,110,121,0.3)",
                        color: "rgba(183,110,121,0.8)",
                      }}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                        />
                      </svg>
                      {completePhotos.length > 0
                        ? "Add more photos or videos"
                        : "Upload a photo or video"}
                    </button>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-rose/10 flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setCompletingItem(null);
                      setCompleteDesc("");
                      setCompletePhotos([]);
                    }}
                    className="px-4 py-2 text-sm rounded-pill border border-rose/20 hover:bg-blush transition-colors duration-150"
                    style={{ color: "#b76e79" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmComplete}
                    className="px-5 py-2 text-sm font-semibold rounded-pill text-white transition-colors duration-150 hover:opacity-90"
                    style={{ backgroundColor: "#b76e79" }}
                  >
                    Mark as Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Per-Item Gallery Modal */}
          {viewingGalleryItem && (
            <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  setViewingGalleryItem(null);
                  setEditingNotes(false);
                  setEditNotesValue("");
                  setEditingGalleryTitle(false);
                  setEditGalleryTitleValue("");
                  setDeletingImageIdx(null);
                  setDeleteImageConfirm("");
                }}
              />

              {/* Modal */}
              <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div
                  className="px-6 py-5 flex items-center justify-between border-b"
                  style={{ backgroundColor: "#b76e79" }}
                >
                  <div className="flex-1 min-w-0 mr-3">
                    {editingGalleryTitle ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateGalleryTitle(
                            viewingGalleryItem.id,
                            editGalleryTitleValue,
                          );
                        }}
                        className="space-y-1.5"
                      >
                        <input
                          type="text"
                          value={editGalleryTitleValue}
                          onChange={(e) =>
                            setEditGalleryTitleValue(e.target.value)
                          }
                          className="w-full text-base font-bold rounded-lg px-2 py-1 text-wine"
                          style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="text-xs px-3 py-1 rounded-pill font-semibold"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.9)",
                              color: "#b76e79",
                            }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingGalleryTitle(false);
                              setEditGalleryTitleValue("");
                            }}
                            className="text-xs px-3 py-1 rounded-pill text-white/70 hover:text-white"
                            style={{
                              border: "1px solid rgba(255,255,255,0.4)",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-white truncate">
                            {viewingGalleryItem.title}
                          </h2>
                          {canEdit(viewingGalleryItem.id, "galleryTitle") && (
                            <button
                              onClick={() => {
                                setEditingGalleryTitle(true);
                                setEditGalleryTitleValue(
                                  viewingGalleryItem.title,
                                );
                              }}
                              className="p-1 rounded-lg hover:bg-white/20 transition-colors duration-150 flex-shrink-0"
                              title={`Edit name (${3 - getEditCount(viewingGalleryItem.id, "galleryTitle")} left)`}
                            >
                              <svg
                                className="w-3.5 h-3.5 text-white/70"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                        {viewingGalleryItem.completed_at && (
                          <p className="text-sm text-white/70 mt-0.5">
                            Completed on{" "}
                            {new Date(
                              viewingGalleryItem.completed_at,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setViewingGalleryItem(null);
                      setEditingNotes(false);
                      setEditNotesValue("");
                      setEditingGalleryTitle(false);
                      setEditGalleryTitleValue("");
                      setDeletingImageIdx(null);
                      setDeleteImageConfirm("");
                    }}
                    className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {/* Description / Notes (Editable) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "#b76e79" }}
                      >
                        Notes
                      </p>
                      {!editingNotes &&
                        canEdit(viewingGalleryItem.id, "notes") && (
                          <button
                            onClick={() => {
                              setEditingNotes(true);
                              setEditNotesValue(
                                viewingGalleryItem.description || "",
                              );
                            }}
                            className="p-1 rounded-lg hover:bg-blush/50 transition-colors duration-150"
                            style={{ color: "#b76e79" }}
                            title={`Edit notes (${3 - getEditCount(viewingGalleryItem.id, "notes")} left)`}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
                              />
                            </svg>
                          </button>
                        )}
                    </div>
                    {editingNotes ? (
                      <div className="space-y-2">
                        <textarea
                          value={editNotesValue}
                          onChange={(e) => setEditNotesValue(e.target.value)}
                          className="input-field w-full text-sm py-2 min-h-[80px] resize-y"
                          placeholder="Add notes..."
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditingNotes(false);
                              setEditNotesValue("");
                            }}
                            className="text-xs px-3 py-1.5 rounded-pill border border-rose/20 hover:bg-blush transition-colors duration-150"
                            style={{ color: "#b76e79" }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateNotes(
                                viewingGalleryItem.id,
                                editNotesValue,
                              )
                            }
                            className="btn-primary text-xs px-4 py-1.5"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : viewingGalleryItem.description ? (
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "#722f37" }}
                      >
                        {viewingGalleryItem.description}
                      </p>
                    ) : (
                      <p
                        className={`text-sm italic ${canEdit(viewingGalleryItem.id, "notes") ? "cursor-pointer hover:underline" : ""}`}
                        style={{ color: "rgba(183,110,121,0.65)" }}
                        onClick={() => {
                          if (canEdit(viewingGalleryItem.id, "notes")) {
                            setEditingNotes(true);
                            setEditNotesValue("");
                          }
                        }}
                      >
                        {canEdit(viewingGalleryItem.id, "notes")
                          ? "No notes yet. Click to add."
                          : "No notes."}
                      </p>
                    )}
                  </div>

                  {/* Media Gallery */}
                  {(() => {
                    const mediaUrls = getMediaUrls(
                      viewingGalleryItem.photo_url,
                    );
                    const images = mediaUrls.filter(
                      (url) => !url.startsWith("data:video/"),
                    );
                    const videos = mediaUrls.filter((url) =>
                      url.startsWith("data:video/"),
                    );

                    if (mediaUrls.length === 0) return null;

                    return (
                      <div className="space-y-4">
                        {/* Images */}
                        {images.length > 0 && (
                          <div>
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: "#b76e79" }}
                            >
                              Images ({images.length})
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              {images.map((url, idx) => {
                                const actualIdx = getMediaUrls(
                                  viewingGalleryItem.photo_url,
                                ).indexOf(url);
                                return (
                                  <div key={idx} className="relative group">
                                    <div
                                      className="rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-colors duration-150"
                                      style={{
                                        border:
                                          "1px solid rgba(232,160,160,0.2)",
                                      }}
                                      onClick={() => setViewingImage(url)}
                                    >
                                      <img
                                        src={url}
                                        alt={`${viewingGalleryItem.title} ${idx + 1}`}
                                        className="w-full h-36 object-cover"
                                      />
                                    </div>
                                    {/* Delete Image Button */}
                                    <button
                                      onClick={() => {
                                        setDeletingImageIdx(actualIdx);
                                        setDeleteImageConfirm("");
                                      }}
                                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/80 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
                                      style={{ color: "#722f37" }}
                                      title="Delete image"
                                    >
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                    {/* Delete Confirmation */}
                                    {deletingImageIdx === actualIdx && (
                                      <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center p-2 z-10">
                                        <p
                                          className="text-xs mb-1.5 text-center"
                                          style={{ color: "#722f37" }}
                                        >
                                          Type <strong>i love you</strong>
                                        </p>
                                        <input
                                          type="text"
                                          value={deleteImageConfirm}
                                          onChange={(e) =>
                                            setDeleteImageConfirm(
                                              e.target.value,
                                            )
                                          }
                                          placeholder="i love you"
                                          className="input-field text-xs py-1 px-2 w-full mb-1.5"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                              handleDeleteSingleImage(
                                                viewingGalleryItem.id,
                                                actualIdx,
                                              );
                                          }}
                                        />
                                        <div className="flex gap-1.5">
                                          <button
                                            onClick={() =>
                                              handleDeleteSingleImage(
                                                viewingGalleryItem.id,
                                                actualIdx,
                                              )
                                            }
                                            className="text-xs px-2.5 py-1 rounded-pill text-white"
                                            style={{
                                              backgroundColor: "#722f37",
                                            }}
                                          >
                                            Delete
                                          </button>
                                          <button
                                            onClick={() => {
                                              setDeletingImageIdx(null);
                                              setDeleteImageConfirm("");
                                            }}
                                            className="text-xs px-2.5 py-1 rounded-pill border border-rose/20 hover:bg-blush"
                                            style={{ color: "#b76e79" }}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Videos */}
                        {videos.length > 0 && (
                          <div>
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: "#b76e79" }}
                            >
                              Videos ({videos.length})
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              {videos.map((url, idx) => {
                                const actualIdx = getMediaUrls(
                                  viewingGalleryItem.photo_url,
                                ).indexOf(url);
                                return (
                                  <div key={idx} className="relative group">
                                    <div
                                      className="rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-colors duration-150"
                                      style={{
                                        border:
                                          "1px solid rgba(232,160,160,0.2)",
                                      }}
                                      onClick={() => setViewingImage(url)}
                                    >
                                      <div className="relative">
                                        <video
                                          src={url}
                                          className="w-full h-36 object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                          <svg
                                            className="w-8 h-8 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path d="M8 5v14l11-7z" />
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Delete Video Button */}
                                    <button
                                      onClick={() => {
                                        setDeletingImageIdx(actualIdx);
                                        setDeleteImageConfirm("");
                                      }}
                                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/80 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
                                      style={{ color: "#722f37" }}
                                      title="Delete video"
                                    >
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                    {/* Delete Confirmation */}
                                    {deletingImageIdx === actualIdx && (
                                      <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center p-2 z-10">
                                        <p
                                          className="text-xs mb-1.5 text-center"
                                          style={{ color: "#722f37" }}
                                        >
                                          Type <strong>i love you</strong>
                                        </p>
                                        <input
                                          type="text"
                                          value={deleteImageConfirm}
                                          onChange={(e) =>
                                            setDeleteImageConfirm(
                                              e.target.value,
                                            )
                                          }
                                          placeholder="i love you"
                                          className="input-field text-xs py-1 px-2 w-full mb-1.5"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                              handleDeleteSingleImage(
                                                viewingGalleryItem.id,
                                                actualIdx,
                                              );
                                          }}
                                        />
                                        <div className="flex gap-1.5">
                                          <button
                                            onClick={() =>
                                              handleDeleteSingleImage(
                                                viewingGalleryItem.id,
                                                actualIdx,
                                              )
                                            }
                                            className="text-xs px-2.5 py-1 rounded-pill text-white"
                                            style={{
                                              backgroundColor: "#722f37",
                                            }}
                                          >
                                            Delete
                                          </button>
                                          <button
                                            onClick={() => {
                                              setDeletingImageIdx(null);
                                              setDeleteImageConfirm("");
                                            }}
                                            className="text-xs px-2.5 py-1 rounded-pill border border-rose/20 hover:bg-blush"
                                            style={{ color: "#b76e79" }}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Empty state */}
                  {!viewingGalleryItem.description &&
                    getMediaUrls(viewingGalleryItem.photo_url).length === 0 && (
                      <div className="text-center py-8">
                        <p
                          className="text-sm italic"
                          style={{ color: "rgba(183,110,121,0.65)" }}
                        >
                          No details or media for this goal yet.
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0 && uploadingItemId) {
                const itemId = uploadingItemId;
                const fileArray = Array.from(files);
                let processed = 0;
                const newBase64s: string[] = [];

                fileArray.forEach((file) => {
                  if (
                    !file.type.startsWith("image/") &&
                    !file.type.startsWith("video/")
                  ) {
                    toast.error(`${file.name} is not an image or video`);
                    processed++;
                    return;
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    toast.error(`${file.name} is over 10MB`);
                    processed++;
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = async () => {
                    newBase64s.push(reader.result as string);
                    processed++;
                    if (
                      processed === fileArray.length &&
                      newBase64s.length > 0
                    ) {
                      const item = items.find((i) => i.id === itemId);
                      const existing = item ? getMediaUrls(item.photo_url) : [];
                      const originalPhotoUrl = item?.photo_url ?? null;
                      const allPhotos = [...existing, ...newBase64s];
                      const newPhotoUrl = JSON.stringify(allPhotos);
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === itemId
                            ? { ...i, photo_url: newPhotoUrl }
                            : i,
                        ),
                      );
                      toast.success(
                        `${newBase64s.length} file${newBase64s.length > 1 ? "s" : ""} uploaded!`,
                      );
                      try {
                        const res = await fetch(`/api/buckets/${itemId}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ photo_url: newPhotoUrl }),
                        });
                        if (!res.ok) throw new Error("Failed to upload");
                      } catch {
                        setItems((prev) =>
                          prev.map((i) =>
                            i.id === itemId
                              ? { ...i, photo_url: originalPhotoUrl }
                              : i,
                          ),
                        );
                        toast.error("Failed to upload photos");
                      }
                    }
                  };
                  reader.readAsDataURL(file);
                });
              }
              e.target.value = "";
              setUploadingItemId(null);
            }}
          />

          {/* Hidden File Input for Completion Photo */}
          <input
            ref={completeFileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                Array.from(files).forEach((file) => {
                  if (file.size > 10 * 1024 * 1024) {
                    toast.error(`${file.name} is over 10MB`);
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    setCompletePhotos((prev) => [
                      ...prev,
                      reader.result as string,
                    ]);
                  };
                  reader.readAsDataURL(file);
                });
              }
              e.target.value = "";
            }}
          />

          {/* Delete Item Confirmation Modal */}
          {deletingItem && (
            <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  setDeletingItem(null);
                  setDeleteItemConfirm("");
                }}
              />
              <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center">
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ color: "#722f37" }}
                >
                  Delete Goal?
                </h3>
                <p className="text-sm mb-1" style={{ color: "#b76e79" }}>
                  <strong>{deletingItem.title}</strong>
                </p>
                <p
                  className="text-xs mb-4"
                  style={{ color: "rgba(183,110,121,0.8)" }}
                >
                  This goal will be permanently removed.
                </p>
                <p className="text-xs mb-2" style={{ color: "#722f37" }}>
                  Type <strong>i love you</strong> to confirm
                </p>
                <input
                  type="text"
                  value={deleteItemConfirm}
                  onChange={(e) => setDeleteItemConfirm(e.target.value)}
                  placeholder="i love you"
                  className="input-field text-sm w-full mb-4"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDeleteItem(deletingItem.id);
                  }}
                />
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleDeleteItem(deletingItem.id)}
                    className="text-sm px-5 py-2 rounded-pill text-white"
                    style={{ backgroundColor: "#722f37" }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setDeletingItem(null);
                      setDeleteItemConfirm("");
                    }}
                    className="text-sm px-5 py-2 rounded-pill border border-rose/20 hover:bg-blush"
                    style={{ color: "#b76e79" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Media Viewer Modal */}
          {viewingImage && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70"
              onClick={() => setViewingImage(null)}
            >
              <div className="relative max-w-2xl max-h-[85vh]">
                {viewingImage.startsWith("data:video/") ? (
                  <video
                    src={viewingImage}
                    controls
                    autoPlay
                    className="max-w-full max-h-[85vh] rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <img
                    src={viewingImage}
                    alt="Uploaded photo"
                    className="max-w-full max-h-[85vh] object-contain rounded-2xl"
                  />
                )}
                <button
                  onClick={() => setViewingImage(null)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
