"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { BucketItem } from "@/types/bucket";
import Header from "./Header";

interface BucketList {
  id: string;
  name: string;
  description: string;
}

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [bucketLists, setBucketLists] = useState<BucketList[]>([]);
  const [items, setItems] = useState<BucketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [viewingList, setViewingList] = useState<BucketList | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Load custom bucket lists from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("bucket-lists");
    if (stored) {
      setBucketLists(JSON.parse(stored));
    }
  }, []);

  // Save bucket lists to localStorage
  const saveBucketLists = (lists: BucketList[]) => {
    setBucketLists(lists);
    localStorage.setItem("bucket-lists", JSON.stringify(lists));
  };

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/buckets");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
    } catch {
      toast.error("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    const newList: BucketList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      description: newListDesc.trim(),
    };
    saveBucketLists([...bucketLists, newList]);
    setNewListName("");
    setNewListDesc("");
    setShowCreateForm(false);
    toast.success("Bucket list created!");
  };

  const handleDeleteList = (id: string) => {
    saveBucketLists(bucketLists.filter((l) => l.id !== id));
    toast.success("Bucket list removed");
  };

  const handleAddItem = async (category: string) => {
    const title = newItems[category]?.trim();
    if (!title) {
      toast.error("Please enter an item");
      return;
    }
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
      toast.success("Added!");
      setNewItems((prev) => ({ ...prev, [category]: "" }));
      fetchItems();
    } catch {
      toast.error("Failed to add item");
    }
  };

  const handleToggleComplete = async (item: BucketItem) => {
    const newStatus = item.status === "Completed" ? "Not Started" : "Completed";
    try {
      const res = await fetch(`/api/buckets/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchItems();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/buckets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Removed!");
      fetchItems();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEditItem = async (id: string) => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    try {
      const res = await fetch(`/api/buckets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Updated!");
      setEditingItem(null);
      setEditTitle("");
      fetchItems();
    } catch {
      toast.error("Failed to update");
    }
  };

  const getItemsByCategory = (category: string) =>
    items.filter((item) => item.category === category);

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

      <Header onLogout={onLogout} />

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
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewListName("");
                      setNewListDesc("");
                    }}
                    className="px-4 py-2 text-sm rounded-pill border border-rose/20 text-rose-gold hover:bg-blush transition-all duration-300"
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
                (i) => i.status === "Completed"
              ).length;

              return (
                <div key={list.id} className="card flex flex-col">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-gradient">
                        {list.name}
                      </h2>
                      {list.description && (
                        <p className="text-xs text-rose-gold/50 mt-0.5">
                          {list.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="text-rose/30 hover:text-wine transition-colors duration-300"
                      title="Delete bucket list"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

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

                  {/* View Button */}
                  <button
                    onClick={() => setViewingList(list)}
                    className="w-full py-2 text-xs font-semibold rounded-pill border border-rose/20 hover:bg-blush transition-all duration-300"
                    style={{ color: "#b76e79" }}
                  >
                    View List ({categoryItems.length})
                  </button>
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
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setViewingList(null);
              setEditingItem(null);
            }}
          />

          {/* Modal */}
          <div
            className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-fade-in"
          >
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
              ) : getItemsByCategory(viewingList.name).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-rose-gold/40 italic">
                    No goals yet. Add one above!
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {getItemsByCategory(viewingList.name).map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        item.status === "Completed"
                          ? "bg-petal/50 opacity-60"
                          : "bg-white hover:bg-blush/20"
                      }`}
                      style={{ border: "1px solid rgba(232,160,160,0.15)" }}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleComplete(item)}
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={
                          item.status === "Completed"
                            ? {
                                borderColor: "#b76e79",
                                backgroundColor: "#b76e79",
                              }
                            : { borderColor: "rgba(232,160,160,0.4)" }
                        }
                        title={
                          item.status === "Completed"
                            ? "Mark as not done"
                            : "Mark as done"
                        }
                      >
                        {item.status === "Completed" && (
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

                      {/* Title or Edit Input */}
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
                              className="text-xs px-2 py-1 rounded-pill border border-rose/20 text-rose-gold hover:bg-blush transition-all duration-300"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <span
                            className={`text-sm block truncate ${
                              item.status === "Completed"
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
                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingItem(item.id);
                              setEditTitle(item.title);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blush/50 transition-all duration-300"
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

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-all duration-300"
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
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Modal Footer */}
            {getItemsByCategory(viewingList.name).length > 0 && (
              <div
                className="px-6 py-3 border-t border-rose/10 text-center text-xs font-semibold"
                style={{ color: "#b76e79" }}
              >
                {
                  getItemsByCategory(viewingList.name).filter(
                    (i) => i.status === "Completed"
                  ).length
                }{" "}
                of {getItemsByCategory(viewingList.name).length} completed
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
