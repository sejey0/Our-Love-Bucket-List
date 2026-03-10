"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import { BucketItem } from "@/types/bucket";
import Header from "./Header";
import BucketForm from "./BucketForm";
import BucketCard from "./BucketCard";
import FilterBar from "./FilterBar";
import ProgressBar from "./ProgressBar";
import CategoryChart from "./CategoryChart";
import QuoteCard from "./QuoteCard";
import ExportButton from "./ExportButton";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [allItems, setAllItems] = useState<BucketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editItem, setEditItem] = useState<BucketItem | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("sort_order");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (priorityFilter !== "All") params.set("priority", priorityFilter);
      if (search) params.set("search", search);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/buckets?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      toast.error("Failed to load bucket items");
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, statusFilter, priorityFilter, search, sortBy, sortOrder]);

  const fetchAllItems = useCallback(async () => {
    try {
      const res = await fetch("/api/buckets");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAllItems(data);
    } catch {
      // Silently fail for stats
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchAllItems();
  }, [fetchAllItems]);

  const handleAdd = async (itemData: Partial<BucketItem>) => {
    try {
      const res = await fetch("/api/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("Dream added to the list! 💕");
      fetchItems();
      fetchAllItems();
    } catch {
      toast.error("Failed to add item");
    }
  };

  const handleUpdate = async (itemData: Partial<BucketItem>) => {
    if (!editItem) return;
    try {
      const res = await fetch(`/api/buckets/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Item updated! ✨");
      setEditItem(null);
      fetchItems();
      fetchAllItems();
    } catch {
      toast.error("Failed to update item");
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
      if (newStatus === "Completed") {
        toast.success("Dream achieved! 🎉🥳", { duration: 3000 });
      } else {
        toast("Marked as not started", { icon: "↩️" });
      }
      fetchItems();
      fetchAllItems();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/buckets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Item removed");
      fetchItems();
      fetchAllItems();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || sortBy !== "sort_order") return;

    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updated = reordered.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    setItems(updated);

    try {
      await fetch("/api/buckets/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updated.map((item) => ({
            id: item.id,
            sort_order: item.sort_order,
          })),
        }),
      });
    } catch {
      toast.error("Failed to save order");
      fetchItems();
    }
  };

  return (
    <div className="min-h-screen">
      <Header onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quote */}
        <QuoteCard />

        {/* Progress and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressBar items={allItems} />
          <CategoryChart items={allItems} />
        </div>

        {/* Add/Edit Form */}
        {editItem ? (
          <div>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Edit Item
            </h2>
            <BucketForm
              onSubmit={handleUpdate}
              editItem={editItem}
              onCancel={() => setEditItem(null)}
            />
          </div>
        ) : (
          <BucketForm onSubmit={handleAdd} />
        )}

        {/* Export and share */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Our Dreams ({items.length})
          </h2>
          <ExportButton items={allItems} />
        </div>

        {/* Filters */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {/* Bucket List Items */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Loading your dreams...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
              {search ||
              categoryFilter !== "All" ||
              statusFilter !== "All" ||
              priorityFilter !== "All"
                ? "No items match your filters"
                : "No dreams yet!"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {search ||
              categoryFilter !== "All" ||
              statusFilter !== "All" ||
              priorityFilter !== "All"
                ? "Try adjusting your filters"
                : "Add your first bucket list item above to get started"}
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="bucket-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3"
                >
                  {items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                      isDragDisabled={sortBy !== "sort_order"}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div className="flex items-start gap-2">
                            {sortBy === "sort_order" && (
                              <div
                                {...provided.dragHandleProps}
                                className="mt-6 p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                  />
                                </svg>
                              </div>
                            )}
                            <div className="flex-1">
                              <BucketCard
                                item={item}
                                onToggleComplete={handleToggleComplete}
                                onEdit={setEditItem}
                                onDelete={handleDelete}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">
        Made with 💕 for our adventures together
      </footer>
    </div>
  );
}
