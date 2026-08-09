export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import {
  getCurrentUserId,
  getUserGroupIds,
  getUserName,
  computeUserGroupBalance,
  logActivity,
} from "@/lib/database";

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  const groupIds = await getUserGroupIds(supabase, me);
  if (groupIds.length === 0) return new Response(JSON.stringify({ groups: [] }));

  const { data: rows } = await supabase
    .from("group_members")
    .select(`group_id, groups ( id, group_name, image_url, type, created_at )`)
    .eq("user_id", me);

  const groups: any[] = [];
  const idToGroup = new Map<number, any>();
  for (const r of rows ?? []) {
    const g = r.groups;
    if (!g) continue;
    idToGroup.set(g.id, {
      id: g.id,
      name: g.group_name,
      image_url: g.image_url,
      type: g.type,
      members: 0,
      balance: 0,
      totalSettls: 0,
      totalSpent: 0,
      lastActive: null,
    });
    groups.push(idToGroup.get(g.id));
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("group_id, value_amout, created_at")
    .in("group_id", groupIds);
  for (const e of expenses ?? []) {
    const g = idToGroup.get(e.group_id);
    if (!g) continue;
    g.totalSpent = Math.round((g.totalSpent + Number(e.value_amout)) * 100) / 100;
    if (!g.lastActive || new Date(e.created_at) > new Date(g.lastActive)) g.lastActive = e.created_at;
  }

  const { data: settlements } = await supabase
    .from("settlements")
    .select("group_id, created_at")
    .in("group_id", groupIds);
  for (const s of settlements ?? []) {
    const g = idToGroup.get(s.group_id);
    if (!g) continue;
    g.totalSettls += 1;
    if (!g.lastActive || new Date(s.created_at) > new Date(g.lastActive)) g.lastActive = s.created_at;
  }

  const { data: members } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", groupIds);
  for (const m of members ?? []) {
    const g = idToGroup.get(m.group_id);
    if (g) g.members += 1;
  }

  for (const g of groups) {
    g.balance = await computeUserGroupBalance(supabase, me, g.id);
  }

  return new Response(JSON.stringify({ groups }));
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient({ request, cookies });
  const me = await getCurrentUserId(supabase);
  if (!me) return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Invalid JSON" }), { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return new Response(JSON.stringify({ success: false, message: "Group name is required" }), { status: 400 });
  }

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      group_name: name,
      image_url: typeof body.imageUrl === "string" && body.imageUrl ? body.imageUrl : null,
      type: typeof body.type === "string" && body.type ? body.type : "other",
      created_by: me,
    })
    .select("id, group_name")
    .single();

  if (error || !group) {
    return new Response(JSON.stringify({ success: false, message: error?.message || "Could not create group" }), { status: 500 });
  }

  await supabase.from("group_members").insert({ user_id: me, group_id: group.id });
  await logActivity(supabase, me, "group_created", group.id, {});

  return new Response(JSON.stringify({ success: true, group: { id: group.id, name: group.group_name } }));
};
