"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { ChecklistGroup, ChecklistItem } from "@/types/bucket";

export default function ChecklistDashboard() {
  const [checklists, setChecklists] = useState<ChecklistGroup[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [viewingChecklist, setViewingChecklist] =
    useState<ChecklistGroup | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [renamingList, setRenamingList] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingList, setDeletingList] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "default",
    };
    setChecklists((prev) => [...prev, tempList]);
    setNewListName("");
    setNewListDesc("");
    setShowCreateForm(false);
    toast.success("Checklist created!");
    try {
      const res = await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tempList.name,
          description: tempList.description,
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
    toast.success("Renamed!");
    try {
      const res = await fetch(`/api/checklists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error("Failed to rename");
    } catch {
      setChecklists(original);
      toast.error("Failed to rename checklist");
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
    setChecklistItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, is_completed: newStatus } : i,
      ),
    );
    try {
      const res = await fetch(`/api/checklist-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      setChecklistItems((prev) =>
        prev.map((i) => (i.id === item.id ? item : i)),
      );
      toast.error("Failed to update");
    }
  };

  const handleDeleteItem = async (id: string) => {
    const original = checklistItems.find((i) => i.id === id);
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
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewListName("");
                      setNewListDesc("");
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
                      {renamingList === list.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleRenameChecklist(list.id);
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
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
                        <>
                          <h2 className="text-base font-bold text-gradient">
                            {list.name}
                          </h2>
                          {list.description && (
                            <p className="text-xs text-rose-gold/50 mt-0.5">
                              {list.description}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    {renamingList !== list.id && (
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <button
                          onClick={() => {
                            setRenamingList(list.id);
                            setRenameValue(list.name);
                          }}
                          className="p-1 rounded-lg hover:bg-blush/50 transition-colors duration-150"
                          style={{ color: "#b76e79" }}
                          title="Rename"
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

                  {/* View Button */}
                  <button
                    onClick={() => setViewingChecklist(list)}
                    className="w-full py-2 text-xs font-semibold rounded-pill border border-rose/20 hover:bg-blush transition-colors duration-150"
                    style={{ color: "#b76e79" }}
                  >
                    View All ({listItems.length})
                  </button>
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
              {getItemsByChecklist(viewingChecklist.id).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-rose-gold/40 italic">
                    No items yet. Add one above!
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {getItemsByChecklist(viewingChecklist.id).map((item) => (
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
                            <button
                              onClick={() => {
                                setEditingItem(item.id);
                                setEditTitle(item.title);
                              }}
                              className="p-1.5 rounded-lg hover:bg-blush/50 transition-colors duration-150"
                              style={{ color: "#b76e79" }}
                              title="Edit"
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
                            <button
                              onClick={() => handleDeleteItem(item.id)}
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
                    (i) => i.is_completed,
                  ).length
                }
                /{getItemsByChecklist(viewingChecklist.id).length} completed
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
