import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { data, error } = await supabase
      .from("buckets")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch bucket item" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.target_date !== undefined)
      updateData.target_date = body.target_date;
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "Completed") {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
    }
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    if (body.photo_url !== undefined) updateData.photo_url = body.photo_url;

    const { data, error } = await supabase
      .from("buckets")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update bucket item" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { error } = await supabase
      .from("buckets")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete bucket item" },
      { status: 500 },
    );
  }
}
