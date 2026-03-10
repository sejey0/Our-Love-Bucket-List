import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: { id: string; sort_order: number }[] };

    const updates = items.map((item) =>
      supabase
        .from("buckets")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id),
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reorder items" },
      { status: 500 },
    );
  }
}
