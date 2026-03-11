"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { ChecklistGroup, ChecklistItem } from "@/types/bucket";

export default function ChecklistDashboard() {
  const [checklists, setChecklists] = useState<ChecklistGroup[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newListDate, setNewListDate] = useState("");
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [viewingChecklist, setViewingChecklist] =
    useState<ChecklistGroup | null>(null);
  const [viewingCompleted, setViewingCompleted] =
    useState<ChecklistGroup | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [renamingList, setRenamingList] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [editingListDesc, setEditingListDesc] = useState<string | null>(null);
  const [editListDescValue, setEditListDescValue] = useState("");
  const [editingListDate, setEditingListDate] = useState<string | null>(null);
  const [editListDateValue, setEditListDateValue] = useState("");
  const [deletingList, setDeletingList] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [editCounts, setEditCounts] = useState<Record<string, number>>({});
  const [completingItem, setCompletingItem] = useState<ChecklistItem | null>(
    null,
  );
  const [completeDesc, setCompleteDesc] = useState("");
  const [completePhotos, setCompletePhotos] = useState<string[]>([]);
  const [completeDate, setCompleteDate] = useState("");
  const [viewingDetailItem, setViewingDetailItem] =
    useState<ChecklistItem | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editNotesValue, setEditNotesValue] = useState("");
  const [deletingImageIdx, setDeletingImageIdx] = useState<number | null>(null);
  const [deleteImageConfirm, setDeleteImageConfirm] = useState("");
  const [undoingItem, setUndoingItem] = useState<ChecklistItem | null>(null);
  const [undoConfirm, setUndoConfirm] = useState("");
  const [deletingItem, setDeletingItem] = useState<ChecklistItem | null>(null);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState("");
  const completeFileRef = useRef<HTMLInputElement>(null);

  const handleUpdateNotes = async (itemId: string, newDescription: string) => {
    const original = checklistItems.find((i) => i.id === itemId);
    const desc = newDescription.trim();
    setChecklistItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, description: desc || "" } : i,
      ),
    );
    if (viewingDetailItem && viewingDetailItem.id === itemId) {
      setViewingDetailItem({
        ...viewingDetailItem,
        description: desc || "",
      });
    }
    setEditingNotes(false);
    setEditNotesValue("");
    incrementEditCount(itemId, "notes");
    toast.success("Notes updated!");
    try {
      const res = await fetch(`/api/checklist-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc || "" }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      if (original)
        setChecklistItems((prev) =>
          prev.map((i) => (i.id === itemId ? original : i)),
        );
      toast.error("Failed to update notes");
    }
  };

  const handleDeleteSingleImage = async (itemId: string, imageIdx: number) => {
    if (deleteImageConfirm.toLowerCase() !== "i love you") {
      toast.error("Type 'i love you' to confirm deletion");
      return;
    }
    const item = checklistItems.find((i) => i.id === itemId);
    if (!item) return;
    const mediaUrls = getMediaUrls(item.photo_url);
    const newUrls = mediaUrls.filter((_, idx) => idx !== imageIdx);
    const newPhotoUrl = newUrls.length > 0 ? JSON.stringify(newUrls) : null;
    const originalPhotoUrl = item.photo_url;
    setChecklistItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, photo_url: newPhotoUrl } : i)),
    );
    if (viewingDetailItem && viewingDetailItem.id === itemId) {
      setViewingDetailItem({ ...viewingDetailItem, photo_url: newPhotoUrl });
    }
    setDeletingImageIdx(null);
    setDeleteImageConfirm("");
    toast.success("Image deleted!");
    try {
      const res = await fetch(`/api/checklist-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: newPhotoUrl }),
      });
      if (!res.ok) throw new Error("Failed to delete image");
    } catch {
      setChecklistItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, photo_url: originalPhotoUrl } : i,
        ),
      );
      toast.error("Failed to delete image");
    }
  };

  const fetchChecklists = useCallback(async () => {
    try {
      const res = await fetch("/api/checklists");
      if (!res.ok) throw new Error("Failed to fetch checklists");
      const data = await res.json();
      setChecklists(data);
    } catch {
      console.error("Failed to fetch checklists");
    }
  }, []);

  const fetchChecklistItems = useCallback(async () => {
    try {
      const res = await fetch("/api/checklist-items");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setChecklistItems(data);
    } catch {
      console.error("Failed to fetch checklist items");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecklists();
    fetchChecklistItems();
  }, [fetchChecklists, fetchChecklistItems]);

  const handleCreateChecklist = async () => {
    if (!newListName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    const tempList: ChecklistGroup = {
      id: `temp-${Date.now()}`,
      name: newListName.trim(),
      description: newListDesc.trim(),
      target_date: newListDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "default",
    };
    setChecklists((prev) => [...prev, tempList]);
    setNewListName("");
    setNewListDesc("");
    setNewListDate("");
    setShowCreateForm(false);
    toast.success("Checklist created!");
    try {
      const res = await fetch("/api/checklists", {
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
      setChecklists((prev) =>
        prev.map((l) => (l.id === tempList.id ? created : l)),
      );
    } catch {
      setChecklists((prev) => prev.filter((l) => l.id !== tempList.id));
      toast.error("Failed to save checklist");
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    if (deleteConfirm.toLowerCase() !== "i love you") {
      toast.error("Type 'i love you' to confirm deletion");
      return;
    }
    const original = checklists;
    setChecklists(checklists.filter((l) => l.id !== id));
    setChecklistItems((prev) => prev.filter((i) => i.checklist_id !== id));
    setDeletingList(null);
    setDeleteConfirm("");
    toast.success("Checklist removed");
    try {
      const res = await fetch(`/api/checklists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    } catch {
      setChecklists(original);
      fetchChecklistItems();
      toast.error("Failed to delete checklist");
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

  const handleRenameChecklist = async (id: string) => {
    if (!renameValue.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const original = checklists;
    const newName = renameValue.trim();
    setChecklists(
      checklists.map((l) => (l.id === id ? { ...l, name: newName } : l)),
    );
    setRenamingList(null);
    setRenameValue("");
    incrementEditCount(id, "name");
    toast.success("Name updated!");
    try {
      const res = await fetch(`/api/checklists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setChecklists(original);
      toast.error("Failed to update name");
    }
  };

  const handleEditListDesc = async (id: string) => {
    const original = checklists;
    const newDesc = editListDescValue.trim();
    setChecklists(
      checklists.map((l) => (l.id === id ? { ...l, description: newDesc } : l)),
    );
    setEditingListDesc(null);
    setEditListDescValue("");
    incrementEditCount(id, "description");
    toast.success("Description updated!");
    try {
      const res = await fetch(`/api/checklists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newDesc }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setChecklists(original);
      toast.error("Failed to update description");
    }
  };

  const handleEditListDate = async (id: string) => {
    const original = checklists;
    const newDate = editListDateValue || null;
    setChecklists(
      checklists.map((l) => (l.id === id ? { ...l, target_date: newDate } : l)),
    );
    setEditingListDate(null);
    setEditListDateValue("");
    incrementEditCount(id, "date");
    toast.success("Date updated!");
    try {
      const res = await fetch(`/api/checklists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_date: newDate }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setChecklists(original);
      toast.error("Failed to update date");
    }
  };

  const handleAddItem = async (checklistId: string) => {
    const title = newItems[checklistId]?.trim();
    if (!title) {
      toast.error("Please enter an item");
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const tempItem: ChecklistItem = {
      id: tempId,
      title,
      checklist_id: checklistId,
      is_completed: false,
      sort_order: checklistItems.filter((i) => i.checklist_id === checklistId)
        .length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "default",
      completed_at: null,
      description: "",
      photo_url: null,
    };
    setChecklistItems((prev) => [...prev, tempItem]);
    setNewItems((prev) => ({ ...prev, [checklistId]: "" }));
    toast.success("Added!");
    try {
      const res = await fetch("/api/checklist-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, checklist_id: checklistId }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const created = await res.json();
      setChecklistItems((prev) =>
        prev.map((i) => (i.id === tempId ? created : i)),
      );
    } catch {
      setChecklistItems((prev) => prev.filter((i) => i.id !== tempId));
      toast.error("Failed to add item");
    }
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    const newStatus = !item.is_completed;
    if (newStatus) {
      // Opening completion modal instead of toggling directly
      setCompletingItem(item);
      setCompleteDesc("");
      setCompletePhotos([]);
      setCompleteDate(new Date().toISOString().split("T")[0]);
    } else {
      // Show undo confirmation
      setUndoingItem(item);
      setUndoConfirm("");
    }
  };

  const handleConfirmUndo = async () => {
    if (!undoingItem) return;
    if (undoConfirm.toLowerCase() !== "i love you") {
      toast.error("Type 'i love you' to confirm");
      return;
    }
    const item = undoingItem;
    setUndoingItem(null);
    setUndoConfirm("");
    setChecklistItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              is_completed: false,
              completed_at: null,
              description: "",
              photo_url: null,
            }
          : i,
      ),
    );
    try {
      const res = await fetch(`/api/checklist-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_completed: false,
          completed_at: null,
          description: "",
          photo_url: null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setChecklistItems((prev) =>
        prev.map((i) => (i.id === item.id ? item : i)),
      );
      toast.error("Failed to update");
    }
  };

  const handleConfirmComplete = async () => {
    if (!completingItem) return;
    const completedAt = completeDate
      ? new Date(completeDate).toISOString()
      : new Date().toISOString();
    const desc = completeDesc.trim();
    const photoUrl =
      completePhotos.length > 0 ? JSON.stringify(completePhotos) : null;
    const original = completingItem;
    setChecklistItems((prev) =>
      prev.map((i) =>
        i.id === completingItem.id
          ? {
              ...i,
              is_completed: true,
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
        is_completed: true,
        description: desc,
        completed_at: completedAt,
      };
      if (completePhotos.length > 0)
        updateData.photo_url = JSON.stringify(completePhotos);
      const res = await fetch(`/api/checklist-items/${original.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setChecklistItems((prev) =>
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
    const original = checklistItems.find((i) => i.id === id);
    setDeletingItem(null);
    setDeleteItemConfirm("");
    setChecklistItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Removed!");
    try {
      const res = await fetch(`/api/checklist-items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    } catch {
      if (original) setChecklistItems((prev) => [...prev, original]);
      toast.error("Failed to delete");
    }
  };

  const handleEditItem = async (id: string) => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    const original = checklistItems.find((i) => i.id === id);
    const newTitle = editTitle.trim();
    setChecklistItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, title: newTitle } : i)),
    );
    incrementEditCount(id, "title");
    toast.success("Updated!");
    setEditingItem(null);
    setEditTitle("");
    try {
      const res = await fetch(`/api/checklist-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      if (original)
        setChecklistItems((prev) =>
          prev.map((i) => (i.id === id ? original : i)),
        );
      toast.error("Failed to update");
    }
  };

  const getItemsByChecklist = (checklistId: string) =>
    checklistItems.filter((item) => item.checklist_id === checklistId);

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

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-4 border-petal border-t-rose-gold rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        {/* Create New Checklist Button */}
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
              Create Checklist
            </button>
          ) : (
            <div className="card max-w-md">
              <h3 className="text-lg font-bold text-gradient mb-3">
                New Checklist
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Name (e.g., Date Night Ideas)"
                  className="input-field text-sm py-2"
                  autoFocus
                />
                <input
                  type="text"
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Description (optional)"
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
                    style={{ color: "rgba(183,110,121,0.6)" }}
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
                    onClick={handleCreateChecklist}
                    className="btn-primary text-sm px-5 py-2"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Checklist Cards */}
        {checklists.length === 0 && !showCreateForm ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-5xl mb-3">&#x2611;</div>
            <h3 className="text-xl font-bold text-gradient mb-2">
              No checklists yet
            </h3>
            <p className="text-xs text-rose-gold/50">
              Create your first checklist to start tracking tasks together
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checklists.map((list) => {
              const listItems = getItemsByChecklist(list.id);
              const completedCount = listItems.filter(
                (i) => i.is_completed,
              ).length;
              const progress =
                listItems.length > 0
                  ? Math.round((completedCount / listItems.length) * 100)
                  : 0;

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
                            handleRenameChecklist(list.id);
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
                            {!editingListDate || editingListDate !== list.id ? (
                              <>
                                {list.target_date && (
                                  <span
                                    className="text-xs font-normal ml-1"
                                    style={{ color: "rgba(183,110,121,0.7)" }}
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
                                  setEditListDateValue(list.target_date || "");
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
                                setEditListDescValue(list.description || "");
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

                  {/* Created Date */}
                  {list.created_at && (
                    <p className="text-xs text-rose-gold/40 mb-2">
                      Created{" "}
                      {new Date(list.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}

                  {/* Delete Confirmation */}
                  {deletingList === list.id && (
                    <div
                      className="mb-3 p-3 rounded-xl"
                      style={{
                        border: "1px solid rgba(114,47,55,0.2)",
                        backgroundColor: "rgba(114,47,55,0.05)",
                      }}
                    >
                      <p className="text-xs mb-2" style={{ color: "#722f37" }}>
                        Type <strong>i love you</strong> to confirm deletion
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleDeleteChecklist(list.id);
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

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-rose-gold/60">
                        {completedCount}/{listItems.length} done
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "#b76e79" }}
                      >
                        {progress}%
                      </span>
                    </div>
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "rgba(183,110,121,0.1)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: "#b76e79",
                        }}
                      />
                    </div>
                  </div>

                  {/* Add Item Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddItem(list.id);
                    }}
                    className="flex gap-2 mb-3"
                  >
                    <input
                      type="text"
                      value={newItems[list.id] || ""}
                      onChange={(e) =>
                        setNewItems((prev) => ({
                          ...prev,
                          [list.id]: e.target.value,
                        }))
                      }
                      placeholder="Add an item..."
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
                      onClick={() => setViewingChecklist(list)}
                      className="flex-1 py-2 text-xs font-semibold rounded-pill border border-rose/20 hover:bg-blush transition-colors duration-150"
                      style={{ color: "#b76e79" }}
                    >
                      View List ({listItems.length - completedCount})
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

      {/* View Checklist Modal */}
      {viewingChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setViewingChecklist(null);
              setEditingItem(null);
            }}
          />

          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{ backgroundColor: "#b76e79" }}
            >
              <div>
                <h2 className="text-lg font-bold text-white">
                  {viewingChecklist.name}
                </h2>
                {viewingChecklist.description && (
                  <p className="text-xs text-white/70">
                    {viewingChecklist.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setViewingChecklist(null);
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
                  handleAddItem(viewingChecklist.id);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newItems[viewingChecklist.id] || ""}
                  onChange={(e) =>
                    setNewItems((prev) => ({
                      ...prev,
                      [viewingChecklist.id]: e.target.value,
                    }))
                  }
                  placeholder="Add a new item..."
                  className="input-field flex-1 text-sm py-2"
                />
                <button type="submit" className="btn-primary text-xs px-4 py-2">
                  Add
                </button>
              </form>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-3">
              {getItemsByChecklist(viewingChecklist.id).filter(
                (i) => !i.is_completed,
              ).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-rose-gold/40 italic">
                    No items yet. Add one above!
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {getItemsByChecklist(viewingChecklist.id)
                    .filter((i) => !i.is_completed)
                    .map((item) => (
                      <li
                        key={item.id}
                        className="p-3 rounded-xl bg-white hover:bg-blush/20 transition-colors duration-150"
                        style={{ border: "1px solid rgba(232,160,160,0.15)" }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleItem(item)}
                            className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                              item.is_completed ? "" : "border-2"
                            }`}
                            style={
                              item.is_completed
                                ? { backgroundColor: "#b76e79" }
                                : { borderColor: "rgba(232,160,160,0.4)" }
                            }
                            title={
                              item.is_completed
                                ? "Mark as undone"
                                : "Mark as done"
                            }
                          >
                            {item.is_completed && (
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
                            )}
                          </button>

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
                                  onChange={(e) => setEditTitle(e.target.value)}
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
                              <span
                                className={`text-sm block truncate ${
                                  item.is_completed
                                    ? "line-through text-rose-gold/40"
                                    : "text-wine"
                                }`}
                              >
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
              )}
            </div>

            {/* Modal Footer */}
            {getItemsByChecklist(viewingChecklist.id).length > 0 && (
              <div
                className="px-6 py-3 border-t border-rose/10 text-center text-xs font-semibold"
                style={{ color: "#b76e79" }}
              >
                {
                  getItemsByChecklist(viewingChecklist.id).filter(
                    (i) => !i.is_completed,
                  ).length
                }{" "}
                remaining
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed Modal */}
      {viewingCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setViewingCompleted(null)}
          />

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
                    getItemsByChecklist(viewingCompleted.id).filter(
                      (i) => i.is_completed,
                    ).length
                  }{" "}
                  tasks done
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
              {getItemsByChecklist(viewingCompleted.id).filter(
                (i) => i.is_completed,
              ).length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-rose-gold/40 italic">
                    No completed tasks yet.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {getItemsByChecklist(viewingCompleted.id)
                    .filter((i) => i.is_completed)
                    .map((item) => (
                      <li
                        key={item.id}
                        className="p-3.5 rounded-xl bg-petal/50 transition-colors duration-150"
                        style={{
                          border: "1px solid rgba(232,160,160,0.15)",
                        }}
                      >
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
                            {/* View details */}
                            <button
                              onClick={() => setViewingDetailItem(item)}
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
                            {/* Undo button */}
                            <button
                              onClick={() => handleToggleItem(item)}
                              className="p-1.5 rounded-lg hover:bg-blush/50 transition-colors duration-150"
                              style={{ color: "#b76e79" }}
                              title="Mark as undone"
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
                                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
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
                                  color: "rgba(183,110,121,0.6)",
                                }}
                              >
                                Completed on{" "}
                                {new Date(item.completed_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
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
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setCompletingItem(null);
              setCompleteDesc("");
              setCompletePhotos([]);
            }}
          />

          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div
              className="px-6 py-4 border-b"
              style={{ backgroundColor: "#b76e79" }}
            >
              <h2 className="text-lg font-bold text-white">Mark as Done</h2>
              <p className="text-xs text-white/70 mt-0.5">
                {completingItem.title}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
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
                    color: "rgba(183,110,121,0.6)",
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
                setCompletePhotos((prev) => [...prev, reader.result as string]);
              };
              reader.readAsDataURL(file);
            });
          }
          e.target.value = "";
        }}
      />

      {/* Detail View Modal */}
      {viewingDetailItem && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setViewingDetailItem(null);
              setEditingNotes(false);
              setEditNotesValue("");
              setDeletingImageIdx(null);
              setDeleteImageConfirm("");
            }}
          />

          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div
              className="px-6 py-5 flex items-center justify-between border-b"
              style={{ backgroundColor: "#b76e79" }}
            >
              <div className="flex-1 min-w-0 mr-3">
                <h2 className="text-lg font-bold text-white truncate">
                  {viewingDetailItem.title}
                </h2>
                {viewingDetailItem.completed_at && (
                  <p className="text-xs text-white/70 mt-0.5">
                    Completed on{" "}
                    {new Date(
                      viewingDetailItem.completed_at,
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setViewingDetailItem(null);
                  setEditingNotes(false);
                  setEditNotesValue("");
                  setDeletingImageIdx(null);
                  setDeleteImageConfirm("");
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3
                    className="text-xs font-semibold"
                    style={{ color: "#b76e79" }}
                  >
                    Notes
                  </h3>
                  {!editingNotes && canEdit(viewingDetailItem.id, "notes") && (
                    <button
                      onClick={() => {
                        setEditingNotes(true);
                        setEditNotesValue(viewingDetailItem.description || "");
                      }}
                      className="p-0.5 rounded hover:bg-blush/30 transition-colors"
                      style={{ color: "#b76e79" }}
                      title="Edit notes"
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
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
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
                      className="input-field text-sm w-full"
                      rows={3}
                      placeholder="Add notes..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleUpdateNotes(
                            viewingDetailItem.id,
                            editNotesValue,
                          )
                        }
                        className="text-xs px-3 py-1.5 rounded-pill text-white"
                        style={{ backgroundColor: "#b76e79" }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(false);
                          setEditNotesValue("");
                        }}
                        className="text-xs px-3 py-1.5 rounded-pill border border-rose/20 hover:bg-blush"
                        style={{ color: "#b76e79" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : viewingDetailItem.description ? (
                  <p className="text-sm" style={{ color: "#722f37" }}>
                    {viewingDetailItem.description}
                  </p>
                ) : canEdit(viewingDetailItem.id, "notes") ? (
                  <p
                    className="text-sm text-rose-gold/30 italic cursor-pointer hover:text-rose-gold/50 transition-colors"
                    onClick={() => {
                      setEditingNotes(true);
                      setEditNotesValue("");
                    }}
                  >
                    No notes yet. Click to add.
                  </p>
                ) : (
                  <p className="text-sm text-rose-gold/30 italic">
                    No notes added.
                  </p>
                )}
              </div>

              {/* Photos / Videos */}
              <div>
                <h3
                  className="text-xs font-semibold mb-2"
                  style={{ color: "#b76e79" }}
                >
                  Photos / Videos
                </h3>
                {getMediaUrls(viewingDetailItem.photo_url).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {getMediaUrls(viewingDetailItem.photo_url).map(
                      (url, idx) => {
                        const actualIdx = getMediaUrls(
                          viewingDetailItem.photo_url,
                        ).indexOf(url);
                        return (
                          <div
                            key={idx}
                            className="relative group rounded-xl overflow-hidden"
                            style={{
                              border: "1px solid rgba(183,110,121,0.15)",
                            }}
                          >
                            <div
                              className="cursor-pointer hover:opacity-80 transition-colors duration-150"
                              onClick={() => setViewingImage(url)}
                            >
                              {url.startsWith("data:video/") ? (
                                <div className="relative">
                                  <video
                                    src={url}
                                    className="w-full h-32 object-cover"
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
                              ) : (
                                <img
                                  src={url}
                                  alt={`Photo ${idx + 1}`}
                                  className="w-full h-32 object-cover"
                                />
                              )}
                            </div>
                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                setDeletingImageIdx(actualIdx);
                                setDeleteImageConfirm("");
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/80 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
                              style={{ color: "#722f37" }}
                              title="Delete"
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
                                    setDeleteImageConfirm(e.target.value)
                                  }
                                  placeholder="i love you"
                                  className="input-field text-xs py-1 px-2 w-full mb-1.5"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleDeleteSingleImage(
                                        viewingDetailItem.id,
                                        actualIdx,
                                      );
                                  }}
                                />
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleDeleteSingleImage(
                                        viewingDetailItem.id,
                                        actualIdx,
                                      )
                                    }
                                    className="text-xs px-2.5 py-1 rounded-pill text-white"
                                    style={{ backgroundColor: "#722f37" }}
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
                      },
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-rose-gold/30 italic">
                    No photos or videos added.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
            <h3 className="text-lg font-bold mb-1" style={{ color: "#722f37" }}>
              Delete Item?
            </h3>
            <p className="text-sm mb-1" style={{ color: "#b76e79" }}>
              <strong>{deletingItem.title}</strong>
            </p>
            <p
              className="text-xs mb-4"
              style={{ color: "rgba(183,110,121,0.6)" }}
            >
              This item will be permanently removed.
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

      {/* Undo Confirmation Modal */}
      {undoingItem && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setUndoingItem(null);
              setUndoConfirm("");
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold mb-1" style={{ color: "#722f37" }}>
              Mark as Undone?
            </h3>
            <p className="text-sm mb-1" style={{ color: "#b76e79" }}>
              <strong>{undoingItem.title}</strong>
            </p>
            <p
              className="text-xs mb-4"
              style={{ color: "rgba(183,110,121,0.6)" }}
            >
              This will clear the completion date, notes, and photos.
            </p>
            <p className="text-xs mb-2" style={{ color: "#722f37" }}>
              Type <strong>i love you</strong> to confirm
            </p>
            <input
              type="text"
              value={undoConfirm}
              onChange={(e) => setUndoConfirm(e.target.value)}
              placeholder="i love you"
              className="input-field text-sm w-full mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmUndo();
              }}
            />
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleConfirmUndo}
                className="text-sm px-5 py-2 rounded-pill text-white"
                style={{ backgroundColor: "#722f37" }}
              >
                Undo
              </button>
              <button
                onClick={() => {
                  setUndoingItem(null);
                  setUndoConfirm("");
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
                alt="Full view"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
