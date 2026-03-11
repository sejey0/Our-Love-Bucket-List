import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get("checklist_id");

    let query = supabase
      .from("checklist_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (checklistId) {
      query = query.eq("checklist_id", checklistId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch checklist items" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: maxOrderRows } = await supabase
      .from("checklist_items")
      .select("sort_order")
      .eq("checklist_id", body.checklist_id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const newOrder =
      maxOrderRows && maxOrderRows.length > 0
        ? maxOrderRows[0].sort_order + 1
        : 0;

    const { data, error } = await supabase
      .from("checklist_items")
      .insert([
        {
          title: body.title,
          checklist_id: body.checklist_id,
          is_completed: false,
          sort_order: newOrder,
          user_id: "default",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 },
    );
  }
}
