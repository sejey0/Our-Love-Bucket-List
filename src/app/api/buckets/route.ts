import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "sort_order";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    let query = supabase.from("buckets").select("*");

    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    if (status && status !== "All") {
      query = query.eq("status", status);
    }
    if (priority && priority !== "All") {
      query = query.eq("priority", priority);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const ascending = sortOrder === "asc";
    query = query.order(sortBy, { ascending });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch bucket items" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: maxOrder } = await supabase
      .from("buckets")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const newOrder = maxOrder ? maxOrder.sort_order + 1 : 0;

    const { data, error } = await supabase
      .from("buckets")
      .insert([
        {
          title: body.title,
          description: body.description || "",
          category: body.category || "Personal",
          target_date: body.target_date || null,
          status: body.status || "Not Started",
          priority: body.priority || "Medium",
          user_id: "default",
          sort_order: newOrder,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create bucket item" },
      { status: 500 },
    );
  }
}
